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
import {ApprovalInfo} from "../store-utils/ApprovalStoreUtil";

export interface ApprovalStoreType {
    // 审批信息相关
    approvalInfo: ApprovalInfo[];
    selfApprovalInfo: ApprovalInfo[];
    setApprovalInfo: (approvalInfo: ApprovalInfo[]) => void;
    getApprovalInfo: () => ApprovalInfo[];
    setSelfApprovalInfo: (selfApprovalInfo: ApprovalInfo[]) => void;
    getSelfApprovalInfo: () => ApprovalInfo[];
}

export const approvalStore: ApprovalStoreType = observable({
    approvalInfo: [] as ApprovalInfo[],
    selfApprovalInfo: [] as ApprovalInfo[],
    setApprovalInfo: action(function (approvalInfo: ApprovalInfo[]) {
        approvalStore.approvalInfo = approvalInfo;
    }),
    getApprovalInfo: action(function () {
        return approvalStore.approvalInfo;
    }),
    setSelfApprovalInfo: action(function (selfApprovalInfo: ApprovalInfo[]) {
        approvalStore.selfApprovalInfo = selfApprovalInfo;
    }),
    getSelfApprovalInfo: action(function () {
        return approvalStore.selfApprovalInfo;
    })
});
