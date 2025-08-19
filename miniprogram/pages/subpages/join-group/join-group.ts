// pages/subpages/join-group/join-group.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {groupStoreUtil} from "../../../utils/store-utils/GroupStoreUtil";
import {LUMINA_SERVER_HOST} from "../../../env";
import {ErrorResponse, getErrorMessage, isNullOrEmptyOrUndefined} from "../../../utils/CommonUtil";
import {approvalStoreUtil} from "../../../utils/store-utils/ApprovalStoreUtil";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isJoining: boolean
    groupIdValue: string
    groupPreAuthTokenValue: string
    userIdValue: string
    userNameValue: string
    requesterCommentValue: string
    isUserSignedIn: boolean
    isLoading: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isJoining: false,
        groupIdValue: '',
        groupPreAuthTokenValue: '',
        userIdValue: '',
        userNameValue: '',
        requesterCommentValue: '',
        isUserSignedIn: false,
        isLoading: true,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...approvalStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...approvalStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isLoading: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isLoading: false
            })
            const userId = this.getUserInfo().userId
            const userName = this.getUserInfo().userName
            if (!isNullOrEmptyOrUndefined(userId) || !isNullOrEmptyOrUndefined(userName)) this.setData({
                isUserSignedIn: true, userIdValue: userId, userNameValue: userName
            })
        }
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, onGroupIdInput(e: WechatMiniprogram.Input) {
        this.setData({
            groupIdValue: e.detail.value
        })
    }, onGroupPreAuthTokenInput(e: WechatMiniprogram.Input) {
        this.setData({
            groupPreAuthTokenValue: e.detail.value
        })
    }, onUserIdInput(e: WechatMiniprogram.Input) {
        this.setData({
            userIdValue: e.detail.value
        })
    }, onUserNameInput(e: WechatMiniprogram.Input) {
        this.setData({
            userNameValue: e.detail.value
        })
    }, onRequesterCommentInput(e: WechatMiniprogram.Input) {
        this.setData({
            requesterCommentValue: e.detail.value
        })
    }, async joinNewGroup() {
        if (this.data.groupIdValue === '' || this.data.userIdValue === '' || this.data.userNameValue === '') this.setData({
            errorMessage: '存在尚未填写的信息，请检查所有信息是否填写完毕', errorVisible: true
        }); else {
            this.setData({
                isJoining: true
            })
            try {
                const userId = this.data.isUserSignedIn ? this.getUserInfo().userId : this.data.userIdValue
                const userName = this.data.isUserSignedIn ? this.getUserInfo().userName : this.data.userNameValue
                const groupPreAuthToken = this.data.groupPreAuthTokenValue === '' ? null : this.data.groupPreAuthTokenValue
                const requesterComment = this.data.requesterCommentValue === '' ? null : this.data.requesterCommentValue
                await joinNewGroupPromise(this.getJWT(), this.data.groupIdValue, userId, userName, groupPreAuthToken, requesterComment)
                await groupStoreUtil.checkGroupStatus(this)
                await approvalStoreUtil.checkApprovalStatus(this)
                wx.navigateBack()
            } catch (e: any) {
                this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                })
            } finally {
                this.setData({
                    isJoining: false
                })
            }
        }
    }

})

function buildJoinNewGroupRequestBodyJson(userId: string, userName: string, device: string, groupPreAuthToken: string | null, requesterComment: string | null): Object {
    const optionalFields = {
        ...(groupPreAuthToken && {groupPreAuthToken}), ...(requesterComment && {requesterComment})
    };
    return {
        requesterUserId: userId, requesterUserName: userName, requesterDevice: device, ...optionalFields
    };
}

async function joinNewGroupPromise(jwt: string, groupId: string, userId: string, userName: string, groupPreAuthToken: string | null, requesterComment: string | null) {
    const deviceInfo = wx.getDeviceInfo()
    const device = deviceInfo.brand + ' ' + deviceInfo.model;
    const requestJsonString = buildJoinNewGroupRequestBodyJson(userId, userName, device, groupPreAuthToken, requesterComment)
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group/' + groupId + '/join', method: 'POST', header: {
                Authorization: 'Bearer ' + jwt
            }, data: JSON.stringify(requestJsonString), success: (res) => {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

