import {action, observable} from 'mobx-miniprogram';
import {EMPTY_JWT} from "../store-utils/LoginStoreUtil";

export interface LoginStoreType {
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
}

export const loginStore: LoginStoreType = observable({
    isLoginStateChecked: false,
    setIsLoginStateChecked: action(function (isLoginStateChecked: boolean) {
        loginStore.isLoginStateChecked = isLoginStateChecked;
    }),
    getIsLoginStateChecked: action(function () {
        return loginStore.isLoginStateChecked;
    }),

    jwt: EMPTY_JWT,
    isCancellationState: true,
    isSoterEnabled: false,
    setJWT: action(function (jwt: string) {
        loginStore.jwt = jwt;
    }),
    getJWT: action(function () {
        return loginStore.jwt;
    }),
    setIsCancellationState: action(function (isCancellationState: boolean) {
        loginStore.isCancellationState = isCancellationState;
    }),
    getIsCancellationState: action(function () {
        return loginStore.isCancellationState;
    }),
    setIsSoterEnabled: action(function (isSoterEnabled: boolean) {
        loginStore.isSoterEnabled = isSoterEnabled;
    }),
    getIsSoterEnabled: action(function () {
        return loginStore.isSoterEnabled;
    })
});
