import _ from "lodash";

const readyStates = ["SUCCESS"]
const unreadyStates = ["PENDING", "RECEIVED", "STARTED", "REJECTED", "RETRY"];
const exceptionStates = ["FAILURE", "REVOKED"]

interface Task {
    status: string;
}

export const ready = (task?: Task) => Boolean(task && _.includes(readyStates, task.status));
export const pending = (task?: Task) => Boolean(task && _.includes(unreadyStates, task.status));
export const failed = (task?: Task) => Boolean(task && _.includes(exceptionStates, task.status));