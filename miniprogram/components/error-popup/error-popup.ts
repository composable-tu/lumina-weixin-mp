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
import {Message} from 'tdesign-miniprogram';
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