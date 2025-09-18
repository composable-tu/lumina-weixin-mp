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
import {createStoreBindings} from 'mobx-miniprogram-bindings';
import {store, StoreInstance} from '../../../utils/MobX';
import ossLicensesDist from '../../../utils/OSSLicensesDist';

const util = require("../../../utils/CommonUtil");

interface IData {
    scrollHeightPx: number
    safeAreaBottomPx: number
}

Page<IData, StoreInstance>({
    // @ts-ignore
    data: {}, onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: ['ossLicensesDist'], actions: ['setOSSLicensesDist', 'getOSSLicensesDist']
        });
        if (this.getOSSLicensesDist().length !== 0) this.setOSSLicensesDist(ossLicensesDist)
        this.storeBindings.updateStoreBindings()
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
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
    }, licenseDistClick(e: WechatMiniprogram.BaseEvent) {
        wx.navigateTo({
            url: '/pages/oss-licenses/oss-licenses?index=' + e.currentTarget.dataset.index,
        })
    }
})