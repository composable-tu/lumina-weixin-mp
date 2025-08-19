// pages/oss-licenses/oss-licenses.ts
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
    }, onUnload() {
        if (this.storeBindings) this.storeBindings.destroyStoreBindings();
    }, copyRepo() {
        copyUtil(this.data.repoLink, Message, this)
    }
})


