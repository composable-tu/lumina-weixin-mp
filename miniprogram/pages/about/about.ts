// pages/about/about.ts

// @ts-ignore
import {copyUtil} from "../../utils/CommonUtil";
import {ICP_ID, MINI_PROGRAM_NAME, ORGANIZATION_NAME, PRIVACY_POLICY_URL, USER_AGREEMENT_URL} from '../../env';
import Message from 'tdesign-miniprogram/message/index';

const app = getApp();
const util = require("../../utils/CommonUtil");


Page({
    data: {
        footerLink: [{
            name: '用户协议', url: USER_AGREEMENT_URL, openType: '',
        }, {
            name: '隐私政策', url: PRIVACY_POLICY_URL, openType: '',
        }]
    }, touchNum: 0, onLoad() {
        const accountInfo = wx.getAccountInfoSync();
        this.setData({
            scrollHeightPx: util.getHeightPx(),
            safeAreaBottomPx: util.getSafeAreaBottomPx(),
            theme: wx.getAppBaseInfo().theme || 'light',
            luminaVersion: `${app.globalData.LUMINA_VERSION} (${accountInfo.miniProgram.envVersion})`,
            icpInfo: ICP_ID,
            orgName: ORGANIZATION_NAME,
            mpName: MINI_PROGRAM_NAME
        })
    }, onResize() {
        this.setData({
            scrollHeightPx: util.getHeightPx(), safeAreaBottomPx: util.getSafeAreaBottomPx(),
        })
    }, feedbackPopup() {
        this.setData({
            feedbackPopupVisible: true
        })
    }, onFeedbackPopupVisibleChange(e: any) {
        this.setData({
            feedbackPopupVisible: e.detail.visible
        })
    }, closeFeedbackPopup() {
        this.setData({
            feedbackPopupVisible: false
        })
    }, ossLicense() {
        wx.navigateTo({
            url: '/pages/oss-licenses/menu/oss-licenses-menu',
        })
    }, dataStatementPopupVisibleChange(e: WechatMiniprogram.CustomEvent) {
        this.setData({
            dataStatementPopupVisible: e.detail.visible
        })
    }, closeDataStatementPopup() {
        this.setData({
            dataStatementPopupVisible: false
        })
    }, openDataStatementPopup() {
        this.setData({
            dataStatementPopupVisible: true
        })
    }, luminaOpenSource() {
        copyUtil('https://github.com/LuminaPJ/lumina-weixin-mp', Message, this)
    }, async copyEnvData() {
        if (this.touchNum === 0) setTimeout(async () => {
            if (this.touchNum >= 5) { // 1 秒内 5+ 次点击
                const accountInfo = wx.getAccountInfoSync();
                const systemSetting = wx.getSystemSetting();
                const appAuthorizeSetting = wx.getAppAuthorizeSetting();
                const deviceInfo = wx.getDeviceInfo();
                const deviceBenchmarkInfo = await getDeviceBenchmarkInfo()
                const windowInfo = wx.getWindowInfo();
                const appBaseInfo = wx.getAppBaseInfo();
                const networkType = await wx.getNetworkType();
                const batteryInfo = wx.getBatteryInfoSync();

                const envData: EnvData = {
                    "小程序信息": {
                        "小程序名称": MINI_PROGRAM_NAME,
                        "AppID": accountInfo.miniProgram.appId,
                        "环境版本": accountInfo.miniProgram.envVersion,
                        "Lumina 版本": `${app.globalData.LUMINA_VERSION}`,
                        "主题": appBaseInfo.theme || 'light'
                    }, "设备信息": {
                        "设备品牌": deviceInfo.brand,
                        "设备型号": deviceInfo.model,
                        "设备二进制接口类型": deviceInfo.deviceAbi ?? "不支持",
                        "操作系统及版本": deviceInfo.system,
                        "客户端平台": deviceInfo.platform,
                        "CPU 型号": deviceInfo.cpuType,
                        "内存大小": deviceInfo.memorySize,
                        "设备性能等级": deviceBenchmarkInfo.benchmarkLevel === -1 ? '性能未知' : deviceBenchmarkInfo.benchmarkLevel,
                        "设备机型档位": getDeviceBenchmarkInfoModelLevelText(deviceBenchmarkInfo.modelLevel),
                        "设备像素比": windowInfo.pixelRatio
                    }, "系统设置": {
                        "字体大小": `${appBaseInfo.fontSizeSetting}px`,
                        "语言": appBaseInfo.language,
                        "深色模式": appBaseInfo.theme === 'dark' ? '开启' : '关闭',
                        "蓝牙": systemSetting.bluetoothEnabled ? '已开启' : '已关闭',
                        "定位": systemSetting.locationEnabled ? '已开启' : '已关闭',
                        "Wi-Fi": systemSetting.wifiEnabled ? '已开启' : '已关闭',
                    }, "网络信息": {
                        "网络类型": networkType.networkType, "网络强度": networkType.weakNet ? '弱网' : '正常',
                    }, "电池信息": {
                        "电池电量": `${batteryInfo.level}%`,
                        "充电状态": batteryInfo.isCharging ? '充电中' : '未充电',
                        "省电模式": batteryInfo.isLowPowerModeEnabled ? '已开启' : '已关闭'
                    }, "窗口信息": {
                        "窗口宽度": `${windowInfo.windowWidth}px`,
                        "窗口高度": `${windowInfo.windowHeight}px`,
                        "状态栏高度": `${windowInfo.statusBarHeight}px`,
                        "屏幕宽度": `${windowInfo.screenWidth}px`,
                        "屏幕高度": `${windowInfo.screenHeight}px`,
                        "安全区域宽度": `${windowInfo.safeArea.width}px`,
                        "安全区域高度": `${windowInfo.safeArea.height}px`
                    }, "授权设置": {
                        "定位": getAppAuthorizeText(appAuthorizeSetting.locationAuthorized),
                        "定位准确度": getAppAuthorizeSettingLocationReducedAccuracyText(appAuthorizeSetting.locationReducedAccuracy),
                        "摄像头": getAppAuthorizeText(appAuthorizeSetting.cameraAuthorized),
                        "相册": getAppAuthorizeText(appAuthorizeSetting.albumAuthorized),
                        "麦克风": getAppAuthorizeText(appAuthorizeSetting.microphoneAuthorized),
                        "蓝牙": getAppAuthorizeText(appAuthorizeSetting.bluetoothAuthorized),
                        "通知": getAppAuthorizeText(appAuthorizeSetting.notificationAuthorized),
                        "日历": getAppAuthorizeText(appAuthorizeSetting.phoneCalendarAuthorized),
                    }
                };

                let formattedData = '';
                Object.keys(envData).forEach(section => {
                    formattedData += `${section}
`
                    const sectionData = envData[section];
                    Object.keys(sectionData).forEach(key => {
                        formattedData += `  ${key}: ${sectionData[key]}\n`;
                    });
                    formattedData += '\n';
                });
                copyUtil(formattedData, Message, this);
            }
            this.touchNum = 0
        }, 1000)
        this.touchNum++
    }
})

async function getDeviceBenchmarkInfo(): Promise<WechatMiniprogram.GetDeviceBenchmarkInfoSuccessCallbackResult> {
    return new Promise((resolve, reject) => {
        wx.getDeviceBenchmarkInfo({
            success: resolve, fail: reject
        })
    })
}

function getDeviceBenchmarkInfoModelLevelText(modelLevel: number) {
    switch (modelLevel) {
        case 0:
            return '档位未知';
        case 1:
            return '高档机';
        case 2:
            return '中档机';
        case 3:
            return '低档机';
        default:
            return '档位未知';
    }
}

function getAppAuthorizeText(status: string): string {
    switch (status) {
        case 'authorized':
            return '已授权';
        case 'denied':
            return '已拒绝';
        case 'not determined':
            return '未授权';
        default:
            return '未知';
    }
}

function getAppAuthorizeSettingLocationReducedAccuracyText(status: boolean): string {
    switch (status) {
        case true:
            return '模糊定位';
        case false:
            return '精确定位';
        default:
            return '未知';
    }
}

interface EnvData {
    [key: string]: {
        [key: string]: string | number;
    };
}

