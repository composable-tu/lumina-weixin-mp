// pages/approval/approval.ts

import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../utils/MobX";
import {EMPTY_JWT, isLogin, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil";
import {getErrorMessage} from "../../utils/CommonUtil";
import {approvalStoreUtil} from "../../utils/store-utils/ApprovalStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    safeMarginBottomPx: number
    isRefreshing: boolean
    approvalTypeTabValue: string
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true, approvalTypeTabValue: '我收到'
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ["isHideMore7DayEnabled", ...loginStoreUtil.storeBinding.fields, ...approvalStoreUtil.storeBinding.fields],
            actions: ["setIsHideMore7DayEnabled", "getIsHideMore7DayEnabled", ...loginStoreUtil.storeBinding.actions, ...approvalStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80),
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        this.setIsHideMore7DayEnabled(wx.getStorageSync('isHideMore7DayEnabled') ?? false)
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await approvalStoreUtil.checkApprovalStatus(this)
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
        if (this.storeBindings) this.storeBindings.destroyStoreBindings()
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
                await approvalStoreUtil.checkApprovalStatus(this)
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
    }, onApprovalTypeTabValueChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            approvalTypeTabValue: e.detail.value
        })
    }, onApprovalItemClick(e: WechatMiniprogram.CustomEvent) {
        const selectedApprovalId = e.currentTarget.dataset.approvalId
        wx.navigateTo({
            url: '/pages/approval/selected-approval/selected-approval?selectedApprovalId=' + selectedApprovalId
        })
    }
})