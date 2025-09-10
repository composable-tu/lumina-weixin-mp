// pages/subpages/task-management/vote/vote.ts
import Message from 'tdesign-miniprogram/message/index';
import {getVoteTaskManagerInfoPromise, VoteTaskInfoManagerInfo} from "../../../../utils/task-manager/VoteTaskManager";
import {store, StoreInstance} from "../../../../utils/MobX";
import {GroupInfo, groupStoreUtil} from "../../../../utils/store-utils/GroupStoreUtil";
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {taskStoreUtil} from "../../../../utils/store-utils/TaskStoreUtil";
import {getErrorMessage, isNullOrEmptyOrUndefined} from "../../../../utils/CommonUtil";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    isGroupAdmin: boolean
    isTaskCreator: boolean
    selectedTask: VoteTaskInfoManagerInfo | null
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
                }); else if (selectedTaskId) await getSelectedVoteTaskManagerInfo(this, selectedTaskId)
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
                if (!this.data.isSelectedNotFound) await getSelectedVoteTaskManagerInfo(this, this.data.selectedTaskId)
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
    }, onOptionsSelectedUserChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            optionsSelectedUserVisible: e.detail.visible
        })
    }, closeOptionsSelectedUser() {
        this.setData({
            optionsSelectedUserVisible: false
        })
    }, onNonParticipantsItemClick() {
        this.setData({
            isClickedNonParticipant: true,
            optionsSelectedUserVisible: true,
            clickedUserList: this.data.selectedTask?.voteNonParticipants || []
        })
    }, onOptionItemClick(e: WechatMiniprogram.CustomEvent) {
        const clickedOptionName = e.currentTarget.dataset.optionName
        if (clickedOptionName) {
            const clickedOption = this.data.selectedTask?.voteTaskOptions.find(option => option.optionName === clickedOptionName) ?? null
            this.setData({
                isClickedNonParticipant: false,
                optionsSelectedUserVisible: true,
                clickedOptionName: clickedOptionName,
                clickedUserList: clickedOption?.voteParticipants ?? [],
                clickedOptionDescription: clickedOption?.optionDescription ?? null
            })
        }
    }
})

async function getSelectedVoteTaskManagerInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedTaskId: string) {
    const selectCheckInTaskManagerInfo = await getVoteTaskManagerInfoPromise(that.getJWT(), selectedTaskId)
    if (selectCheckInTaskManagerInfo == null) that.setData({
        errorMessage: "未找到任务", errorVisible: true
    }); else {
        const targetGroupInfo: GroupInfo | undefined = that.getGroupInfo().find((groupInfo: GroupInfo) => groupInfo.groupId === selectCheckInTaskManagerInfo.groupId)
        const participantCount = selectCheckInTaskManagerInfo.voteTaskOptions.reduce((total, option) => total + (option.voteParticipants?.length || 0), 0)
        if (targetGroupInfo) that.setData({
            selectedTaskId: selectedTaskId,
            isGroupAdmin: that.getGroupInfo().length !== 0 ? util.isAdminAndSuperAdmin(targetGroupInfo.permission) : false,
            isTaskCreator: that.getUserInfo().userId === selectCheckInTaskManagerInfo.creatorId,
            selectedTask: selectCheckInTaskManagerInfo,
            participantCount: participantCount
        })
    }
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}



