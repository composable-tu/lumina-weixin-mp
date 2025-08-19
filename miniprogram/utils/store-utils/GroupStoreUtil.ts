import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";
import {ErrorResponse} from "../CommonUtil";

export const groupStoreUtil = {
    checkGroupStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getGroupList(that, that.getJWT())
    }, storeBinding: {
        fields: ['groupInfo'], actions: ['setGroupInfo', 'getGroupInfo']
    }
}

export interface GroupInfo {
    groupId: string,
    groupName: string | null,
    permission: string
}

export async function getGroupList(that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance, jwt: string): Promise<void> {
    const groupList = await getGroupListPromise(jwt);
    if ((typeof groupList).toLowerCase() === 'object') that.setGroupInfo(groupList); else that.setGroupInfo([])
}

export const isJoinedAnyGroup = (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance): boolean => {
    return that.getGroupInfo().length > 0;
}

async function getGroupListPromise(jwt: string): Promise<GroupInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) resolve(res.data as GroupInfo[]); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

export interface GroupInfoDetail {
    groupId: string,
    groupName: string | null,
    createAt: string,
    isPreAuthTokenEnable: boolean,
    memberList: GroupInfoMember[]
}

export interface GroupInfoMember {
    userId: string,
    userName: string | null,
    permission: string
}

export async function getGroupInfoPromise(jwt: string, groupId: string): Promise<GroupInfoDetail> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group/' + groupId, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) resolve(res.data as GroupInfoDetail); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

/**
 * 退出团体
 * @param jwt JSON Web Token
 * @param groupId 团体号
 * @param soterResult SOTER 生物认证结果
 */
export async function quitGroupPromise(jwt: string, groupId: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/group/' + groupId + '/quit', method: 'POST', header: {
                Authorization: 'Bearer ' + jwt
            }, data: JSON.stringify(buildQuitGroupRequestBody(soterResult)), success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

function buildQuitGroupRequestBody(soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null): Object {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {...(soterResult && {soterInfo: {...soterInfo}})};
}
