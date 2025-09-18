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
import {ErrorResponse} from "../CommonUtil";

export interface VoteTaskInfoManagerInfo {
    taskId: string
    groupId: string
    groupName: string | null
    taskName: string
    voteMaxSelectable: number
    voteCanRecall: boolean
    isVoteResultPublic: boolean
    voteTaskOptions: VoteTaskOptionManager[],
    voteNonParticipants: VoteTaskNonParticipantInfo[] | null,
    description: string | null
    endTime: string
    createdAt: string
    creatorId: string
    creatorName: string | null
}

export interface VoteTaskOptionManager {
    optionName: string
    sortOrder: number
    optionDescription: string | null
    voteParticipants: VoteTaskParticipantInfo[] | null
}

export interface VoteTaskParticipantInfo {
    userId: string
    userName: string | null
    votedAt: string
}

export interface VoteTaskNonParticipantInfo {
    userId: string
    userName: string | null
}

export async function getVoteTaskManagerInfoPromise(jwt: string, taskId: string): Promise<VoteTaskInfoManagerInfo | null> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/taskManager/vote/${taskId}`, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200) {
                    const resData = res.data as VoteTaskInfoManagerInfo
                    resolve(resData);
                } else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}


export async function downloadVoteTaskInfoExcelPromise(jwt: string, taskId: string): Promise<string> {
    return new Promise((resolve, reject) => {
        wx.downloadFile({
            url: `https://${LUMINA_SERVER_HOST}/taskManager/vote/${taskId}/export`, header: {
                Authorization: 'Bearer ' + jwt
            }, success: (res) => {
                if (res.statusCode === 200 && res.tempFilePath) resolve(res.tempFilePath); else reject(new Error(res.errMsg))
            }, fail: reject
        })
    })
}

