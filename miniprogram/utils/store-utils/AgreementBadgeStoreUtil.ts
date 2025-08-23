import {isLogin} from "./LoginStoreUtil";
import {
    PERSONAL_INFORMATION_COLLECTION_LIST_VERSION,
    PRIVACY_POLICY_VERSION,
    THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION,
    USER_AGREEMENT_VERSION
} from "../../env";
import {getWeixinStorageWithDefault} from "../WeixinStorageUtil";

const semver = require('semver')

export const agreementBadgeStoreUtil = {
    checkAgreementBadgeStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        const jwt = that.getJWT();
        if (!isLogin(jwt)) {
            that.setIsShowUserAgreementBadge(false);
            that.setIsShowPrivacyPolicyBadge(false);
            that.setIsShowPersonalInformationCollectionListBadge(false);
            that.setIsShowThirdPartyPersonalInformationSharingListBadge(false);
        } else await getAgreementBadgeStatus(that);
    }, storeBinding: {
        fields: ['isShowUserAgreementBadge', 'isShowPrivacyPolicyBadge', 'isShowPersonalInformationCollectionListBadge', 'isShowThirdPartyPersonalInformationSharingListBadge'],
        actions: ['setIsShowUserAgreementBadge', 'getIsShowUserAgreementBadge', 'setIsShowPrivacyPolicyBadge', 'getIsShowPrivacyPolicyBadge', 'setIsShowPersonalInformationCollectionListBadge', 'getIsShowPersonalInformationCollectionListBadge', 'setIsShowThirdPartyPersonalInformationSharingListBadge', 'getIsShowThirdPartyPersonalInformationSharingListBadge']
    }
}

async function getAgreementBadgeStatus(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    const nowUserAgreementVersion = USER_AGREEMENT_VERSION
    const nowPrivacyPolicyVersion = PRIVACY_POLICY_VERSION
    const nowPersonalInformationCollectionListVersion = PERSONAL_INFORMATION_COLLECTION_LIST_VERSION
    const nowThirdPartyPersonalInformationSharingListVersion = THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION
    const [storageUserAgreementVersion, storagePrivacyPolicyVersion, storagePersonalInformationCollectionListVersion, storageThirdPartyPersonalInformationSharingListVersion] = await Promise.all([getWeixinStorageWithDefault<string>('nowUserAgreementVersion', "EMPTY", false), getWeixinStorageWithDefault<string>('nowPrivacyPolicyVersion', "EMPTY", false), getWeixinStorageWithDefault<string>('nowPersonalInformationCollectionListVersion', "EMPTY", false), getWeixinStorageWithDefault<string>('nowThirdPartyPersonalInformationSharingListVersion', "EMPTY", false)]);
    that.setIsShowUserAgreementBadge(storageUserAgreementVersion === "EMPTY" || semver.gt(nowUserAgreementVersion, storageUserAgreementVersion));
    that.setIsShowPrivacyPolicyBadge(storagePrivacyPolicyVersion === "EMPTY" || semver.gt(nowPrivacyPolicyVersion, storagePrivacyPolicyVersion))
    that.setIsShowPersonalInformationCollectionListBadge(storagePersonalInformationCollectionListVersion === "EMPTY" || semver.gt(nowPersonalInformationCollectionListVersion, storagePersonalInformationCollectionListVersion));
    that.setIsShowThirdPartyPersonalInformationSharingListBadge(storageThirdPartyPersonalInformationSharingListVersion === "EMPTY" || semver.gt(nowThirdPartyPersonalInformationSharingListVersion, storageThirdPartyPersonalInformationSharingListVersion));
}

/**
 * 存储当前法律文本版本
 */
export function setNowAgreementDocsVersionsStorage(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    wx.setStorageSync('nowUserAgreementVersion', USER_AGREEMENT_VERSION);
    wx.setStorageSync('nowPrivacyPolicyVersion', PRIVACY_POLICY_VERSION);
    wx.setStorageSync('nowPersonalInformationCollectionListVersion', PERSONAL_INFORMATION_COLLECTION_LIST_VERSION);
    wx.setStorageSync('nowThirdPartyPersonalInformationSharingListVersion', THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION);
    that.setIsShowUserAgreementBadge(false);
    that.setIsShowPrivacyPolicyBadge(false);
    that.setIsShowPersonalInformationCollectionListBadge(false);
    that.setIsShowThirdPartyPersonalInformationSharingListBadge(false);
}

export function cleanAgreementDocsVersionsStorage(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    const EMPTY = "EMPTY";
    wx.setStorageSync('nowUserAgreementVersion', EMPTY);
    wx.setStorageSync('nowPrivacyPolicyVersion', EMPTY);
    wx.setStorageSync('nowPersonalInformationCollectionListVersion', EMPTY);
    wx.setStorageSync('nowThirdPartyPersonalInformationSharingListVersion', EMPTY);
    that.setIsShowUserAgreementBadge(false);
    that.setIsShowPrivacyPolicyBadge(false);
    that.setIsShowPersonalInformationCollectionListBadge(false);
    that.setIsShowThirdPartyPersonalInformationSharingListBadge(false);
}
