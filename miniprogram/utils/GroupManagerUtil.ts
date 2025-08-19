import {LUMINA_SERVER_HOST} from "../env";
import {ErrorResponse} from "./CommonUtil";
import {UserInfo} from "./store-utils/UserInfoUtil";

/**
 * 重命名团体
 * @param jwt JSON Web Token
 * @param groupId 团体号
 * @param newGroupName 新团体名
 * @param soterResult SOTER 生物认证结果
 */
export async function renameGroupPromise(jwt: string, groupId: string, newGroupName: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/groupManager/' + groupId + '/rename', method: 'POST', header: {
                Authorization: 'Bearer ' + jwt
            }, data: JSON.stringify(buildRenameGroupRequestBody(newGroupName, soterResult)), success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

function buildRenameGroupRequestBody(newGroupName: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null): Object {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        newGroupName: newGroupName, ...(soterResult && {soterInfo: {...soterInfo}})
    };
}

/**
 * 设置团体预授权凭证
 * @param jwt JSON Web Token
 * @param groupId 团体号
 * @param preAuthToken 预授权凭证
 * @param validity 凭证有效期
 * @param soterResult SOTER 生物认证结果
 */
export async function setGroupPreAuthTokenPromise(jwt: string, groupId: string, preAuthToken: string, validity: number, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/groupManager/' + groupId + '/setPreAuthToken',
            method: 'POST',
            header: {
                Authorization: 'Bearer ' + jwt
            },
            data: JSON.stringify(buildSetGroupPreAuthTokenRequestBody(preAuthToken, validity, soterResult)),
            success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            },
            fail: reject
        })
    })
}

function buildSetGroupPreAuthTokenRequestBody(preAuthToken: string, validity: number, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null): Object {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        preAuthToken: preAuthToken, validity: validity, ...(soterResult && {soterInfo: {...soterInfo}})
    };
}

export const SET_ADMIN = 'setAdmin';
export const REMOVE_MEMBER = 'removeMember';
export const RESET_TO_MEMBER = 'resetToMember';

/**
 * 团体用户操作
 * @param action 操作类型：`"removeMember"` / `"setAdmin"` / `"resetToMember"`
 * @param jwt JSON Web Token
 * @param groupId 团体号
 * @param userInfo 用户信息
 * @param soterResult SOTER 生物认证结果
 */
export async function groupUserActionPromise(action: string, jwt: string, groupId: string, userInfo: UserInfo[], soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    return new Promise((resolve, reject) => {
        if (action !== REMOVE_MEMBER && action !== SET_ADMIN && action !== RESET_TO_MEMBER) reject(new Error('无效的操作')); else if (userInfo.length === 0) reject(new Error('提交的用户不能为空')); else wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/groupManager/' + groupId + '/' + action, method: 'POST', header: {
                Authorization: 'Bearer ' + jwt
            }, data: JSON.stringify(buildGroupUserActionInfo(userInfo, soterResult)), success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

function buildGroupUserActionInfo(userInfo: UserInfo[], soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null): Object {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        groupManageUserList: userInfo, ...(soterResult && {soterInfo: {...soterInfo}})
    };
}

