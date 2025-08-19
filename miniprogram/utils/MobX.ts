import {action, observable} from 'mobx-miniprogram';
import {EMPTY_JWT} from "./store-utils/LoginStoreUtil";
import {ApprovalInfo} from "./store-utils/ApprovalStoreUtil";
import {TaskInfo} from "./store-utils/TaskStoreUtil";
import {GroupInfo} from "./store-utils/GroupStoreUtil";
import {StoreBindingsManager} from "mobx-miniprogram-bindings/src/core";

export interface StoreType {
    // 登录状态相关
    isLoginStateChecked: boolean;
    setIsLoginStateChecked: (isLoginStateChecked: boolean) => void;
    getIsLoginStateChecked: () => boolean;

    // JWT和认证相关
    jwt: string;
    isCancellationState: boolean;
    isSoterEnabled: boolean;
    setJWT: (jwt: string) => void;
    getJWT: () => string;
    setIsCancellationState: (isCancellationState: boolean) => void;
    getIsCancellationState: () => boolean;
    setIsSoterEnabled: (isSoterEnabled: boolean) => void;
    getIsSoterEnabled: () => boolean;

    // 审批信息相关
    approvalInfo: ApprovalInfo[];
    selfApprovalInfo: ApprovalInfo[];
    setApprovalInfo: (approvalInfo: ApprovalInfo[]) => void;
    getApprovalInfo: () => ApprovalInfo[];
    setSelfApprovalInfo: (selfApprovalInfo: ApprovalInfo[]) => void;
    getSelfApprovalInfo: () => ApprovalInfo[];

    // 任务和组相关
    taskInfo: TaskInfo[];
    groupInfo: GroupInfo[];
    setTaskInfo: (taskInfo: TaskInfo[]) => void;
    getTaskInfo: () => TaskInfo[];
    setGroupInfo: (groupInfo: GroupInfo[]) => void;
    getGroupInfo: () => GroupInfo[];

    // 用户信息
    userInfo: {
        userId: string;
        userName: string;
    };
    setUserInfo: (userInfo: { userId: string; userName: string }) => void;
    getUserInfo: () => { userId: string; userName: string };

    // 开源许可证信息
    ossLicensesDist: any;
    setOSSLicensesDist: (ossLicensesDist: any) => void;
    getOSSLicensesDist: () => any;

    // UI设置
    isHideMore7DayEnabled: boolean;
    setIsHideMore7DayEnabled: (isHideMore7DayEnabled: boolean) => void;
    getIsHideMore7DayEnabled: () => boolean;
}

export interface StoreInstance extends StoreType {
    storeBindings?: StoreBindingsManager;
}

export const store = observable({
    isLoginStateChecked: false,
    setIsLoginStateChecked: action(function (isLoginStateChecked: boolean) {
        store.isLoginStateChecked = isLoginStateChecked;
    }),
    getIsLoginStateChecked: action(function () {
        return store.isLoginStateChecked;
    }),

    jwt: EMPTY_JWT,
    isCancellationState: true,
    isSoterEnabled: false,
    setJWT: action(function (jwt: string) {
        store.jwt = jwt;
    }),
    getJWT: action(function () {
        return store.jwt;
    }),
    setIsCancellationState: action(function (isCancellationState: boolean) {
        store.isCancellationState = isCancellationState;
    }),
    getIsCancellationState: action(function () {
        return store.isCancellationState;
    }),
    setIsSoterEnabled: action(function (isSoterEnabled: boolean) {
        store.isSoterEnabled = isSoterEnabled;
    }),
    getIsSoterEnabled: action(function () {
        return store.isSoterEnabled;
    }),

    approvalInfo: [] as ApprovalInfo[],
    selfApprovalInfo: [] as ApprovalInfo[],
    taskInfo: [] as TaskInfo[],
    groupInfo: [] as GroupInfo[],
    userInfo: {
        userId: '',
        userName: ''
    },
    setApprovalInfo: action(function (approvalInfo: ApprovalInfo[]) {
        store.approvalInfo = approvalInfo;
    }),
    getApprovalInfo: action(function () {
        return store.approvalInfo;
    }),
    setSelfApprovalInfo: action(function (selfApprovalInfo: ApprovalInfo[]) {
        store.selfApprovalInfo = selfApprovalInfo;
    }),
    getSelfApprovalInfo: action(function () {
        return store.selfApprovalInfo;
    }),
    setTaskInfo: action(function (taskInfo: TaskInfo[]) {
        store.taskInfo = taskInfo;
    }),
    getTaskInfo: action(function () {
        return store.taskInfo;
    }),
    setGroupInfo: action(function (groupInfo: GroupInfo[]) {
        store.groupInfo = groupInfo;
    }),
    getGroupInfo: action(function () {
        return store.groupInfo;
    }),
    setUserInfo: action(function (userInfo: { userId: string; userName: string }) {
        store.userInfo = userInfo;
    }),
    getUserInfo: action(function () {
        return store.userInfo;
    }),

    ossLicensesDist: {} as any,
    setOSSLicensesDist: action(function (ossLicensesDist: any) {
        store.ossLicensesDist = ossLicensesDist;
    }),
    getOSSLicensesDist: action(function () {
        return store.ossLicensesDist;
    }),

    isHideMore7DayEnabled: false,
    setIsHideMore7DayEnabled: action(function (isHideMore7DayEnabled: boolean) {
        store.isHideMore7DayEnabled = isHideMore7DayEnabled;
    }),
    getIsHideMore7DayEnabled: action(function () {
        return store.isHideMore7DayEnabled;
    }),
});