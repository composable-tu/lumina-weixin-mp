// pages/approval/selected-approval/selected-approval.ts
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {GroupInfo, groupStoreUtil} from "../../../utils/store-utils/GroupStoreUtil";
import {ErrorResponse, getErrorMessage, GROUP_JOIN, isNullOrEmptyOrUndefined} from "../../../utils/CommonUtil";
import {
    approvalStoreUtil,
    getApprovalInfoPromise,
    isJoinGroupApprovalInfo,
    JoinGroupApprovalInfo
} from "../../../utils/store-utils/ApprovalStoreUtil";
import Message from 'tdesign-miniprogram/message/index';
import {luminaStartSoter} from "../../../utils/security/SoterUtil";
import {LUMINA_SERVER_HOST} from "../../../env";
import {EncryptContent, sm4EncryptContent} from "../../../utils/security/WeixinUserCrypto";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedApprovalId: string
    selectedApprovalType: string
    selectedJoinGroupApproval: JoinGroupApprovalInfo
    isGroupAdmin: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true, isSelectedNotFound: false, selectedApprovalId: '', isGroupAdmin: false
    }, async onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...approvalStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...approvalStoreUtil.storeBinding.actions]
        });
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await getIsUserSoterEnabled(this)
                const selectedApprovalId = options.selectedApprovalId;
                if (isNullOrEmptyOrUndefined(selectedApprovalId)) this.setData({
                    isSelectedNotFound: true
                }); else if (selectedApprovalId) await getSelectedApprovalInfo(this, selectedApprovalId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
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
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await getIsUserSoterEnabled(this)
                if (!this.data.isSelectedNotFound) await getSelectedApprovalInfo(this, this.data.selectedApprovalId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            });
        }
    }, async approveApproval() {
        this.setData({
            isApprovalApproving: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("同意审批 " + this.data.selectedApprovalId)
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await actionToApproval(this, this.data.selectedApprovalId, "approve", soterResult)
            normalToast(this, "审批已通过")
            if (!this.data.isSelectedNotFound) await getSelectedApprovalInfo(this, this.data.selectedApprovalId)
        } catch (e: any) {
            console.log(e)
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isApprovalApproving: false
            })
        }
    }, async rejectApproval() {
        this.setData({
            isApprovalRejecting: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("同意审批 " + this.data.selectedApprovalId)
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await actionToApproval(this, this.data.selectedApprovalId, "reject", soterResult)
            normalToast(this, "审批已拒绝")
            if (!this.data.isSelectedNotFound) await getSelectedApprovalInfo(this, this.data.selectedApprovalId)
        } catch (e: any) {
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isApprovalRejecting: false
            })
        }
    },
})


async function getSelectedApprovalInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedApprovalId: string) {
    const selectApprovalInfo = await getApprovalInfoPromise(that.getJWT(), selectedApprovalId)
    if (selectApprovalInfo == null) that.setData({
        errorMessage: "未找到审批", errorVisible: true
    }); else if (isJoinGroupApprovalInfo(selectApprovalInfo)) {
        const targetGroupInfo: GroupInfo | undefined = that.getGroupInfo().find((groupInfo: GroupInfo) => groupInfo.groupId === selectApprovalInfo.targetGroupId)
        if (targetGroupInfo) that.setData({
            selectedApprovalType: GROUP_JOIN,
            selectedApprovalId: selectApprovalInfo.approvalId.toString(),
            selectedApprovalTargetGroupId: selectApprovalInfo.targetGroupId,
            isGroupAdmin: that.getGroupInfo().length !== 0 ? util.isAdminAndSuperAdmin(targetGroupInfo.permission) : false,
            selectedJoinGroupApproval: selectApprovalInfo
        })
    }
}

async function actionToApproval(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedApprovalId: string, action: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const jwt = that.getJWT()
    const approvalType = that.data.selectedApprovalType
    const requestBodyString = JSON.stringify(buildActionToApprovalRequestBody(action, approvalType, soterResult))
    const encryptRequest = await sm4EncryptContent(requestBodyString)
    await actionToApprovalPromise(jwt, selectedApprovalId, encryptRequest)
}

async function actionToApprovalPromise(jwt: string, selectedApprovalId: string, encryptRequest: EncryptContent) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/' + selectedApprovalId, header: {
                Authorization: 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify(encryptRequest), success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.data);
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

function buildActionToApprovalRequestBody(action: string, approvalType: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {approvalType: approvalType, action: action, ...(soterResult && {soterInfo: {...soterInfo}})};
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}
