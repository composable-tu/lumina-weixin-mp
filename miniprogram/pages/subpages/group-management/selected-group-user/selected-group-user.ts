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
import {ActionSheet, Message} from 'tdesign-miniprogram'
import {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {store, StoreInstance} from "../../../../utils/MobX";
import {EMPTY_JWT, getIsUserSoterEnabled, isLogin, loginStoreUtil} from "../../../../utils/store-utils/LoginStoreUtil";
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {UserInfo, userInfoStoreUtil} from "../../../../utils/store-utils/UserInfoUtil";
import {
    getGroupInfoPromise,
    GroupInfoDetail,
    GroupInfoMember,
    groupStoreUtil
} from "../../../../utils/store-utils/GroupStoreUtil";
import {
    getErrorMessage,
    isAdminAndSuperAdmin,
    isNullOrEmptyOrUndefined,
    isSuperAdmin
} from "../../../../utils/CommonUtil";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";
import {groupUserActionPromise, REMOVE_MEMBER, RESET_TO_MEMBER, SET_ADMIN} from "../../../../utils/GroupManagerUtil";

const util = require('../../../../utils/CommonUtil')

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedGroupId: string
    selectedGroupName: string | null
    selectedGroupUserPermission: string
    selectedGroupMemberList: GroupInfoMember[]
    clickedUserId: string,
    clickedUserName: string | null,
    clickedUserPermission: string | null,
    selectedSetAdminGroupMemberCache: string[]
    selectedRemoveAdminGroupMemberCache: string[]
    selectedDeleteGroupMemberCache: string[]
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        isSelectedNotFound: false,
        selectedGroupId: '',
        selectedGroupName: null,
        selectedGroupUserPermission: '',
        selectedGroupMemberList: [],
        selectedSetAdminGroupMemberCache: [],
        selectedRemoveAdminGroupMemberCache: [],
        selectedDeleteGroupMemberCache: []
    }, async onLoad(options) {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: [...loginStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields],
            actions: [...loginStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions]
        });
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(), isRefreshing: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await getIsUserSoterEnabled(this)
                const selectedGroupId = options.selectedGroupId;
                if (isNullOrEmptyOrUndefined(selectedGroupId)) this.setData({
                    isSelectedNotFound: true
                }); else if (selectedGroupId) await getSelectedGroupInfo(this, selectedGroupId)
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
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await getIsUserSoterEnabled(this);
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
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
    }, manageGroupUser() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) ActionSheet.show({
            theme: ActionSheetTheme.Grid,
            selector: '#t-action-sheet',
            context: this,
            items: isSuperAdmin(this.data.selectedGroupUserPermission) ? manageGroupUserFabTaskGridWithSuperAdmin : manageGroupUserFabTaskGridWithAdmin,
        });
    }, onClickGroupUserItem(e: WechatMiniprogram.CustomEvent) {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) {
            const userId = e.currentTarget.dataset.userId
            const userInfo = this.data.selectedGroupMemberList.find(member => member.userId === userId) ?? null
            const userName = userInfo?.userName ?? null
            const userPermission = userInfo?.permission ?? null
            this.setData({
                clickedUserId: userId,
                clickedUserName: userName,
                clickedUserPermission: userPermission,
                userDetailPopupVisible: true
            })
        }
    }, userDetailPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            userDetailPopupVisible: e.detail.visible
        })
    }, closeUserDetailPopup() {
        this.setData({
            userDetailPopupVisible: false
        })
    }, async setAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isAdminSetting: true
            })
            try {
                const userInfo = {
                    userId: this.data.clickedUserId, ...(this.data.clickedUserName && {userName: this.data.clickedUserName})
                }
                await performGroupUserAction(this, [userInfo], SET_ADMIN)
                this.setData({
                    userDetailPopupVisible: false
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminSetting: false
                })
            }
        }
    }, async removeAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isAdminRemoving: true
            })
            try {
                const userInfo = {
                    userId: this.data.clickedUserId, ...(this.data.clickedUserName && {userName: this.data.clickedUserName})
                }
                await performGroupUserAction(this, [userInfo], RESET_TO_MEMBER)
                this.setData({
                    userDetailPopupVisible: false
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminRemoving: false
                })
            }
        }
    }, async deleteUser() {
        if (!isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else {
            this.setData({
                isUserDeleting: true
            })
            try {
                const userInfo = {
                    userId: this.data.clickedUserId, ...(this.data.clickedUserName && {userName: this.data.clickedUserName})
                }
                await performGroupUserAction(this, [userInfo], REMOVE_MEMBER)
                this.setData({
                    userDetailPopupVisible: false
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isUserDeleting: false
                })
            }
        }
    }, handleManageGroupUserFabSelected(e: WechatMiniprogram.CustomEvent) {
        switch (e.detail.selected.label) {
            case '批量设为管理':
                this.setData({
                    setAdminGroupMemberPickerVisible: true
                })
                break;
            case '批量撤销管理':
                this.setData({
                    removeAdminGroupMemberPickerVisible: true
                })
                break;
            case '批量移除成员':
                this.setData({
                    deleteGroupMemberPickerVisible: true
                })
                break;
            default:
                break;
        }
    }, onSetAdminGroupMemberPickerChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            setAdminGroupMemberPickerVisible: e.detail.visible
        })
    }, onRemoveAdminGroupMemberPickerChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            removeAdminGroupMemberPickerVisible: e.detail.visible
        })
    }, onDeleteGroupMemberPickerChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            deleteGroupMemberPickerVisible: e.detail.visible
        })
    }, cancelSelectSetAdminGroupMember() {
        this.setData({
            setAdminGroupMemberPickerVisible: false
        })
    }, cancelSelectRemoveAdminGroupMember() {
        this.setData({
            removeAdminGroupMemberPickerVisible: false
        })
    }, cancelSelectDeleteGroupMember() {
        this.setData({
            deleteGroupMemberPickerVisible: false
        })
    }, handleSetAdminGroupMemberChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            selectedSetAdminGroupMemberCache: e.detail.value
        })
    }, handleRemoveAdminGroupMemberChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            selectedRemoveAdminGroupMemberCache: e.detail.value
        })
    }, handleDeleteGroupMemberChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            selectedDeleteGroupMemberCache: e.detail.value
        })
    }, async batchSetAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else if (this.data.selectedSetAdminGroupMemberCache.length === 0) this.setData({
            errorMessage: '提交的成员不能为空', errorVisible: true
        }); else {
            this.setData({
                isAdminBatchSetting: true
            })
            try {
                const memberMap = new Map(this.data.selectedGroupMemberList.map(m => [m.userId, m]));
                const selectedUserInfo = (this.data.selectedSetAdminGroupMemberCache ?? [])
                    .map(id => memberMap.get(id))
                    .filter((member): member is GroupInfoMember => member !== undefined)
                    .map(member => ({
                        userId: member.userId, ...(member.userName && {userName: member.userName})
                    }))
                await performGroupUserAction(this, selectedUserInfo, SET_ADMIN)
                this.setData({
                    setAdminGroupMemberPickerVisible: false,
                    selectedSetAdminGroupMemberCache: [],
                    selectedRemoveAdminGroupMemberCache: [],
                    selectedDeleteGroupMemberCache: []
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminBatchSetting: false
                })
            }
        }
    }, async batchRemoveAdmin() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else if (this.data.selectedRemoveAdminGroupMemberCache.length === 0) this.setData({
            errorMessage: '提交的成员不能为空', errorVisible: true
        }); else {
            this.setData({
                isAdminBatchRemoving: true
            })
            try {
                const memberMap = new Map(this.data.selectedGroupMemberList.map(m => [m.userId, m]));
                const selectedUserInfo = (this.data.selectedRemoveAdminGroupMemberCache ?? [])
                    .map(id => memberMap.get(id))
                    .filter((member): member is GroupInfoMember => member !== undefined)
                    .map(member => ({
                        userId: member.userId, ...(member.userName && {userName: member.userName})
                    }))
                await performGroupUserAction(this, selectedUserInfo, RESET_TO_MEMBER)
                this.setData({
                    removeAdminGroupMemberPickerVisible: false,
                    selectedSetAdminGroupMemberCache: [],
                    selectedRemoveAdminGroupMemberCache: [],
                    selectedDeleteGroupMemberCache: []
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isAdminBatchRemoving: false
                })
            }
        }
    }, async batchDeleteUser() {
        if (!isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            errorMessage: '您的权限不足以执行此操作', errorVisible: true
        }); else if (this.data.selectedDeleteGroupMemberCache.length === 0) this.setData({
            errorMessage: '提交的成员不能为空', errorVisible: true
        }); else {
            this.setData({
                isUserBatchDeleting: true
            })
            try {
                const memberMap = new Map(this.data.selectedGroupMemberList.map(m => [m.userId, m]));
                const selectedUserInfo = (this.data.selectedDeleteGroupMemberCache ?? [])
                    .map(id => memberMap.get(id))
                    .filter((member): member is GroupInfoMember => member !== undefined)
                    .map(member => ({
                        userId: member.userId, ...(member.userName && {userName: member.userName})
                    }))
                await performGroupUserAction(this, selectedUserInfo, REMOVE_MEMBER)
                this.setData({
                    deleteGroupMemberPickerVisible: false,
                    selectedSetAdminGroupMemberCache: [],
                    selectedRemoveAdminGroupMemberCache: [],
                    selectedDeleteGroupMemberCache: []
                })
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isUserBatchDeleting: false
                })
            }
        }
    },
})

