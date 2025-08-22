// pages/subpages/agreement-docs/agreement-docs.ts
import {
    PERSONAL_INFORMATION_COLLECTION_LIST,
    PRIVACY_POLICY,
    THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST,
    USER_AGREEMENT
} from "../../../agreement-docs/AgreementDocsDist"
import {MINI_PROGRAM_NAME, ORGANIZATION_NAME} from "../../../env";

const util = require("../../../utils/CommonUtil");

Page({
    onLoad(options) {
        const agreementDocsType = options.agreementDocsType as string;
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            agreementDocsTypeName: getAgreementDocsTypeName(agreementDocsType),
            agreementDocsText: getAgreementDocsText(agreementDocsType)
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

function getAgreementDocsText(agreementDocsType: string) {
    switch (agreementDocsType) {
        case "UserAgreement":
            return USER_AGREEMENT.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "PrivacyPolicy":
            return PRIVACY_POLICY.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "PersonalInformationCollectionList":
            return PERSONAL_INFORMATION_COLLECTION_LIST.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        case "ThirdPartyPersonalInformationSharingList":
            return THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST.replaceAll("『微信小程序名称』", MINI_PROGRAM_NAME).replaceAll("『微信小程序运营主体名称』", ORGANIZATION_NAME);
        default:
            return "未知"
    }
}