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
import {Message} from 'tdesign-miniprogram';
import {store, StoreInstance} from "../../../../utils/MobX";
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {GroupInfo, groupStoreUtil} from "../../../../utils/store-utils/GroupStoreUtil";
import {getVoteTaskInfoPromise, taskStoreUtil, VoteTaskInfo} from "../../../../utils/store-utils/TaskStoreUtil";
import {ErrorResponse, getErrorMessage, isNullOrEmptyOrUndefined} from "../../../../utils/CommonUtil";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";
import {LUMINA_SERVER_HOST} from "../../../../env";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedTaskId: string
    selectedTask: VoteTaskInfo,
    isGroupAdmin: boolean
    isTaskCreator: boolean
    countDownTime: number
    selectedVoteOptionsCache: string[]
    participantCount: number
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        isSelectedNotFound: false,
        selectedVoteId: '',
        isGroupAdmin: false,
        selectedVoteOptionsCache: [],
        participantCount: 0
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
                }); else if (selectedTaskId) await getSelectedVoteTaskInfo(this, selectedTaskId)
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
                if (!this.data.isSelectedNotFound) await getSelectedVoteTaskInfo(this, this.data.selectedTaskId)
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
    }, onSelectedVoteOptionsChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            selectedVoteOptionsCache: e.detail.value
        });
    }, async startVote() {
        const maxSelectable = this.data.selectedTask.voteMaxSelectable
        const selectedOptions = this.data.selectedVoteOptionsCache
        if (selectedOptions.length > maxSelectable) {
            this.setData({
                errorMessage: '最多选择 ' + maxSelectable + ' 项', errorVisible: true
            });
            return;
        } else if (selectedOptions.length === 0) {
            this.setData({
                errorMessage: '请至少选择一项', errorVisible: true
            });
            return;
        }
        this.setData({
            isVoteStarting: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("投票 " + this.data.selectedTaskId)
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await startVotePromise(this.getJWT(), this.data.selectedTaskId, this.data.selectedVoteOptionsCache, soterResult)
            normalToast(this, "投票成功")
            await taskStoreUtil.checkTaskStatus(this)
            if (!this.data.isSelectedNotFound) await getSelectedVoteTaskInfo(this, this.data.selectedTaskId)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isVoteStarting: false
            });
        }
    }, async recallVote() {
        this.setData({
            isVoteRecalling: true
        });
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("撤回投票 " + this.data.selectedTaskId)
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await startRecallVotePromise(this.getJWT(), this.data.selectedTaskId, soterResult)
            normalToast(this, "撤回投票成功")
            await taskStoreUtil.checkTaskStatus(this)
            if (!this.data.isSelectedNotFound) await getSelectedVoteTaskInfo(this, this.data.selectedTaskId)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isVoteRecalling: false
            });
        }
    }, seeTaskParticipationData() {
        wx.navigateTo({
            url: '/pages/subpages/task-management/vote/vote?selectedTaskId=' + this.data.selectedTaskId
        });
    }
})

async function getSelectedVoteTaskInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedTaskId: string) {
    const selectVoteTaskInfo = await getVoteTaskInfoPromise(that.getJWT(), selectedTaskId)
    if (selectVoteTaskInfo == null) that.setData({
        errorMessage: "未找到任务", errorVisible: true
    }); else {
        if (selectVoteTaskInfo.voteTaskOptions) selectVoteTaskInfo.voteTaskOptions.sort((a, b) => a.sortOrder - b.sortOrder);
        const countDownTime = new Date(selectVoteTaskInfo.endTime).getTime() - Date.now()
        const targetGroupInfo: GroupInfo | undefined = that.getGroupInfo().find((groupInfo: GroupInfo) => groupInfo.groupId === selectVoteTaskInfo.groupId)
        const isParticipated = selectVoteTaskInfo.status === "PARTICIPATED"
        const usersChoice = isParticipated ? selectVoteTaskInfo.voteTaskOptions.filter(option => option.isUserSelected).map(option => option.optionName) : []
        const isResultPublic = selectVoteTaskInfo.isVoteResultPublic && (selectVoteTaskInfo.status === "PARTICIPATED" || selectVoteTaskInfo.status === "EXPIRED")
        const participantCount = isResultPublic ? selectVoteTaskInfo.voteTaskOptions.reduce((total, option) => total + (option.voteCount || 0), 0) : 0
        if (targetGroupInfo) that.setData({
            selectedTaskId: selectedTaskId,
            selectedTask: selectVoteTaskInfo,
            countDownTime: countDownTime,
            isGroupAdmin: that.getGroupInfo().length !== 0 ? util.isAdminAndSuperAdmin(targetGroupInfo.permission) : false,
            isTaskCreator: that.getUserInfo().userId === selectVoteTaskInfo.creatorId,
            selectedVoteOptionsCache: isParticipated ? usersChoice : [],
            participantCount: isResultPublic ? participantCount : 0,
        })
    }
}

async function startVotePromise(jwt: string, taskId: string, voteOptions: string[] | null, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/task/vote/${taskId}`, header: {
                'Authorization': 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify({
                voteOptions: voteOptions, ...(soterResult && {soterInfo: {...soterInfo}})
            }), success(res) {
                if (res.statusCode === 200) resolve(res.data); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

async function startRecallVotePromise(jwt: string, taskId: string, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/task/vote/${taskId}/recall`, header: {
                'Authorization': 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify({
                ...(soterResult && {soterInfo: {...soterInfo}})
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