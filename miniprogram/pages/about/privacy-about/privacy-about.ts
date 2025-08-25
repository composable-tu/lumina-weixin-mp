// pages/about/privacy-about/privacy-about.ts

import {isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {agreementBadgeStoreUtil} from "../../../utils/store-utils/AgreementBadgeStoreUtil";
import {getErrorMessage} from "../../../utils/CommonUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";

const util = require("../../../utils/CommonUtil");

interface IData {
}

Page<IData, StoreInstance>({
    async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...agreementBadgeStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...agreementBadgeStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await agreementBadgeStoreUtil.checkAgreementBadgeStatus(this)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        }
    }, onReady() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
    }, onClickPrivacyPolicy() {
        wx.navigateTo({
            url: '/pages/subpages/agreement-docs/agreement-docs?agreementDocsType=PrivacyPolicy',
        })
    }, onClickPersonalInformationCollectionList() {
        wx.navigateTo({
            url: '/pages/subpages/agreement-docs/agreement-docs?agreementDocsType=PersonalInformationCollectionList',
        })
    }, onClickThirdPartyPersonalInformationSharingList() {
        wx.navigateTo({
            url: '/pages/subpages/agreement-docs/agreement-docs?agreementDocsType=ThirdPartyPersonalInformationSharingList',
        })
    }
})