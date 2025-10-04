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
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {
    getGroupInfoPromise,
    GroupInfo,
    GroupInfoDetail,
    GroupInfoMember,
    groupStoreUtil
} from "../../../utils/store-utils/GroupStoreUtil";
import {Message} from 'tdesign-miniprogram';
import {
    ErrorResponse,
    getErrorMessage,
    isAdminAndSuperAdmin,
    isNullOrEmptyOrUndefined,
    isNullOrUndefined
} from "../../../utils/CommonUtil";
import {
    BLACKLIST,
    CHECK_IN,
    LOTTERY,
    ORDINARY_CHECK_IN,
    taskStoreUtil,
    TOKEN_CHECK_IN,
    VOTE,
    VoteOption,
    WHITELIST
} from "../../../utils/store-utils/TaskStoreUtil";
import dayjs from "dayjs";
import {luminaStartSoter} from "../../../utils/security/SoterUtil";
import {EncryptContent, sm4EncryptContent} from "../../../utils/security/WeixinUserCrypto";
import {LUMINA_SERVER_HOST} from "../../../env";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    administratedGroup: GroupInfo[]
    selectedGroup: GroupInfo | null
    memberFromSelectedGroup: GroupInfoMember[]
    selectedGroupMember: GroupInfoMember[]
    selectedGroupMemberCache: string[]
    checkInTokenValue: string
    taskTitleValue: string
    taskDescriptionValue: string
    selectedTaskType: { label: string, value: string }
    endDateTime: string
    isWhiteListEnabled: boolean
    isCheckInTokenEnabled: boolean
    voteOptions: VoteOption[]
    isVoteCanRecallEnabled: boolean
    isVoteResultPublicDisabled: boolean
    maxChoiceValue: number
}

