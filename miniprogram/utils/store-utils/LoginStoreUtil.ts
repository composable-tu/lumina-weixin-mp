import {getWeixinStorageSyncWithDefault, getWeixinStorageWithDefault} from '../WeixinStorageUtil';
import {ErrorResponse, isNullOrEmptyOrUndefined} from "../CommonUtil";
import {LUMINA_SERVER_HOST} from "../../env";

export const EMPTY_JWT = 'Empty JSON Web Token'

export const loginStoreUtil = {
    initLoginStore: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        await this.checkLoginStatus(that);
    },
    checkLoginStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        if (!that.getIsLoginStateChecked()) {
            const isCancellationStateFromWeixinStorage: boolean = getWeixinStorageSyncWithDefault<boolean>('isCancellationState', true)
            that.setIsCancellationState(isCancellationStateFromWeixinStorage)
            if (isCancellationStateFromWeixinStorage) that.setIsLoginStateChecked(true); else {
                const jwtFromWeixinStorage = await getWeixinStorageWithDefault<string>('JWT', EMPTY_JWT, true);
                const isSoterEnabledFromWeixinStorage = getWeixinStorageSyncWithDefault<boolean>('isSoterEnabled', false)
                try {
                    if (isLogin(jwtFromWeixinStorage)) {
                        const isValidJwt = await validateJwtPromise(jwtFromWeixinStorage);
                        if (isValidJwt) {
                            that.setJWT(jwtFromWeixinStorage)
                            that.setIsSoterEnabled(isSoterEnabledFromWeixinStorage)
                        } else await luminaLogin(that);
                    } else await luminaLogin(that);
                } catch (_) {
                    await luminaLogin(that);
                }
            }
        }
    },
    storeBinding: {
        fields: ['isLoginStateChecked', 'jwt', 'isCancellationState', 'isSoterEnabled'],
        actions: ['setIsLoginStateChecked', 'getIsLoginStateChecked', 'setJWT', 'getJWT', 'setIsCancellationState', 'getIsCancellationState', 'setIsSoterEnabled', 'getIsSoterEnabled']
    }
}

export const luminaLogin = async (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance): Promise<void> => {
    const jwt = await luminaLoginRequestPromise();
    if (!isNullOrEmptyOrUndefined(jwt)) {
        that.setJWT(jwt);
        await wx.setStorage({key: 'JWT', data: jwt, encrypt: true})
        await wx.setStorage({key: 'isCancellationState', data: false})
    }
}

export const luminaLogout = async (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance): Promise<void> => {
    await wx.setStorage({key: 'JWT', data: EMPTY_JWT, encrypt: true})
    await wx.setStorage({key: 'isCancellationState', data: true})
    that.setJWT(EMPTY_JWT);
    that.setIsCancellationState(true);
}

export const isLogin = (jwt: string): boolean => {
    return jwt !== EMPTY_JWT && jwt !== '' && jwt !== null && jwt !== undefined
}

/**
 * 获取微信小程序登录 code
 */
export async function weixinLoginPromise(): Promise<string> {
    return new Promise((resolve, reject) => {
        wx.login({
            success: (res) => {
                if (res.code) resolve(res.code); else reject(new Error('获取登录 code 失败'));
            }, fail: reject
        });
    });
}

/**
 * 与服务端通信获取 JWT
 */
async function luminaLoginRequestPromise(): Promise<string> {
    const weixinLoginCode = await weixinLoginPromise();
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/weixin/login',
            method: 'POST',
            data: JSON.stringify({code: weixinLoginCode}),
            success: (res) => {
                if (res.statusCode === 200) {
                    if (typeof res.data === 'string') {
                        const responseData = JSON.parse(res.data);
                        if (responseData && typeof responseData === 'object' && 'jwt' in responseData) resolve(responseData.jwt); else reject(new Error('服务端未返回 JWT'));
                    } else if ('jwt' in res.data) resolve(res.data.jwt); else reject(new Error('服务端未返回 JWT'));
                } else {
                    const resData = res.data as ErrorResponse
                    reject(new Error(resData.message))
                }
            },
            fail: reject
        })
    })
}

/**
 * 验证 JWT 有效性
 */
async function validateJwtPromise(jwt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/weixin/validate', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) resolve(true); else resolve(false);
            }, fail: reject
        })
    })
}

interface IsUserSoterEnabledResponse {
    isUserSoterEnabled: boolean
}

/**
 * 获取用户是否开启 Soter 生物认证保护
 * @param that 小程序 Page 实例
 */
export async function getIsUserSoterEnabled(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance): Promise<void> {
    const isUserSoterEnabled = await getIsUserSoterEnabledPromise(that.getJWT());
    that.setIsSoterEnabled(isUserSoterEnabled)
}

async function getIsUserSoterEnabledPromise(jwt: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/soter/check', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as IsUserSoterEnabledResponse;
                    resolve(resData.isUserSoterEnabled);
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}
