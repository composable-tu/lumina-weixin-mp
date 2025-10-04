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
import {ActionSheet, Message, Toast} from 'tdesign-miniprogram';
import {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {store, StoreInstance} from "../../../../utils/MobX";
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {hideToast} from 'tdesign-miniprogram/toast/index';
import {GroupInfo, groupStoreUtil} from "../../../../utils/store-utils/GroupStoreUtil";
import {getErrorMessage, isNullOrEmptyOrUndefined, weixinOpenDocumentPromise} from "../../../../utils/CommonUtil";
import {
    EXPIRED,
    MARK_AS_NOT_PARTICIPANT,
    MARK_AS_PARTICIPANT,
    MARK_AS_PENDING,
    PARTICIPATED,
    PENDING,
    taskManagerFabGrid,
    taskStoreUtil
} from "../../../../utils/store-utils/TaskStoreUtil";
import {
    CheckInTaskManagerInfo,
    CheckInTaskUserStatusInfo,
    downloadCheckInTaskInfoExcelPromise,
    getCheckInTaskManagerInfoPromise,
    interventionCheckInTask
} from "../../../../utils/task-manager/CheckInTaskManager";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    isGroupAdmin: boolean
    isTaskCreator: boolean
    selectedTask: CheckInTaskManagerInfo | null
    selectedTaskId: string
    clickedUserId: string | null
    clickedUserName: string | null
    clickedUserstatus: string | null
    clickedUserParticatedAt: string | null
}


Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true, isSelectedNotFound: false,
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
                const {selectedTaskId} = options;
                if (isNullOrEmptyOrUndefined(selectedTaskId)) this.setData({
                    isSelectedNotFound: true
                }); else if (selectedTaskId) await getSelectedCheckInTaskManagerInfo(this, selectedTaskId)
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
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
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
                if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskManagerInfo(this, this.data.selectedTaskId)
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
    }, userParticipatedDetailPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            userParticipatedDetailPopupVisible: e.detail.visible
        });
    }, closeUserParticipatedDetailPopup() {
        this.setData({
            userParticipatedDetailPopupVisible: false
        });
    }, onUserItemClick(e: WechatMiniprogram.CustomEvent) {
        const clickUserInfo = this.data.selectedTask ? this.data.selectedTask.memberList.find((item: CheckInTaskUserStatusInfo) => item.userId === e.currentTarget.dataset.userId) : null;
        this.setData({
            userParticipatedDetailPopupVisible: true,
            clickedUserId: e.currentTarget.dataset.userId,
            clickedUserName: clickUserInfo?.userName ?? null,
            clickedUserStatus: clickUserInfo?.status ?? null,
            clickedUserParticipatedAt: clickUserInfo?.participatedAt ?? null
        });
    }, async markUserAsNotParticipant() {
        if (isNullOrEmptyOrUndefined(this.data.selectedTask)) {
            this.setData({
                errorMessage: "任务不存在", errorVisible: true
            });
            return;
        }
        this.setData({
            isNotParticipantMarking: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("创建任务")
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await interventionCheckInTask(this, this.data.selectedTask.taskId, this.data.clickedUserId, MARK_AS_NOT_PARTICIPANT, soterResult)
            if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskManagerInfo(this, this.data.selectedTaskId)
            this.setData({
                userParticipatedDetailPopupVisible: false
            });
            await taskStoreUtil.checkTaskStatus(this)
        } catch (e) {
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isNotParticipantMarking: false
            })
        }
    }, async markUserAsPending() {
        if (isNullOrEmptyOrUndefined(this.data.selectedTask)) {
            this.setData({
                errorMessage: "任务不存在", errorVisible: true
            });
            return;
        }
        this.setData({
            isPendingMarking: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("创建任务")
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await interventionCheckInTask(this, this.data.selectedTask.taskId, this.data.clickedUserId, MARK_AS_PENDING, soterResult)
            if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskManagerInfo(this, this.data.selectedTaskId)
            this.setData({
                userParticipatedDetailPopupVisible: false
            });
            await taskStoreUtil.checkTaskStatus(this)
        } catch (e) {
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isPendingMarking: false
            })
        }
    }, async markUserAsParticipant() {
        if (isNullOrEmptyOrUndefined(this.data.selectedTask)) {
            this.setData({
                errorMessage: "任务不存在", errorVisible: true
            });
            return;
        }
        this.setData({
            isParticipantMarking: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("创建任务")
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await interventionCheckInTask(this, this.data.selectedTask.taskId, this.data.clickedUserId, MARK_AS_PARTICIPANT, soterResult)
            if (!this.data.isSelectedNotFound) await getSelectedCheckInTaskManagerInfo(this, this.data.selectedTaskId)
            this.setData({
                userParticipatedDetailPopupVisible: false
            });
            await taskStoreUtil.checkTaskStatus(this)
        } catch (e) {
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isParticipantMarking: false
            })
        }
    }, handleFabClick() {
        ActionSheet.show({
            theme: ActionSheetTheme.Grid, selector: '#t-action-sheet', context: this, items: taskManagerFabGrid,
        });
    }, handleFabSelected(e: WechatMiniprogram.CustomEvent) {
        switch (e.detail.selected.label) {
            case '导出为 Excel':
                this.downloadAndOpenExcel()
                break;
            default:
                break;
        }
    }, async downloadAndOpenExcel() {
        Toast({
            context: this, selector: '#t-toast', message: '导出中', duration: -1, theme: 'loading', direction: 'column',
        });
        try {
            const excelFileUrl = await downloadCheckInTaskInfoExcelPromise(this.getJWT(), this.data.selectedTaskId)
            await weixinOpenDocumentPromise({filePath: excelFileUrl, showMenu: true, fileType: 'xlsx'})
        } catch (e) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            hideToast({
                context: this, selector: '#t-toast',
            });
        }
    }
})

async function getSelectedCheckInTaskManagerInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedTaskId: string) {
    const selectCheckInTaskManagerInfo = await getCheckInTaskManagerInfoPromise(that.getJWT(), selectedTaskId)
    if (selectCheckInTaskManagerInfo == null) that.setData({
        errorMessage: "未找到任务", errorVisible: true
    }); else {
        const countDownTime = new Date(selectCheckInTaskManagerInfo.endTime).getTime() - Date.now()
        const targetGroupInfo: GroupInfo | undefined = that.getGroupInfo().find((groupInfo: GroupInfo) => groupInfo.groupId === selectCheckInTaskManagerInfo.groupId)
        const orderedStatuses = [EXPIRED, PENDING, MARK_AS_NOT_PARTICIPANT, MARK_AS_PENDING, MARK_AS_PARTICIPANT, PARTICIPATED]
        const allUserList = groupAndSort(selectCheckInTaskManagerInfo.memberList, orderedStatuses)
        let newSelectCheckInTaskManagerInfo = selectCheckInTaskManagerInfo
        newSelectCheckInTaskManagerInfo.memberList = allUserList
        if (targetGroupInfo) that.setData({
            selectedTaskId: selectedTaskId,
            countDownTime: countDownTime,
            isGroupAdmin: that.getGroupInfo().length !== 0 ? util.isAdminAndSuperAdmin(targetGroupInfo.permission) : false,
            isTaskCreator: that.getUserInfo().userId === selectCheckInTaskManagerInfo.creatorId,
            selectedTask: newSelectCheckInTaskManagerInfo
        })
    }
}

function groupAndSort(list: CheckInTaskUserStatusInfo[], statuses: string[]): CheckInTaskUserStatusInfo[] {
    const groups = new Map<string, CheckInTaskUserStatusInfo[]>();

    list.forEach(user => {
        const group = groups.get(user.status) || [];
        group.push(user);
        groups.set(user.status, group);
    });

    return statuses.flatMap(status => (groups.get(status) || []).sort(byParticipatedAt));
}

function byParticipatedAt(a: CheckInTaskUserStatusInfo, b: CheckInTaskUserStatusInfo) {
    if (!a.participatedAt && !b.participatedAt) return 0
    if (!a.participatedAt) return -1
    if (!b.participatedAt) return 1
    return +new Date(b.participatedAt) - +new Date(a.participatedAt)
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}
