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
import type OSSLicensesDist from '../OSSLicensesDist';

export interface OSSLicensesStoreType {
    // 开源许可证信息
    ossLicensesDist: typeof OSSLicensesDist;
    setOSSLicensesDist: (ossLicensesDist: typeof OSSLicensesDist) => void;
    getOSSLicensesDist: () => typeof OSSLicensesDist;
}

export const ossLicensesStore: OSSLicensesStoreType = observable({
    ossLicensesDist: {} as typeof OSSLicensesDist,
    setOSSLicensesDist: action(function (ossLicensesDist: typeof OSSLicensesDist) {
        ossLicensesStore.ossLicensesDist = ossLicensesDist;
    }),
    getOSSLicensesDist: action(function (): typeof OSSLicensesDist {
        return ossLicensesStore.ossLicensesDist;
    }),
});
