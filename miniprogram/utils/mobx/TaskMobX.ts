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
