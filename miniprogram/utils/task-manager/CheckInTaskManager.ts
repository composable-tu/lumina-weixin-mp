import {LUMINA_SERVER_HOST} from "../../env";
import {ErrorResponse} from "../CommonUtil";
import {MARK_AS_NOT_PARTICIPANT, MARK_AS_PARTICIPANT, MARK_AS_PENDING} from "../store-utils/TaskStoreUtil";
import {EncryptContent, sm4EncryptContent} from "../security/WeixinUserCrypto";


export interface CheckInTaskManagerInfo {
    taskId: string,
    groupId: string,
    groupName: string | null,
    taskName: string,
    checkInType: string,
    description: string | null,
    endTime: string,
    createdAt: string,
    creatorId: string,
    creatorName: string | null,
    memberList: CheckInTaskUserStatusInfo[]
}

export interface CheckInTaskUserStatusInfo {
    userId: string,
    userName: string | null,
    status: string,
    participatedAt: string | null
}

export async function getCheckInTaskManagerInfoPromise(jwt: string, taskId: string): Promise<CheckInTaskManagerInfo | null> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/taskManager/checkIn/' + taskId, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as CheckInTaskManagerInfo
                    resolve(resData);
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

export async function interventionCheckInTask(that: WechatMiniprogram.Page.TrivialInstance, selectedTaskId: string, selectedUserId: string, interventionType: string, soterInfo: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const jwt = that.getJWT();
    const createVoteTaskRequestBody = buildInterventionCheckInTaskRequestBody(selectedUserId, interventionType, soterInfo)
    const encryptRequest = await sm4EncryptContent(JSON.stringify(createVoteTaskRequestBody))
    await interventionCheckInTaskPromise(jwt, selectedTaskId, encryptRequest)
}

export function buildInterventionCheckInTaskRequestBody(userId: string, interventionType: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    if (interventionType !== MARK_AS_PARTICIPANT && interventionType !== MARK_AS_NOT_PARTICIPANT && interventionType !== MARK_AS_PENDING) throw new Error('干预选项不正确');
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        userId: userId, interventionType: interventionType, ...(soterResult && {soterInfo: {...soterInfo}})
    }
}

export async function interventionCheckInTaskPromise(jwt: string, taskId: string, encryptRequest: EncryptContent) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/taskManager/checkIn/' + taskId + '/interveneUser', header: {
                Authorization: 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify(encryptRequest), success: (res) => {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}


