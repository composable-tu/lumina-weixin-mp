// pages/subpages/group-management/group-management.ts
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {groupStoreUtil} from "../../../utils/store-utils/GroupStoreUtil";
import {getErrorMessage} from "../../../utils/CommonUtil";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions]
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
    }, joinNewGroup() {
        wx.navigateTo({
            url: '/pages/subpages/join-group/join-group',
        })
    }, onGroupItemClick(e: WechatMiniprogram.CustomEvent) {
        const selectedGroupId = e.currentTarget.dataset.groupId
        wx.navigateTo({
            url: '/pages/subpages/group-management/selected-group/selected-group?selectedGroupId=' + selectedGroupId,
        })
    }
})