const TaskTypeOptions = [{label: '签到', value: CHECK_IN}, {
    label: '投票', value: VOTE
}, {label: '抽签', value: LOTTERY, tag: '暂不可用'}]

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        administratedGroup: [],
        groupFormatter(item: GroupInfo) {
            if (item.groupName) return {
                value: item.groupId, label: item.groupName, tag: item.groupId
            }; else return {
                value: item.groupId, label: item.groupId,
            };
        },
        TaskTypeOptions: TaskTypeOptions,
        isWhiteListEnabled: false,
        selectedGroupMember: [],
        endDateTime: dayjs(Date.now() + 10 * 60 * 1000).format('YYYY-MM-DDTHH:mm:ss'),
        isCheckInTokenEnabled: false,
        checkInTokenValue: '',
        taskTitleValue: '',
        taskDescriptionValue: '',
        voteOptions: [{
            optionName: '', sortOrder: 1, optionDescription: ''
        }, {
            optionName: '', sortOrder: 2, optionDescription: ''
        },],
        isVoteCanRecallEnabled: false,
        isVoteResultPublicDisabled: false,
        maxChoiceValue: 1
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...taskStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...taskStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true,
            endDateTime: dayjs(Date.now() + 10 * 60 * 1000).format('YYYY-MM-DDTHH:mm:ss'),
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
                await getIsUserSoterEnabled(this)
                this.setData({
                    administratedGroup: this.getGroupInfo().filter((group: GroupInfo) => isAdminAndSuperAdmin(group.permission))
                })
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
    }, onReady(){
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onResize(){
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    },onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, login() {
        wx.navigateTo({
            url: '/pages/login/login',
        })
    }, onGroupPickerChange(e: WechatMiniprogram.CustomEvent) {
        const value = e.detail.value[0];
        // @ts-ignore
        if (isNullOrUndefined(this.data.selectedGroup) || this.data.selectedGroup.groupId !== value) this.setData({
            selectedGroupMember: [], memberFromSelectedGroup: []
        })
        this.setData({
            groupPickerVisible: false,
            selectedGroup: this.data.administratedGroup.find(group => group.groupId === value),
        });
    }, onGroupPickerCancel() {
        this.setData({
            groupPickerVisible: false
        });
    }, onGroupPickerStart() {
        this.setData({
            groupPickerVisible: true
        });
    }, onTaskTypePickerStart() {
        this.setData({
            taskTypePickerVisible: true
        });
    }, onTaskTypePickerChange(e: WechatMiniprogram.CustomEvent) {
        const value = e.detail.value[0];
        this.setData({
            taskTypePickerVisible: false, selectedTaskType: TaskTypeOptions.find(option => option.value === value)
        });
    }, onTaskTypePickerCancel() {
        this.setData({
            taskTypePickerVisible: false
        });
    }, switchWhiteList(e: WechatMiniprogram.CustomEvent) {
        wx.vibrateShort({
            type: 'light',
        });
        this.setData({
            isWhiteListEnabled: e.detail.value
        });
    }, onEndDateTimePickerStart() {
        this.setData({
            endDateTimePickerVisible: true
        });
    }, hideEndDateTimePicker() {
        this.setData({
            endDateTimePickerVisible: false
        });
    }, onEndDateTimePickerChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            endDateTime: e.detail.value, endDateTimePickerVisible: false
        });
    }, async onGroupMemberPickerStart() {
        try {
            await groupStoreUtil.checkGroupStatus(this);
            if (isLogin(this.getJWT()) && this.data.selectedGroup?.groupId != null) await getSelectedGroupMember(this, this.data.selectedGroup.groupId)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        }
        this.setData({
            groupMemberPickerVisible: true
        });
    }, onGroupMemberPickerChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            groupMemberPickerVisible: e.detail.visible
        });
    }, cancelSelectGroupMember() {
        const selectedGroupMemberCache: string[] = [];
        this.data.selectedGroupMember.forEach((item) => {
            selectedGroupMemberCache.push(item.userId)
        })
        this.setData({
            groupMemberPickerVisible: false, selectedGroupMemberCache: selectedGroupMemberCache
        });
    }, handleGroupMemberChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            selectedGroupMemberCache: e.detail.value
        })
    }, submitGroupMember() {
        const memberMap = new Map(this.data.memberFromSelectedGroup.map(m => [m.userId, m]));
        const selectedGroupMember = this.data.selectedGroupMemberCache
            .map(id => memberMap.get(id))
            .filter((member): member is GroupInfoMember => member !== undefined);
        this.setData({
            groupMemberPickerVisible: false, selectedGroupMember: selectedGroupMember
        });
    }, startCheckInSetting() {
        this.setData({
            setCheckInSettingPopupVisible: true
        })
    }, setCheckInSettingPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            setCheckInSettingPopupVisible: e.detail.visible
        })
    }, switchCheckInToken(e: WechatMiniprogram.CustomEvent) {
        wx.vibrateShort({
            type: 'light',
        });
        this.setData({
            isCheckInTokenEnabled: e.detail.value
        })
    }, onChangeCheckInToken(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            checkInTokenValue: e.detail.value
        })
    }, closeSetCheckInSetting() {
        this.setData({
            setCheckInSettingPopupVisible: false
        })
    }, onChangeTaskTitle(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            taskTitleValue: e.detail.value
        })
    }, onChangeTaskDescription(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            taskDescriptionValue: e.detail.value
        })
    }, async createTask() {
        const taskType = isNullOrUndefined(this.data.selectedTaskType) ? null : this.data.selectedTaskType.value;
        const taskEndTime = this.data.endDateTime;
        let taskTitle = isNullOrEmptyOrUndefined(this.data.taskTitleValue) ? null : this.data.taskTitleValue;
        const selectedGroupId = isNullOrUndefined(this.data.selectedGroup) ? null : this.data.selectedGroup.groupId;
        const taskDescription = this.data.taskDescriptionValue;
        const taskMemberPolicyType = this.data.isWhiteListEnabled ? WHITELIST : BLACKLIST;
        const groupInfoMemberForSubmit: GroupInfoMemberForSubmit[] = []
        this.data.selectedGroupMember.forEach(member => {
            groupInfoMemberForSubmit.push({
                userId: member.userId, userName: member.userName
            })
        })
        if (isNullOrEmptyOrUndefined(taskType) || isNullOrEmptyOrUndefined(taskEndTime) || isNullOrEmptyOrUndefined(taskMemberPolicyType) || isNullOrEmptyOrUndefined(selectedGroupId)) {
            this.setData({
                errorMessage: '存在尚未填写的信息，请检查所有信息是否填写完毕', errorVisible: true
            })
            return;
        }
        if (taskMemberPolicyType === WHITELIST && groupInfoMemberForSubmit.length === 0) {
            this.setData({
                errorMessage: '创建白名单任务时必须选择任务成员', errorVisible: true
            })
            return;
        }
        if (taskTitle === null) taskTitle = this.data.selectedTaskType.label + '任务'
        switch (taskType) {
            case CHECK_IN:
                const checkInType = this.data.isCheckInTokenEnabled && this.data.checkInTokenValue ? TOKEN_CHECK_IN : ORDINARY_CHECK_IN;
                this.setData({
                    isTaskCreating: true
                })
                try {
                    await loginStoreUtil.initLoginStore(this)
                    let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                    await getIsUserSoterEnabled(this)
                    if (this.getIsSoterEnabled()) {
                        soterResult = await luminaStartSoter("创建任务")
                        if (soterResult === null) {
                            this.setData({
                                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                                errorVisible: true
                            });
                            return;
                        }
                    }
                    await createCheckInTask(this, selectedGroupId, taskTitle, taskEndTime, taskMemberPolicyType, checkInType, this.data.checkInTokenValue, groupInfoMemberForSubmit, taskDescription, soterResult)
                    await taskStoreUtil.checkTaskStatus(this)
                    wx.navigateBack()
                } catch (e) {
                    const errMsg = getErrorMessage(e)
                    if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                        errorMessage: getErrorMessage(e), errorVisible: true
                    });
                } finally {
                    this.setData({
                        isTaskCreating: false
                    })
                }
                break;
            case VOTE:
                const hasEmptyOption = this.data.voteOptions.some(option => {
                    return isNullOrEmptyOrUndefined(option.optionName);
                });
                if (hasEmptyOption) {
                    this.setData({
                        errorMessage: '存在尚未填写的信息，请检查所有信息是否填写完毕', errorVisible: true
                    });
                    break;
                }

                this.setData({
                    isTaskCreating: true
                })
                try {
                    await loginStoreUtil.initLoginStore(this)
                    let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                    await getIsUserSoterEnabled(this)
                    if (this.getIsSoterEnabled()) {
                        soterResult = await luminaStartSoter("创建任务")
                        if (soterResult === null) {
                            this.setData({
                                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                                errorVisible: true
                            });
                            return;
                        }
                    }
                    let maxChoiceValue = this.data.maxChoiceValue
                    if (maxChoiceValue > this.data.voteOptions.length) maxChoiceValue = this.data.voteOptions.length
                    await createVoteTask(this, selectedGroupId, taskTitle, taskEndTime, taskMemberPolicyType, maxChoiceValue, this.data.isVoteCanRecallEnabled, !this.data.isVoteResultPublicDisabled, this.data.voteOptions, groupInfoMemberForSubmit, taskDescription, soterResult)
                    await taskStoreUtil.checkTaskStatus(this)
                    wx.navigateBack()
                } catch (e) {
                    const errMsg = getErrorMessage(e)
                    if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                        errorMessage: getErrorMessage(e), errorVisible: true
                    });
                } finally {
                    this.setData({
                        isTaskCreating: false
                    })
                }
                break;
            case LOTTERY:
                this.setData({
                    errorMessage: '这块代码还没写完，请耐心等待后续更新', errorVisible: true
                })
                break
            default:
                break;
        }
    }, addVoteOption() {
        this.setData({
            voteOptions: [...this.data.voteOptions, {
                optionName: "", sortOrder: this.data.voteOptions.length + 1, optionDescription: ""
            }]
        })
    }, removeVoteOption() {
        this.setData({
            voteOptions: this.data.voteOptions.slice(0, this.data.voteOptions.length - 1)
        })
    }, onChangeVoteOptionName(e: WechatMiniprogram.CustomEvent) {
        const changeIndex = e.currentTarget.dataset.index;
        const newVoteOptions = this.data.voteOptions;
        newVoteOptions[changeIndex].optionName = e.detail.value
        this.setData({
            voteOptions: newVoteOptions
        });
    }, onChangeVoteOptionDescription(e: WechatMiniprogram.CustomEvent) {
        const changeIndex = e.currentTarget.dataset.index;
        const newVoteOptions = this.data.voteOptions;
        newVoteOptions[changeIndex].optionDescription = e.detail.value
        this.setData({
            voteOptions: newVoteOptions
        });
    }, startVoteSetting() {
        this.setData({
            setVoteSettingPopupVisible: true
        })
    }, setVoteSettingPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            setVoteSettingPopupVisible: e.detail.visible
        })
    }, closeSetVoteSetting() {
        this.setData({
            setVoteSettingPopupVisible: false
        })
    }, onChangeMaxChoice(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            maxChoiceValue: e.detail.value
        })
    }, switchVoteResultPublic(e: WechatMiniprogram.CustomEvent) {
        wx.vibrateShort({
            type: 'light',
        });
        this.setData({
            isVoteResultPublicDisabled: e.detail.value
        })
    }, switchVoteCanRecall(e: WechatMiniprogram.CustomEvent) {
        wx.vibrateShort({
            type: 'light',
        });
        this.setData({
            isVoteCanRecallEnabled: e.detail.value
        })
    }
})

