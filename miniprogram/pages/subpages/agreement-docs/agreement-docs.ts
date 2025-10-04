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
import {
    PERSONAL_INFORMATION_COLLECTION_LIST,
    PRIVACY_POLICY,
    THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST,
    USER_AGREEMENT
} from "../../../agreement-docs/AgreementDocsDist"
import {
    MINI_PROGRAM_NAME,
    ORGANIZATION_NAME,
    PERSONAL_INFORMATION_COLLECTION_LIST_VERSION,
    PRIVACY_POLICY_VERSION,
    THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION,
    USER_AGREEMENT_VERSION
} from "../../../env";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {agreementBadgeStoreUtil} from "../../../utils/store-utils/AgreementBadgeStoreUtil";

const util = require("../../../utils/CommonUtil");

interface IData {
}

// @ts-ignore
Page<IData, StoreInstance>({
    onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...agreementBadgeStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...agreementBadgeStoreUtil.storeBinding.actions]
        });
        const agreementDocsType = options.agreementDocsType as string;
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            agreementDocsTypeName: getAgreementDocsTypeName(agreementDocsType),
            agreementDocsText: getAgreementDocsText(agreementDocsType, this)
        })
    },
})

function getAgreementDocsTypeName(agreementDocsType: string) {
    switch (agreementDocsType) {
        case "UserAgreement":
            return "用户协议";
        case "PrivacyPolicy":
            return "隐私政策";
        case "PersonalInformationCollectionList":
            return "个人信息收集清单";
        case "ThirdPartyPersonalInformationSharingList":
            return "第三方个人信息共享清单";
        default:
            return "未知"
    }
}

function getAgreementDocsText(agreementDocsType: string, that: WechatMiniprogram.Page.Instance<IData, StoreInstance>) {
    switch (agreementDocsType) {
        case "UserAgreement":
            wx.setStorageSync('nowUserAgreementVersion', USER_AGREEMENT_VERSION);
            that.setIsShowUserAgreementBadge(false)
            return USER_AGREEMENT.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "PrivacyPolicy":
            wx.setStorageSync('nowPrivacyPolicyVersion', PRIVACY_POLICY_VERSION);
            that.setIsShowPrivacyPolicyBadge(false);
            return PRIVACY_POLICY.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "PersonalInformationCollectionList":
            wx.setStorageSync('nowPersonalInformationCollectionListVersion', PERSONAL_INFORMATION_COLLECTION_LIST_VERSION);
            that.setIsShowPersonalInformationCollectionListBadge(false);
            return PERSONAL_INFORMATION_COLLECTION_LIST.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "ThirdPartyPersonalInformationSharingList":
            wx.setStorageSync('nowThirdPartyPersonalInformationSharingListVersion', THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION);
            that.setIsShowThirdPartyPersonalInformationSharingListBadge(false);
            return THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        default:
            return "未知"
    }
}