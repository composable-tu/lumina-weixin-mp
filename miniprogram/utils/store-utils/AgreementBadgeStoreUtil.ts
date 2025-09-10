import {isLogin} from "./LoginStoreUtil";
import {
    PERSONAL_INFORMATION_COLLECTION_LIST_VERSION,
    PRIVACY_POLICY_VERSION,
    THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION,
    USER_AGREEMENT_VERSION
} from "../../env";
import {getWeixinStorageWithDefault} from "../WeixinStorageUtil";

const semver = require('semver')

const DOCS = [{
    key: 'UserAgreement',
    version: () => USER_AGREEMENT_VERSION,
    storageKey: 'nowUserAgreementVersion',
    badgeSetter: 'setIsShowUserAgreementBadge' as const
}, {
    key: 'PrivacyPolicy',
    version: () => PRIVACY_POLICY_VERSION,
    storageKey: 'nowPrivacyPolicyVersion',
    badgeSetter: 'setIsShowPrivacyPolicyBadge' as const
}, {
    key: 'PersonalInformationCollectionList',
    version: () => PERSONAL_INFORMATION_COLLECTION_LIST_VERSION,
    storageKey: 'nowPersonalInformationCollectionListVersion',
    badgeSetter: 'setIsShowPersonalInformationCollectionListBadge' as const
}, {
    key: 'ThirdPartyPersonalInformationSharingList',
    version: () => THIRD_PARTY_PERSONAL_INFORMATION_SHARING_LIST_VERSION,
    storageKey: 'nowThirdPartyPersonalInformationSharingListVersion',
    badgeSetter: 'setIsShowThirdPartyPersonalInformationSharingListBadge' as const
}] as const

export const agreementBadgeStoreUtil = {
    checkAgreementBadgeStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        const jwt = that.getJWT();
        if (!isLogin(jwt)) {
            DOCS.forEach(d => {
                that[d.badgeSetter](false);
            });
        } else await getAgreementBadgeStatus(that);
    }, storeBinding: {
        fields: ['isShowUserAgreementBadge', 'isShowPrivacyPolicyBadge', 'isShowPersonalInformationCollectionListBadge', 'isShowThirdPartyPersonalInformationSharingListBadge'],
        actions: ['setIsShowUserAgreementBadge', 'getIsShowUserAgreementBadge', 'setIsShowPrivacyPolicyBadge', 'getIsShowPrivacyPolicyBadge', 'setIsShowPersonalInformationCollectionListBadge', 'getIsShowPersonalInformationCollectionListBadge', 'setIsShowThirdPartyPersonalInformationSharingListBadge', 'getIsShowThirdPartyPersonalInformationSharingListBadge']
    }
}

async function getAgreementBadgeStatus(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    const stored = await Promise.all(DOCS.map(d => getWeixinStorageWithDefault<string>(d.storageKey, EMPTY, false)))

    DOCS.forEach((d, idx) => {
        const nowV = d.version()
        const storedV = stored[idx]
        const show = storedV === EMPTY || semver.gt(nowV, storedV)
        that[d.badgeSetter](show)
    })
}

/**
 * 存储当前法律文本版本
 */
export function setNowAgreementDocsVersionsStorage(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    DOCS.forEach(d => {
        wx.setStorageSync(d.storageKey, d.version())
        that[d.badgeSetter](false)
    })
}

export function cleanAgreementDocsVersionsStorage(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    DOCS.forEach(d => {
        wx.setStorageSync(d.storageKey, EMPTY)
        that[d.badgeSetter](false)
    })
}

const EMPTY = 'EMPTY'
