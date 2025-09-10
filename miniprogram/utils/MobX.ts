import {StoreBindingsManager} from "mobx-miniprogram-bindings/src/core";
import {loginStore, LoginStoreType} from "./mobx/LoginMobX";
import {approvalStore, ApprovalStoreType} from "./mobx/ApprovalMobX";
import {taskStore, TaskStoreType} from "./mobx/TaskMobX";
import {userStore, UserStoreType} from "./mobx/UserMobX";
import {ossLicensesStore, OSSLicensesStoreType} from "./mobx/OSSLicensesMobX";
import {settingStore, SettingStoreType} from "./mobx/SettingMobX";
import {agreementBadgeStore, AgreementBadgeStoreType} from "./mobx/AgreementBadgeMobX";
import {observable} from "mobx-miniprogram";

type StoreType =
    LoginStoreType
    & ApprovalStoreType
    & TaskStoreType
    & UserStoreType
    & OSSLicensesStoreType
    & SettingStoreType
    & AgreementBadgeStoreType;

export interface StoreInstance extends StoreType {
    storeBindings?: StoreBindingsManager;
}

export const store: StoreType = observable({
    // Login
    get isLoginStateChecked() {
        return loginStore.isLoginStateChecked;
    },
    setIsLoginStateChecked: loginStore.setIsLoginStateChecked,
    getIsLoginStateChecked: loginStore.getIsLoginStateChecked,

    get jwt() {
        return loginStore.jwt;
    },
    get isCancellationState() {
        return loginStore.isCancellationState;
    },
    get isSoterEnabled() {
        return loginStore.isSoterEnabled;
    },
    setJWT: loginStore.setJWT,
    getJWT: loginStore.getJWT,
    setIsCancellationState: loginStore.setIsCancellationState,
    getIsCancellationState: loginStore.getIsCancellationState,
    setIsSoterEnabled: loginStore.setIsSoterEnabled,
    getIsSoterEnabled: loginStore.getIsSoterEnabled,

    // Approval
    get approvalInfo() {
        return approvalStore.approvalInfo;
    },
    get selfApprovalInfo() {
        return approvalStore.selfApprovalInfo;
    },
    setApprovalInfo: approvalStore.setApprovalInfo,
    getApprovalInfo: approvalStore.getApprovalInfo,
    setSelfApprovalInfo: approvalStore.setSelfApprovalInfo,
    getSelfApprovalInfo: approvalStore.getSelfApprovalInfo,

    // Task
    get taskInfo() {
        return taskStore.taskInfo;
    },
    get groupInfo() {
        return taskStore.groupInfo;
    },
    setTaskInfo: taskStore.setTaskInfo,
    getTaskInfo: taskStore.getTaskInfo,
    setGroupInfo: taskStore.setGroupInfo,
    getGroupInfo: taskStore.getGroupInfo,

    // User
    get userInfo() {
        return userStore.userInfo;
    },
    setUserInfo: userStore.setUserInfo,
    getUserInfo: userStore.getUserInfo,

    // OSS Licenses
    get ossLicensesDist() {
        return ossLicensesStore.ossLicensesDist;
    },
    setOSSLicensesDist: ossLicensesStore.setOSSLicensesDist,
    getOSSLicensesDist: ossLicensesStore.getOSSLicensesDist,

    // Setting
    get isHideMore7DayEnabled() {
        return settingStore.isHideMore7DayEnabled;
    },
    setIsHideMore7DayEnabled: settingStore.setIsHideMore7DayEnabled,
    getIsHideMore7DayEnabled: settingStore.getIsHideMore7DayEnabled,

    // Agreement Badge
    get isShowUserAgreementBadge() {
        return agreementBadgeStore.isShowUserAgreementBadge;
    },
    setIsShowUserAgreementBadge: agreementBadgeStore.setIsShowUserAgreementBadge,
    getIsShowUserAgreementBadge: agreementBadgeStore.getIsShowUserAgreementBadge,

    get isShowPrivacyPolicyBadge() {
        return agreementBadgeStore.isShowPrivacyPolicyBadge;
    },
    setIsShowPrivacyPolicyBadge: agreementBadgeStore.setIsShowPrivacyPolicyBadge,
    getIsShowPrivacyPolicyBadge: agreementBadgeStore.getIsShowPrivacyPolicyBadge,

    get isShowPersonalInformationCollectionListBadge() {
        return agreementBadgeStore.isShowPersonalInformationCollectionListBadge;
    },
    setIsShowPersonalInformationCollectionListBadge: agreementBadgeStore.setIsShowPersonalInformationCollectionListBadge,
    getIsShowPersonalInformationCollectionListBadge: agreementBadgeStore.getIsShowPersonalInformationCollectionListBadge,

    get isShowThirdPartyPersonalInformationSharingListBadge() {
        return agreementBadgeStore.isShowThirdPartyPersonalInformationSharingListBadge;
    },
    setIsShowThirdPartyPersonalInformationSharingListBadge: agreementBadgeStore.setIsShowThirdPartyPersonalInformationSharingListBadge,
    getIsShowThirdPartyPersonalInformationSharingListBadge: agreementBadgeStore.getIsShowThirdPartyPersonalInformationSharingListBadge
});