async function performGroupUserAction(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, userList: UserInfo[], action: string) {
    await loginStoreUtil.initLoginStore(that)
    let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
    await getIsUserSoterEnabled(that)
    if (that.getIsSoterEnabled()) {
        soterResult = await luminaStartSoter("为 " + that.data.selectedGroupId + " 设置管理员 " + that.data.clickedUserId)
        if (soterResult === null) {
            that.setData({
                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
            });
            return;
        }
    }
    await groupUserActionPromise(action, that.getJWT(), that.data.selectedGroupId, userList, soterResult)
    if (!that.data.isSelectedNotFound) await getSelectedGroupInfo(that, that.data.selectedGroupId)
}

async function getSelectedGroupInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string) {
    const selectedGroupInfo: GroupInfoDetail = await getGroupInfoPromise(that.getJWT(), selectedGroupId);
    const selectedGroupUserPermission = selectedGroupInfo.memberList.find(member => member.userId === that.getUserInfo().userId)?.permission
    that.setData({
        selectedGroupId: selectedGroupInfo.groupId,
        selectedGroupName: selectedGroupInfo.groupName,
        selectedGroupUserPermission: selectedGroupUserPermission ?? "MEMBER",
        selectedGroupMemberList: selectedGroupInfo.memberList
    })
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}

const manageGroupUserFabTaskGridWithAdmin = [{
    label: '批量移除成员', icon: 'user-clear',
}];

const manageGroupUserFabTaskGridWithSuperAdmin = [{
    label: '批量设为管理', icon: 'user-arrow-up',
}, {
    label: '批量撤销管理', icon: 'user-arrow-down',
}, {
    label: '批量移除成员', icon: 'user-clear',
}];

