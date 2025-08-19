import {LUMINA_SERVER_HOST} from "../../env";
import {isLogin} from "./LoginStoreUtil";
import {ErrorResponse, GROUP_JOIN, TASK_CREATION, TASK_EXPAND_GROUP} from "../CommonUtil";

export const approvalStoreUtil = {
    checkApprovalStatus: async function (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
        const jwt = that.getJWT();
        if (isLogin(jwt)) await getApprovalInfo(that, that.getJWT())
    }, storeBinding: {
        fields: ['approvalInfo', 'selfApprovalInfo'],
        actions: ['setApprovalInfo', 'getApprovalInfo', 'setSelfApprovalInfo', 'getSelfApprovalInfo']
    }
}

export const getApprovalInfo = async (that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance, jwt: string): Promise<void> => {
    const approvalInfo = await getApprovalListPromise(jwt);
    const selfApprovalInfo = await getSelfApprovalListPromise(jwt);
    if ((typeof approvalInfo).toLowerCase() === 'object') {
        if (approvalInfo.length !== 0) approvalInfo.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        that.setApprovalInfo(approvalInfo);
    } else that.setApprovalInfo([]);
    if ((typeof selfApprovalInfo).toLowerCase() === 'object') {
        if (selfApprovalInfo.length !== 0) selfApprovalInfo.sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        that.setSelfApprovalInfo(selfApprovalInfo);
    } else that.setSelfApprovalInfo([]);
}

export interface ApprovalInfo {
    approvalId: number,
    createdAt: string,
    approvalType: string,
    status: string,
    comment: string | null,
    reviewer: string | null,
    reviewerName: string | null,
    reviewedAt: string | null,
}

async function getApprovalListPromise(jwt: string): Promise<ApprovalInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/admin', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as ApprovalInfo[]);
            }, fail: reject
        })
    })
}

async function getSelfApprovalListPromise(jwt: string): Promise<ApprovalInfo[]> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/self', header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                resolve(res.data as ApprovalInfo[]);
            }, fail: reject
        })
    })
}

export interface JoinGroupApprovalInfo {
    approvalId: number,
    targetGroupId: string,
    requesterUserId: string,
    requesterUserName: string,
    createdAt: string,
    approvalType: string,
    status: string,
    targetGroupName: string | null,
    comment: string | null,
    reviewedAt: string | null,
}

export async function getApprovalInfoPromise(jwt: string, approvalId: string): Promise<JoinGroupApprovalInfo | null> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: 'https://' + LUMINA_SERVER_HOST + '/approval/' + approvalId, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as any
                    switch (resData.approvalType) {
                        case GROUP_JOIN:
                            resolve(resData as JoinGroupApprovalInfo);
                            break;
                        case TASK_CREATION:
                            // TODO：创建任务
                            break;
                        case TASK_EXPAND_GROUP:
                            // TODO：扩展团体
                            break;
                        default:
                            reject("服务端错误");
                    }
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

export function isJoinGroupApprovalInfo(object: any) {
    return object && object.approvalType === GROUP_JOIN;
}
