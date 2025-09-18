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
