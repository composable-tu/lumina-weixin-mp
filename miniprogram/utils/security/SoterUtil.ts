/**
 * 开始 SOTER 生物认证
 * @param challenge 认证事件备注
 * @return `WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult` 或 `null`，如果返回 `null` 则表示当前设备不支持任何生物认证或用户未在设备中录入任何生物特征。参见 [`object.success` 回调函数](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/soter/wx.startSoterAuthentication.html)
 */
export const luminaStartSoter = async (challenge: string): Promise<WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null> => {
    const supportMode = await checkIsSoterEnrolledInDevice(await checkIsSupportSoter())
    if (supportMode.length === 0) return null;
    return await weixinStartSoter(challenge, supportMode);
}

/**
 * 微信 SOTER 生物认证事件 Promise 封装
 * @param challenge 认证事件备注
 * @param mode 支持的生物认证方式
 * @return Promise<WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult>
 */
export const weixinStartSoter = async (challenge: string, mode: ("fingerPrint" | "facial" | "speech")[]): Promise<WechatMiniprogram.StartSoterAuthenticationSuccessCallbackResult | null> => {
    if (mode.length === 0) return null;
    return new Promise((resolve, reject) => {
        wx.startSoterAuthentication({
            requestAuthModes: mode, challenge: challenge, authContent: "SOTER 生物认证", success: resolve, fail(err){
                console.log(err);
                if (err.errMsg === 'startSoterAuthentication:fail cancel') reject(new Error("用户手动取消 SOTER 生物认证")); else reject(err);
            }
        })
    })
}

/**
 * 获取设备支持的生物认证方式
 * @return Promise<("fingerPrint" | "facial" | "speech")[]>
 */
export const checkIsSupportSoter = async (): Promise<("fingerPrint" | "facial" | "speech")[]> => {
    return new Promise((resolve, reject) => {
        wx.checkIsSupportSoterAuthentication({
            success(res) {
                resolve(res.supportMode);
            }, fail: reject
        })
    })
}

/**
 * 获取设备是否录入了指定类型的生物认证信息
 * @param supportMode 设备支持的生物认证方式，来自 `checkIsSupportSoter()`
 * @return Promise<("fingerPrint" | "facial" | "speech")[]>
 */
export const checkIsSoterEnrolledInDevice = async (supportMode: ("fingerPrint" | "facial" | "speech")[]): Promise<("fingerPrint" | "facial" | "speech")[]> => {
    if (supportMode.length === 0) return [];
    const results = await Promise.all(supportMode.map(async (mode) => {
        const res = await new Promise<{ isEnrolled: boolean }>((resolve, reject) => {
            wx.checkIsSoterEnrolledInDevice({
                checkAuthMode: mode, success: resolve, fail: reject
            })
        });
        return res.isEnrolled ? mode : null;
    }));
    return results.filter((mode): mode is "fingerPrint" | "facial" | "speech" => mode !== null);
}

