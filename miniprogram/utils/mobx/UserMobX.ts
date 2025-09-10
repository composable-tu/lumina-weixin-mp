import {action, observable} from 'mobx-miniprogram';

export interface UserStoreType {
    // 用户信息
    userInfo: {
        userId: string;
        userName: string;
    };
    setUserInfo: (userInfo: { userId: string; userName: string }) => void;
    getUserInfo: () => { userId: string; userName: string };
}

export const userStore: UserStoreType = observable({
    userInfo: {
        userId: '',
        userName: ''
    },
    setUserInfo: action(function (userInfo: { userId: string; userName: string }) {
        userStore.userInfo = userInfo;
    }),
    getUserInfo: action(function () {
        return userStore.userInfo;
    })
});
