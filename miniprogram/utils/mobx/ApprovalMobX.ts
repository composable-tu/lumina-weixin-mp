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
