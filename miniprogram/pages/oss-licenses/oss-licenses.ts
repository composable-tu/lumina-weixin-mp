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
import Uri from 'jsuri'
import ossLicensesDistText from '../../utils/OSSLicensesDistText';
import {store, StoreInstance} from "../../utils/MobX";
import {copyUtil} from "../../utils/CommonUtil";
import Message from "tdesign-miniprogram/message/index"

const util = require("../../utils/CommonUtil");

interface IData {
    title: string;
    version: string;
    licenseBody: string;
    repoLink: string;
    repoType: string;
    scrollHeightPx: number;
    safeAreaBottomPx: number;
}

Page<IData, StoreInstance>({
    data: {
        title: "", version: "", licenseBody: "", repoLink: "", repoType: ""
    },

    onLoad(options: WechatMiniprogram.IAnyObject) {
        this.storeBindings = createStoreBindings(this, {
            store, fields: ['ossLicensesDist'], actions: ['getOSSLicensesDist']
        });
        this.storeBindings.updateStoreBindings()
        const index = options.index
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            title: this.getOSSLicensesDist()[index].name,
            version: this.getOSSLicensesDist()[index].version,
            licenseBody: this.getOSSLicensesDist()[index].licenseTextHash === '' ? '' : ossLicensesDistText[this.getOSSLicensesDist()[index].licenseTextHash],
            repoLink: this.getOSSLicensesDist()[index].repository,
            repoType: (() => {
                try {
                    const url = new Uri(this.getOSSLicensesDist()[index].repository)
                    const host = url.host().toLowerCase();
                    switch (host) {
                        case "github.com":
                            return "GitHub";
                        case "gitlab.com":
                            return "GitLab";
                    }
                } catch (e) {
                    console.error("Invalid URL:", e);
                }
                return "Unknown";
            })()
        })
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
    }, copyRepo() {
        copyUtil(this.data.repoLink, Message, this)
    }
})


