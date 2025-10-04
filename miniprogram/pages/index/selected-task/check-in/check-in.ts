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
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../../utils/MobX";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {GroupInfo, groupStoreUtil} from "../../../../utils/store-utils/GroupStoreUtil";
import {ErrorResponse, getErrorMessage, isNullOrEmptyOrUndefined} from "../../../../utils/CommonUtil";
import {Message} from 'tdesign-miniprogram';
import {CheckInTaskInfo, getCheckInTaskInfoPromise, taskStoreUtil} from "../../../../utils/store-utils/TaskStoreUtil";
import {LUMINA_SERVER_HOST} from "../../../../env";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedTaskId: string
    selectedTask: CheckInTaskInfo,
    isGroupAdmin: boolean
    isTaskCreator: boolean
    countDownTime: number
    checkInTokenValue: string
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true, isSelectedNotFound: false, isGroupAdmin: false
    }, async onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...taskStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...taskStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(), isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await taskStoreUtil.checkTaskStatus(this)
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await getIsUserSoterEnabled(this)
                const selectedTaskId = options.selectedTaskId;
                if (isNullOrEmptyOrUndefined(selectedTaskId)) this.setData({
                    isSelectedNotFound: true
                }); else if (selectedTaskId) await getSelectedCheckInTaskInfo(this, selectedTaskId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, onReady() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, async onRefresh() {
        this.setData({
            isRefreshing: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await taskStoreUtil.checkTaskStatus(this)
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await getIsUserSoterEnabled(this)
                if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskInfo(this, this.data.selectedTaskId)
            }
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            });
        }
    }, onCheckInTokenInput(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            checkInTokenValue: e.detail.value
        })
    }, async startCheckIn() {
        const checkInType = this.data.selectedTask.checkInType
        if (checkInType === 'TOKEN' && isNullOrEmptyOrUndefined(this.data.checkInTokenValue)) {
            this.setData({
                errorMessage: "此签到需输入签到验证码", errorVisible: true
            });
            return
        }
        this.setData({
            isCheckInStarting: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            const checkInTokenValue = checkInType === 'TOKEN' ? this.data.checkInTokenValue : null
            await startCheckInPromise(this.getJWT(), this.data.selectedTaskId, checkInTokenValue)
            normalToast(this, "签到成功")
            await taskStoreUtil.checkTaskStatus(this)
            if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskInfo(this, this.data.selectedTaskId)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isCheckInStarting: false
            });
        }
    }, seeTaskParticipationData() {
        wx.navigateTo({
            url: '/pages/subpages/task-management/check-in/check-in?selectedTaskId=' + this.data.selectedTaskId
        });
    }
})

async function getSelectedCheckInTaskInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedTaskId: string) {
    const selectCheckInTaskInfo = await getCheckInTaskInfoPromise(that.getJWT(), selectedTaskId)
    if (selectCheckInTaskInfo == null) that.setData({
        errorMessage: "未找到任务", errorVisible: true
    }); else {
        const countDownTime = new Date(selectCheckInTaskInfo.endTime).getTime() - Date.now()
        const targetGroupInfo: GroupInfo | undefined = that.getGroupInfo().find((groupInfo: GroupInfo) => groupInfo.groupId === selectCheckInTaskInfo.groupId)
        if (targetGroupInfo) that.setData({
            selectedTaskId: selectedTaskId,
            selectedTask: selectCheckInTaskInfo,
            countDownTime: countDownTime,
            isGroupAdmin: that.getGroupInfo().length !== 0 ? util.isAdminAndSuperAdmin(targetGroupInfo.permission) : false,
            isTaskCreator: that.getUserInfo().userId === selectCheckInTaskInfo.creatorId,
        })
    }
}

async function startCheckInPromise(jwt: string, taskId: string, token: string | null) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/task/checkIn/${taskId}`, header: {
                'Authorization': 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify(isNullOrEmptyOrUndefined(token) ? {} : {
                checkInToken: token
            }), success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}