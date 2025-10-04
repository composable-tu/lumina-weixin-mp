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
import {ActionSheet} from 'tdesign-miniprogram';
import {ActionSheetTheme} from 'tdesign-miniprogram/action-sheet/index';
import {createStoreBindings} from "mobx-miniprogram-bindings";
import {store, StoreInstance} from "../../utils/MobX";
import {EMPTY_JWT, loginStoreUtil} from "../../utils/store-utils/LoginStoreUtil"
import {getErrorMessage} from "../../utils/CommonUtil";
import {CHECK_IN, taskStoreUtil, VOTE} from "../../utils/store-utils/TaskStoreUtil";

const util = require('../../utils/CommonUtil');

interface IData {
    EMPTY_JWT: string
    scrollHeightPx: number
    safeAreaBottomPx: number
    isRefreshing: boolean
}

Page<IData, StoreInstance>({
    data: {
        EMPTY_JWT: EMPTY_JWT, isRefreshing: true
    }, async onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store,
            fields: ["isHideMore7DayEnabled", ...loginStoreUtil.storeBinding.fields, ...taskStoreUtil.storeBinding.fields],
            actions: ["setIsHideMore7DayEnabled", "getIsHideMore7DayEnabled", ...loginStoreUtil.storeBinding.actions, ...taskStoreUtil.storeBinding.actions]
        });
        this.getTabBar().init();
        this.setIsHideMore7DayEnabled(wx.getStorageSync('isHideMore7DayEnabled') ?? false)
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            isRefreshing: true
        })
        this.setIsHideMore7DayEnabled(wx.getStorageSync('isHideMore7DayEnabled') ?? false)
        try {
            await loginStoreUtil.initLoginStore(this)
            await taskStoreUtil.checkTaskStatus(this)
        } catch (e: any) {
            console.error(e)
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, onReady() {
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings()
    }, onResize() {
        const scrollHeightPx = util.getHeightPx()
        this.setData({
            scrollHeightPx: scrollHeightPx - util.rpx2px(80), safeAreaBottomPx: util.getSafeAreaBottomPx()
        })
    }, async onShow() {
        await this.onRefresh()
    }, errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            errorVisible: e.detail.visible
        })
    }, handleFabTaskClick() {
        ActionSheet.show({
            theme: ActionSheetTheme.Grid, selector: '#t-action-sheet', context: this, items: fabTaskGrid,
        });
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
            await taskStoreUtil.checkTaskStatus(this)
        } catch (e: any) {
            this.setData({
                errorMessage: getErrorMessage(e), errorVisible: true
            })
        } finally {
            this.setData({
                isRefreshing: false
            })
        }
    }, handleFabSelected(e: WechatMiniprogram.CustomEvent) {
        switch (e.detail.selected.label) {
            case '加入团体':
                wx.navigateTo({
                    url: '/pages/subpages/join-group/join-group',
                })
                break;
            case '新建任务':
                wx.navigateTo({
                    url: '/pages/subpages/create-task/create-task',
                })
                break;
            default:
                break;
        }
    }, onTaskItemClick(e: WechatMiniprogram.CustomEvent) {
        const selectedTaskId = e.currentTarget.dataset.taskId
        const selectedTaskType = e.currentTarget.dataset.taskType
        switch (selectedTaskType) {
            case CHECK_IN:
                wx.navigateTo({
                    url: '/pages/index/selected-task/check-in/check-in?selectedTaskId=' + selectedTaskId
                });
                break;
            case VOTE:
                wx.navigateTo({
                    url: '/pages/index/selected-task/vote/vote?selectedTaskId=' + selectedTaskId
                });
                break;
            default:
                break;
        }
    }
})

/**
 * 点击首页浮动按钮的弹出菜单
 */
const fabTaskGrid = [{
    label: '新建任务', icon: 'task-add',
}, {
    label: '加入团体', icon: 'usergroup-add',
},];