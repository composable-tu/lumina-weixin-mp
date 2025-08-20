import {LUMINA_SERVER_HOST} from "../../env";
import {ErrorResponse} from "../CommonUtil";


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
