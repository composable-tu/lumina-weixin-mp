// pages/login/login.ts

import {loginStoreUtil, luminaLogin} from "../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../utils/MobX";
import {ICP_ID, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from "../../env";
import {checkIsSupportSoter} from "../../utils/security/SoterUtil";
import {getErrorMessage} from "../../utils/CommonUtil";

const util = require("../../utils/CommonUtil");

interface IData {
    safeMarginBottomPx: number;
    scrollHeightPx: number;
    safeAreaBottomPx: number;
    theme: string;
    icpInfo: string;
    footerLink: {
        name: string; url: string; openType: string;
    }[];
    isLogining: boolean;
    soterHelpPopupVisible: boolean;
}

Page<IData, StoreInstance>({
    data: {
        footerLink: [{
            name: '用户协议', url: USER_AGREEMENT_URL, openType: '',
        }, {
            name: '隐私政策', url: PRIVACY_POLICY_URL, openType: '',
        }], isLogining: false, soterHelpPopupVisible: false,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: [...loginStoreUtil.storeBinding.fields], actions: [...loginStoreUtil.storeBinding.actions]
        });
        let isSupportSoter = false
        try {
            isSupportSoter = (await checkIsSupportSoter()).length > 0
        } catch (e) {
            isSupportSoter = false
        }
        this.setData({
            safeMarginBottomPx: util.getSafeAreaBottomPx(),
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            icpInfo: ICP_ID,
            isSupportSoter: isSupportSoter ?? false,
        })
        await loginStoreUtil.initLoginStore(this)
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, async login() {
        try {
            this.setData({
                isLogining: true,
            })
            await luminaLogin(this);
            wx.navigateBack()
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isLogining: false,
            })
        }
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, openSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: true,
        })
    }, closeSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: false,
        })
    }, soterHelpPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            soterHelpPopupVisible: e.detail.visible,
        })
    }
})