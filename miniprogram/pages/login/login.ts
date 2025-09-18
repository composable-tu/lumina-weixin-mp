/**
 * Copyright (c) 2025 LuminaPJ
 * SM2 Key Generator is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */
import {loginStoreUtil, luminaLogin} from "../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../utils/MobX";
import {ICP_ID} from "../../env";
import {checkIsSupportSoter} from "../../utils/security/SoterUtil";
import {getErrorMessage} from "../../utils/CommonUtil";
import {
    agreementBadgeStoreUtil,
    setNowAgreementDocsVersionsStorage
} from "../../utils/store-utils/AgreementBadgeStoreUtil";

const util = require("../../utils/CommonUtil");

interface IData {
    safeAreaBottomPx: number;
    scrollHeightPx: number;
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
            name: '用户协议',
            url: '/pages/subpages/agreement-docs/agreement-docs?agreementDocsType=UserAgreement',
            openType: 'navigate',
        }, {
            name: '隐私政策', url: '/pages/about/privacy-about/privacy-about', openType: 'navigate',
        }], isLogining: false, soterHelpPopupVisible: false,
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...agreementBadgeStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...agreementBadgeStoreUtil.storeBinding.actions]
        });
        let isSupportSoter = false
        try {
            isSupportSoter = (await checkIsSupportSoter()).length > 0
        } catch (e) {
            isSupportSoter = false
        }
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            icpInfo: ICP_ID,
            isSupportSoter: isSupportSoter ?? false,
        })
        await loginStoreUtil.initLoginStore(this)
    }, onReady() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, async login() {
        try {
            this.setData({
                isLogining: true,
            })
            await luminaLogin(this);
            setNowAgreementDocsVersionsStorage(this)
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