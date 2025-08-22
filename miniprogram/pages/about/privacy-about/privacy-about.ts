// pages/about/privacy-about/privacy-about.ts

const util = require("../../../utils/CommonUtil");

Page({
    onLoad() {
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