import {action, observable} from 'mobx-miniprogram';

export interface OSSLicensesStoreType {
    // 开源许可证信息
    ossLicensesDist: any;
    setOSSLicensesDist: (ossLicensesDist: any) => void;
    getOSSLicensesDist: () => any;
}

export const ossLicensesStore: OSSLicensesStoreType = observable({
    ossLicensesDist: {} as any,
    setOSSLicensesDist: action(function (ossLicensesDist: any) {
        ossLicensesStore.ossLicensesDist = ossLicensesDist;
    }),
    getOSSLicensesDist: action(function () {
        return ossLicensesStore.ossLicensesDist;
    }),
});
