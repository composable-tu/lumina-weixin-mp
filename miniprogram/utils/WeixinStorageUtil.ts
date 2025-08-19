import {isNullOrEmptyOrUndefined} from "./CommonUtil";

/**
 * 获取微信存储数据，如果数据不存在则返回默认值
 * @param key 键
 * @param defaultValue 默认值
 */
export function getWeixinStorageSyncWithDefault<T>(key: string, defaultValue: T): T {
    const value = wx.getStorageSync(key);
    return isNullOrEmptyOrUndefined(value) ? defaultValue : value;
}

/**
 * 获取微信存储数据，如果数据不存在则返回默认值
 * @param key 键
 * @param defaultValue 默认值
 * @param encrypt 是否加密
 */
export async function getWeixinStorageWithDefault<T>(key: string, defaultValue: T, encrypt: boolean): Promise<T> {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: key, encrypt: encrypt, success: (res) => {
                if (res.data as T) {
                    isNullOrEmptyOrUndefined(res.data) ? resolve(defaultValue) : resolve(res.data);
                } else reject(new Error('Storage 类型错误'));
            }, fail: () => resolve(defaultValue),
        });
    })
}