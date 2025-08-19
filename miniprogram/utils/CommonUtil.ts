export const formatTime = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return ([year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':'))
}

const formatNumber = (n: number) => {
    const s = n.toString()
    return s[1] ? s : '0' + s
}

// rpx to px
export const rpx2px = (rpx: number): number => {
    return Math.round(rpx / 750 * wx.getWindowInfo().windowWidth)
}

// px to rpx
export const px2rpx = (px: number): number => {
    return Math.round(px / wx.getWindowInfo().windowWidth * 750)
}

export const getHeightPx = (): number => {
    const windowInfo = wx.getWindowInfo()
    const safeAreaHeight = windowInfo.safeArea.height
    if (safeAreaHeight === 0 && safeAreaHeight === undefined) return windowInfo.windowHeight
    return safeAreaHeight
}

export const getSafeAreaBottomPx = (): number => {
    const windowInfo = wx.getWindowInfo()
    const safeAreaBottom = windowInfo.screenHeight - windowInfo.safeArea.bottom
    if (safeAreaBottom === 0 && safeAreaBottom === undefined) return 0
    return safeAreaBottom
}

/**
 * 复制字符串并弹出 Toast 提示
 *
 * **注意**：需要在使用的页面中，插入
 *
 * ```wxml
 * <!-- WXML -->
 * <t-message id="t-message"/>
 * ```
 *
 * ```TypeScript
 * // TypeScript
 * import Message from 'tdesign-miniprogram/message/index';
 * ```
 *
 * ```json5
 * // JSON
 * {
 *   "component": true,
 *   "usingComponents": {
 *     "t-message": "tdesign-miniprogram/message/message",
 *   }
 * }
 * ```
 *
 * @param copyData 要复制的字符串
 * @param that 当前页面实例
 */
export function copyUtil(copyData: string, Message: any, that: WechatMiniprogram.Page.TrivialInstance | WechatMiniprogram.Component.TrivialInstance) {
    wx.setClipboardData({
        data: copyData, success(_) {
            setTimeout(() => {
                wx.showToast({
                    title: '', duration: 0, icon: 'none'
                });
                wx.hideToast();
            }, 0)
            Message.success({
                context: that,
                offset: [90, 32],
                duration: 3000,
                icon: false,
                single: false,
                content: `已复制：${copyData}`,
                align: 'center'
            });
        }, fail: function (_) {
        }
    })
}

export const isNullOrEmptyOrUndefined = (value: any): boolean => {
    return value === null || value === undefined || value === ''
}

export const isNullOrUndefined = (value: any): boolean => {
    return value === null || value === undefined
}

export interface ErrorResponse {
    statusCode: number;
    message: string;
}

export const getErrorMessage = (e: any): string => {
    if (e.message) return e.message; else if (e.errMsg) return e.errMsg; else return e.toString()
}

export function isAdminAndSuperAdmin(permission: string) {
    return permission === 'ADMIN' || permission === 'SUPER_ADMIN'
}

export function isSuperAdmin(permission: string) {
    return permission === 'SUPER_ADMIN'
}

export function isAdmin(permission: string) {
    return permission === 'ADMIN'
}

export const GROUP_JOIN = 'GROUP_JOIN'
export const TASK_EXPAND_GROUP = 'TASK_EXPAND_GROUP'
export const TASK_CREATION = 'TASK_CREATION'


