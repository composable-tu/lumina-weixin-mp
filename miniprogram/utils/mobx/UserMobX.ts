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
