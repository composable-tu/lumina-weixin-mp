import {weixinLoginPromise} from "../store-utils/LoginStoreUtil";

const sm3 = require('miniprogram-sm-crypto').sm3
const sm4 = require('miniprogram-sm-crypto').sm4

export interface EncryptContent {
    encryptContent: string;
    encryptVersion: number;
    hmacSignature: string;
    weixinLoginCode: string;
}

/**
 * 使用中国商密 SM4 算法加密内容
 *
 * 可有效防止中间人攻击，但非必要不使用。
 *
 * 由于服务端仅能获取用户的最近三次加密 Key，如果出现大量并发加密内容操作会导致服务端无法解密内容。
 *
 * 参考：
 * - [小程序加密网络通道](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/user-encryptkey.html)
 * - [微信小程序 sm-crypto](https://github.com/wechat-miniprogram/sm-crypto)
 * @param content 要加密的内容
 * @returns {Promise<EncryptContent>} 加密内容
 */
export async function sm4EncryptContent(content: string): Promise<EncryptContent> {
    const encryptKey = await getWeixinCryptoKey()
    const weixinLoginCode = await weixinLoginPromise()
    const encryptData = sm4.encrypt(content, encryptKey.encryptKey, {
        mode: 'cbc', iv: encryptKey.iv
    })
    const hmacSignature = sm3(encryptData, {
        mode: 'hmac', key: encryptKey.encryptKey,
    })
    return {
        encryptContent: encryptData,
        encryptVersion: encryptKey.version,
        hmacSignature: hmacSignature,
        weixinLoginCode: weixinLoginCode
    }
}

/**
 * 微信 CryptoKey
 * @interface encryptKey 用户加密密钥
 * @interface iv 密钥初始向量
 * @interface version 密钥版本
 * @interface expireTime 密钥过期时间
 */
export interface WeixinCryptoKey {
    encryptKey: string;
    iv: string;
    version: number;
    expireTime: number;
}

async function getWeixinCryptoKey(): Promise<WeixinCryptoKey> {
    const userCryptoManager = wx.getUserCryptoManager()
    return new Promise((resolve, reject) => {
        userCryptoManager.getLatestUserKey({
            success: function (res) {
                const {encryptKey, iv, version, expireTime} = res
                const encryptKeyHex = base64KeyToHex(encryptKey)
                const sm3Iv: string = sm3(iv).substring(0, 32)
                resolve({encryptKey: encryptKeyHex, iv: sm3Iv, version, expireTime})
            }, fail: reject
        })
    })
}

function base64KeyToHex(base64Str: string): string {
    // 移除 Base64 填充字符并创建查找表
    const base64Clean = base64Str.replace(/=+$/, '');
    const lookupTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    // 转换为二进制字符串
    let binaryStr = '';
    for (let i = 0; i < base64Clean.length; i++) {
        const pos = lookupTable.indexOf(base64Clean[i]);
        if (pos >= 0) binaryStr += pos.toString(2).padStart(6, '0');
    }

    // 转换为十六进制
    let hexStr = '';
    for (let i = 0; i < binaryStr.length; i += 8) {
        const byteStr = binaryStr.substr(i, 8);
        if (byteStr.length === 8) hexStr += parseInt(byteStr, 2).toString(16).padStart(2, '0');
    }

    return hexStr.toLowerCase();
}