async function getSelectedGroupMember(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string) {
    const selectedGroupInfo: GroupInfoDetail = await getGroupInfoPromise(that.getJWT(), selectedGroupId);
    that.setData({
        memberFromSelectedGroup: selectedGroupInfo.memberList,
    })
}

interface GroupInfoMemberForSubmit {
    userId: string,
    userName: string | null
}

async function createCheckInTask(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string, taskName: string, taskEndTime: string, taskMemberPolicyType: string, checkInType: string, checkInToken: string | null, groupInfoMemberForSubmit: GroupInfoMemberForSubmit[] | null, taskDescription: string | null, soterInfo: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const jwt = that.getJWT();
    const createCheckInTaskRequestBody = buildCreateCheckInTaskRequestBody(taskName, taskEndTime, taskMemberPolicyType, checkInType, checkInToken, groupInfoMemberForSubmit, taskDescription, soterInfo)
    const encryptRequest = await sm4EncryptContent(JSON.stringify(createCheckInTaskRequestBody))
    await createTaskPromise(jwt, selectedGroupId, encryptRequest)
}

async function createVoteTask(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string, taskName: string, taskEndTime: string, taskMemberPolicyType: string, voteMaxSelectable: number, voteCanRecall: boolean, isVoteResultPublic: boolean, voteTaskOption: VoteOption[], groupInfoMemberForSubmit: GroupInfoMemberForSubmit[] | null, taskDescription: string | null, soterInfo: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const jwt = that.getJWT();
    const createVoteTaskRequestBody = buildCreateVoteTaskRequestBody(taskName, taskEndTime, taskMemberPolicyType, voteMaxSelectable, voteCanRecall, isVoteResultPublic, voteTaskOption, groupInfoMemberForSubmit, taskDescription, soterInfo)
    const encryptRequest = await sm4EncryptContent(JSON.stringify(createVoteTaskRequestBody))
    await createTaskPromise(jwt, selectedGroupId, encryptRequest)
}

