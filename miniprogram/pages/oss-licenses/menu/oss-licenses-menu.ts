// pages/oss-licenses/menu/oss-licenses-menu.ts
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
    data: {},
    onLoad() {
        this.storeBindings = createStoreBindings(this, {
            store, fields: ['ossLicensesDist'], actions: ['setOSSLicensesDist', 'getOSSLicensesDist']
        });
        if (this.getOSSLicensesDist().length !== 0) this.setOSSLicensesDist(ossLicensesDist)
        this.storeBindings.updateStoreBindings()
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