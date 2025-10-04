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
import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";

export const userInfoStoreUtil = {
    checkUserInfoStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getUserInfo(that, jwt);
    }, storeBinding: {
        fields: ['userInfo'], actions: ['setUserInfo', 'getUserInfo']
    }
}

export const getUserInfo = async (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance, jwt: string): Promise<void> => {
    const userInfo: UserInfo = await getUserInfoPromise(jwt);
    that.setUserInfo(userInfo);
}


export interface UserInfo {
    userId: string,
    userName?: string | null
}

/**
 * 获取用户信息
 * @param jwt JSON Web Token
 */
async function getUserInfoPromise(jwt: string): Promise<UserInfo> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/user`, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as UserInfo;
                    resolve(resData);
                } else resolve({userId: '', userName: ''});
            }, fail: reject
        })
    })
}