function buildCreateCheckInTaskRequestBody(taskName: string, taskEndTime: string, taskMemberPolicyType: string, checkInType: string, checkInToken: string | null, groupInfoMemberForSubmit: GroupInfoMemberForSubmit[] | null, taskDescription: string | null, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        taskName: taskName,
        taskType: CHECK_IN,
        checkInType: checkInType,
        endTime: taskEndTime,
        memberPolicy: taskMemberPolicyType, ...(taskDescription && {description: taskDescription}), ...(groupInfoMemberForSubmit && {memberPolicyList: groupInfoMemberForSubmit}), ...(checkInToken && {checkInToken}), ...(soterResult && {soterInfo: {...soterInfo}})
    }
}

function buildCreateVoteTaskRequestBody(taskName: string, taskEndTime: string, taskMemberPolicyType: string, voteMaxSelectable: number, voteCanRecall: boolean, isVoteResultPublic: boolean, voteTaskOption: VoteOption[], groupInfoMemberForSubmit: GroupInfoMemberForSubmit[] | null, taskDescription: string | null, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null) {
    const soterInfo = soterResult ? {
        json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature
    } : {}
    return {
        taskName: taskName,
        taskType: VOTE,
        endTime: taskEndTime,
        voteMaxSelectable: voteMaxSelectable,
        voteCanRecall: voteCanRecall,
        isVoteResultPublic: isVoteResultPublic,
        voteTaskOption: voteTaskOption,
        memberPolicy: taskMemberPolicyType, ...(taskDescription && {description: taskDescription}), ...(groupInfoMemberForSubmit && {memberPolicyList: groupInfoMemberForSubmit}), ...(soterResult && {soterInfo: {...soterInfo}})
    }
}

async function createTaskPromise(jwt: string, selectedGroupId: string, encryptRequest: EncryptContent) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/task/create/${selectedGroupId}`, header: {
                Authorization: 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify(encryptRequest), success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.data);
                } else {
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
