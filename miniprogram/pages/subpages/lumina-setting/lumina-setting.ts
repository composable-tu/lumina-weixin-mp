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
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../../utils/MobX";
import {Message} from 'tdesign-miniprogram';
import {
    EMPTY_JWT,
    getIsUserSoterEnabled,
    isLogin,
    loginStoreUtil,
    luminaLogout
} from "../../../utils/store-utils/LoginStoreUtil";
import {groupStoreUtil, isJoinedAnyGroup} from "../../../utils/store-utils/GroupStoreUtil";
import {userInfoStoreUtil} from "../../../utils/store-utils/UserInfoUtil";
import {checkIsSoterEnrolledInDevice, checkIsSupportSoter, luminaStartSoter} from "../../../utils/security/SoterUtil";
import {LUMINA_SERVER_HOST} from "../../../env";
import {
    agreementBadgeStoreUtil,
    cleanAgreementDocsVersionsStorage
} from "../../../utils/store-utils/AgreementBadgeStoreUtil";
import {getErrorMessage} from "../../../utils/CommonUtil";

const util = require('../../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    isLoading: boolean
    isSupportSoter: boolean
    isSoterLoading: boolean
    soterHelpPopupVisible: boolean
    isHideMore7DayEnabled: boolean
}

interface IMethods extends WechatMiniprogram.Page.InstanceMethods<IData> {
    closeSoterHelpPopup: () => void;
}

Page<IData, StoreInstance & IMethods>({
    data: {
        EMPTY_JWT: EMPTY_JWT,
        isLoading: true,
        isSoterLoading: false,
        soterHelpPopupVisible: false,
        isSupportSoter: false,
        isHideMore7DayEnabled: wx.getStorageSync('isHideMore7DayEnabled') ?? false
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ["isHideMore7DayEnabled", ...loginStoreUtil.storeBinding.fields, ...groupStoreUtil.storeBinding.fields, ...userInfoStoreUtil.storeBinding.fields, ...agreementBadgeStoreUtil.storeBinding.fields],
            actions: ["setIsHideMore7DayEnabled", "getIsHideMore7DayEnabled", ...loginStoreUtil.storeBinding.actions, ...groupStoreUtil.storeBinding.actions, ...userInfoStoreUtil.storeBinding.actions, ...agreementBadgeStoreUtil.storeBinding.actions]
        });
        let isSupportSoter = false
        try {
            isSupportSoter = (await checkIsSupportSoter()).length > 0
        } catch (e) {
            isSupportSoter = false
        }
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isLoading: true,
            isSupportSoter: isSupportSoter ?? false,
            isHideMore7DayEnabled: wx.getStorageSync('isHideMore7DayEnabled') ?? false
        })
        try {
            await loginStoreUtil.initLoginStore(this)
            if (isLogin(this.getJWT())) {
                await userInfoStoreUtil.checkUserInfoStatus(this)
                await groupStoreUtil.checkGroupStatus(this)
            }
            if (isJoinedAnyGroup(this)) await getIsUserSoterEnabled(this)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isLoading: false,
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
    }, async logout() {
        await luminaLogout(this)
        cleanAgreementDocsVersionsStorage(this)
        wx.navigateBack()
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, soterHelpPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            soterHelpPopupVisible: e.detail.visible
        })
    }, closeSoterHelpPopup() {
        this.setData({
            soterHelpPopupVisible: false
        })
    }, async switchSoter(e: WechatMiniprogram.CustomEvent) {
        try {
            const supportMode = await checkIsSoterEnrolledInDevice(await checkIsSupportSoter())
            if (supportMode.length > 0) {
                if (e.detail.value) this.setData({
                    soterHelpPopupVisible: true
                }); else await startSwitchSoter(this, e.detail.value)
            } else this.setData({
                errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
            });
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            });
        }
    }, async continueSoter() {
        this.closeSoterHelpPopup()
        setTimeout(async () => {
            await loginStoreUtil.initLoginStore(this)
            await startSwitchSoter(this, true)
        }, 300)
    }, switchHideMore7Day(e: WechatMiniprogram.CustomEvent) {
        wx.vibrateShort({
            type: 'light',
        });
        wx.setStorageSync('isHideMore7DayEnabled', e.detail.value)
        this.setIsHideMore7DayEnabled(e.detail.value)
        this.setData({
            isHideMore7DayEnabled: e.detail.value
        })
    }
})

async function startSwitchSoter(that: WechatMiniprogram.Page.Instance<IData, StoreInstance>, actionBoolean: boolean) {
    that.setData({
        isSoterLoading: true
    })
    try {
        const soterResult = await luminaStartSoter(actionBoolean ? "开启 SOTER" : "关闭 SOTER")
        if (soterResult === null) that.setData({
            errorMessage: "此设备不支持 SOTER 生物认证，或用户未在设备中录入任何生物特征", errorVisible: true
        }); else {
            const switchSoterResult = await switchSoterRequest(that.getJWT(), actionBoolean, soterResult)
            if (switchSoterResult.statusCode === 200) {
                wx.vibrateShort({
                    type: 'light',
                });
                that.setIsSoterEnabled(actionBoolean)
            }
        }
    } catch (e: any) {
        const errMsg = getErrorMessage(e)
        if (errMsg === "用户手动取消 SOTER 生物认证") Message.success({
            context: that,
            offset: [90, 32],
            duration: 3000,
            icon: false,
            single: false,
            content: errMsg,
            align: 'center'
        }); else that.setData({
            errorMessage: getErrorMessage(e), errorVisible: true
        });
    } finally {
        that.setData({
            isSoterLoading: false,
        });
    }
}

async function switchSoterRequest(jwt: string, action: boolean, soterResult: WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult): Promise<WechatMiniprogram.RequestSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.request({
            url: `https://${LUMINA_SERVER_HOST}/soter/action`, header: {
                Authorization: 'Bearer ' + jwt
            }, method: 'POST', data: JSON.stringify({
                action: action ? 'enable' : 'disable', soterInfo: {
                    json_string: soterResult.resultJSON, json_signature: soterResult.resultJSONSignature,
                }
            }), success: function (res) {
                if (res.statusCode === 200) resolve(res); else {
                    const resData = res.data as ErrorResponse;
                    reject(new Error(resData.message))
                }
            }, fail: reject
        })
    })
}

