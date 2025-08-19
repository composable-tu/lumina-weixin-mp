// components/error-popup/error-popup.ts
import Message from 'tdesign-miniprogram/message/index';
import {copyUtil} from "../../utils/CommonUtil";

Component({
    properties: {
        visible: {
            type: Boolean, value: false, observer(newVal) {
                if (this.data.errorVisible !== newVal) {
                    this.setData({errorVisible: newVal}, () => this.triggerEvent('visible-change', {visible: newVal}));
                }
            }
        }, message: {
            type: String | null, value: '', observer(newVal: string | null) {
                this.setData({
                    errorMessage: newVal ?? '',
                })
            }
        },
    }, data: {
        errorVisible: false, errorMessage: '', visible: false
    }, methods: {
        errorVisibleChange(e: WechatMiniprogram.CustomEvent) {
            const newVisible = e.detail.visible ?? false;
            if (this.data.errorVisible !== newVisible) this.setData({errorVisible: newVisible});
        }, closeErrorPopup() {
            this.setData({
                errorVisible: false,
            })
            this.triggerEvent('visible-change', {visible: false});
        }, copyError() {
            copyUtil(this.data.errorMessage, Message, this)
        }
    }
})