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