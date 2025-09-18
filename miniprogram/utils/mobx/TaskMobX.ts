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
import {TaskInfo} from "../store-utils/TaskStoreUtil";
import {GroupInfo} from "../store-utils/GroupStoreUtil";

export interface TaskStoreType {
    // 任务和组相关
    taskInfo: TaskInfo[];
    groupInfo: GroupInfo[];
    setTaskInfo: (taskInfo: TaskInfo[]) => void;
    getTaskInfo: () => TaskInfo[];
    setGroupInfo: (groupInfo: GroupInfo[]) => void;
    getGroupInfo: () => GroupInfo[];
}

export const taskStore: TaskStoreType = observable({
    taskInfo: [] as TaskInfo[],
    groupInfo: [] as GroupInfo[],
    setTaskInfo: action(function (taskInfo: TaskInfo[]) {
        taskStore.taskInfo = taskInfo;
    }),
    getTaskInfo: action(function () {
        return taskStore.taskInfo;
    }),
    setGroupInfo: action(function (groupInfo: GroupInfo[]) {
        taskStore.groupInfo = groupInfo;
    }),
    getGroupInfo: action(function () {
        return taskStore.groupInfo;
    })
});
