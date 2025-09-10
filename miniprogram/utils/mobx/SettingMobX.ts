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
