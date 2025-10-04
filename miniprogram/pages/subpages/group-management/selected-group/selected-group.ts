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
import {
    getGroupInfoPromise,
    GroupInfoDetail,
    GroupInfoMember,
    groupStoreUtil,
    quitGroupPromise
} from "../../../../utils/store-utils/GroupStoreUtil";
import {Message} from 'tdesign-miniprogram';
import {
    formatTime,
    getErrorMessage,
    isAdminAndSuperAdmin,
    isNullOrEmptyOrUndefined,
    isSuperAdmin
} from "../../../../utils/CommonUtil";
import dayjs from "dayjs";
import {luminaStartSoter} from "../../../../utils/security/SoterUtil";
import {renameGroupPromise, setGroupPreAuthTokenPromise} from "../../../../utils/GroupManagerUtil";

const util = require('../../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isRefreshing: boolean
    isSelectedNotFound: boolean
    selectedGroupId: string
    selectedGroupName: string | null
    selectedGroupUserPermission: string
    selectedGroupCreateAt: string
    selectedIsPreAuthTokenEnable: boolean
    selectedGroupMemberList: GroupInfoMember[]
    preAuthTokenValidityValue: number
    setPreAuthTokenPopupVisible: boolean
    preAuthTokenValue: string
    isPreAuthTokenSubmitting: boolean
    renameGroupValue: string
    renameGroupPopupVisible: boolean
    isGroupRenaming: boolean
    quitGroupPopupVisible: boolean
    isGroupQuiting: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isRefreshing: true,
        isSelectedNotFound: false,
        selectedGroupId: '',
        selectedGroupName: null,
        selectedGroupUserPermission: '',
        selectedGroupCreateAt: '',
        selectedIsPreAuthTokenEnable: false,
        selectedGroupMemberList: [],
        preAuthTokenValidityValue: 10,
        setPreAuthTokenPopupVisible: false,
        preAuthTokenValue: '',
        isPreAuthTokenSubmitting: false,
        renameGroupValue: '',
        renameGroupPopupVisible: false,
        isGroupRenaming: false,
        quitGroupPopupVisible: false,
        isGroupQuiting: false
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
                await getIsUserSoterEnabled(this)
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
    }, setPreAuthTokenPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            setPreAuthTokenPopupVisible: e.detail.visible
        })
    }, onPreAuthTokenClick() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            setPreAuthTokenPopupVisible: true
        })
    }, closeSetPreAuthTokenPopup() {
        this.setData({
            setPreAuthTokenPopupVisible: false
        })
    }, onChangePreAuthTokenValidity(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            preAuthTokenValidityValue: e.detail.value
        })
    }, onChangePreAuthToken(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            preAuthTokenValue: e.detail.value
        })
    }, async continueSetPreAuthToken() {
        if (this.data.preAuthTokenValue === '') this.setData({
            errorMessage: '请输入预授权凭证', errorVisible: true
        }); else {
            this.setData({
                isPreAuthTokenSubmitting: true
            })
            try {
                await loginStoreUtil.initLoginStore(this)
                let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                await getIsUserSoterEnabled(this)
                if (this.getIsSoterEnabled()) {
                    soterResult = await luminaStartSoter("设置预授权凭证")
                    if (soterResult === null) {
                        this.setData({
                            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                            errorVisible: true
                        });
                        return;
                    }
                }
                await setGroupPreAuthTokenPromise(this.getJWT(), this.data.selectedGroupId, this.data.preAuthTokenValue, this.data.preAuthTokenValidityValue, soterResult)
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
                normalToast(this, '预授权凭证已生效')
                this.setData({
                    setPreAuthTokenPopupVisible: false
                });
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isPreAuthTokenSubmitting: false
                })
            }
        }
    }, renameGroupPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            renameGroupPopupVisible: e.detail.visible
        })
    }, onRenameGroupClick() {
        if (isAdminAndSuperAdmin(this.data.selectedGroupUserPermission)) this.setData({
            renameGroupPopupVisible: true
        })
    }, closeRenameGroupPopup() {
        this.setData({
            renameGroupPopupVisible: false
        })
    }, onChangeRenameGroup(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            renameGroupValue: e.detail.value
        })
    }, async continueRenameGroup() {
        if (this.data.renameGroupValue === '') this.setData({
            errorMessage: '请输入群组名称', errorVisible: true
        }); else {
            this.setData({
                isGroupRenaming: true
            })
            try {
                await loginStoreUtil.initLoginStore(this)
                let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
                await getIsUserSoterEnabled(this)
                if (this.getIsSoterEnabled()) {
                    soterResult = await luminaStartSoter("重命名团体 " + this.data.selectedGroupId)
                    if (soterResult === null) {
                        this.setData({
                            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征",
                            errorVisible: true
                        });
                        return;
                    }
                }
                await renameGroupPromise(this.getJWT(), this.data.selectedGroupId, this.data.renameGroupValue, soterResult)
                if (!this.data.isSelectedNotFound) await getSelectedGroupInfo(this, this.data.selectedGroupId)
                normalToast(this, '重命名成功')
                this.setData({
                    renameGroupPopupVisible: false
                });
            } catch (e: any) {
                const errMsg = getErrorMessage(e)
                if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                    errorMessage: getErrorMessage(e), errorVisible: true
                });
            } finally {
                this.setData({
                    isGroupRenaming: false
                })
            }
        }
    }, onClickGroupUser() {
        wx.navigateTo({
            url: '/pages/subpages/group-management/selected-group-user/selected-group-user?selectedGroupId=' + this.data.selectedGroupId
        })
    }, onQuitGroupClick() {
        if (!isSuperAdmin(this.data.selectedGroupUserPermission)) {
            this.setData({
                quitGroupPopupVisible: true
            })
        }
    }, quitGroupPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            quitGroupPopupVisible: e.detail.visible
        })
    }, async continueQuitGroup() {
        this.setData({
            isQuitGroupSubmitting: true
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            let soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null = null
            await getIsUserSoterEnabled(this)
            if (this.getIsSoterEnabled()) {
                soterResult = await luminaStartSoter("退出团体 " + this.data.selectedGroupId)
                if (soterResult === null) {
                    this.setData({
                        errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
                    });
                    return;
                }
            }
            await quitGroupPromise(this.getJWT(), this.data.selectedGroupId, soterResult)
            await groupStoreUtil.checkGroupStatus(this)
            wx.navigateBack()
        } catch (e: any) {
            const errMsg = getErrorMessage(e)
            if (errMsg === "用户手动取消 SOTER 生物认证") normalToast(this, errMsg); else this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        } finally {
            this.setData({
                isQuitGroupSubmitting: false
            })
        }
    }, closeQuitGroupPopup() {
        this.setData({
            quitGroupPopupVisible: false
        })
    }
})

async function getSelectedGroupInfo(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, selectedGroupId: string) {
    const selectedGroupInfo: GroupInfoDetail = await getGroupInfoPromise(that.getJWT(), selectedGroupId);
    const selectedGroupUserPermission = selectedGroupInfo.memberList.find(member => member.userId === that.getUserInfo().userId)?.permission
    const selectedGroupCreateAt = formatTime(dayjs(selectedGroupInfo.createAt).toDate())
    that.setData({
        selectedGroupId: selectedGroupInfo.groupId,
        selectedGroupName: selectedGroupInfo.groupName,
        selectedGroupCreateAt: selectedGroupCreateAt,
        selectedGroupUserPermission: selectedGroupUserPermission ?? "MEMBER",
        selectedIsPreAuthTokenEnable: selectedGroupInfo.isPreAuthTokenEnable,
        selectedGroupMemberList: selectedGroupInfo.memberList
    })
}

function normalToast(that: WechatMiniprogram.Page.TrivialInstance, content: string) {
    Message.success({
        context: that, offset: [90, 32], duration: 3000, icon: false, single: false, content: content, align: 'center'
    });
}

