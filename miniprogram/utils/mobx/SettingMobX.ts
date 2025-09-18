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
import {action, observable} from 'mobx-miniprogram';

export interface SettingStoreType {
    // 设置
    isHideMore7DayEnabled: boolean;
    setIsHideMore7DayEnabled: (isHideMore7DayEnabled: boolean) => void;
    getIsHideMore7DayEnabled: () => boolean;
}

export const settingStore: SettingStoreType = observable({
    isHideMore7DayEnabled: false,
    setIsHideMore7DayEnabled: action(function (isHideMore7DayEnabled: boolean) {
        settingStore.isHideMore7DayEnabled = isHideMore7DayEnabled;
    }),
    getIsHideMore7DayEnabled: action(function () {
        return settingStore.isHideMore7DayEnabled;
    }),
});
