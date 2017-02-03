import {Listener, Producer} from "xstream";
import { IMessageTarget } from "./MessageTargets";
export interface IEnvelope {
    target?: string[]; // broker name
    type: string; // messaging type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
    bare?: boolean; // post only data
    origin?: string;
}
export type StatusCallback = (status: any) => void;
export interface IBrokerMessage {
    envelope: IEnvelope;
    data: any;
}
export interface IProgressMessage extends IBrokerMessage {
    progress: StatusCallback;
}
export interface ICancelMessage extends IBrokerMessage {
    cancel: StatusCallback;
}
export interface IPortMessage extends IBrokerMessage {
    port: MessagePort;
}
export interface IAttachMessage extends IBrokerMessage {
    target: IMessageTarget;
}
export enum MessagingTypes {
    message,
    publish,
    subscribe,
    broker
}
export enum MessagingCategories {
    data,
    progress,
    cancel,
    error,
    progressCallback,
    cancelCallback,
    attach,
    dispose
}
export enum LifeCycleEvents {
    initialized,
    disposed
}
export interface IMessageTarget {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (publish: IPortMessage) => void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IPortMessage) => void;
    ondeadletter: (letter: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
export abstract class AbstractMessageProducer<T> implements Producer<T> {
    public abstract start: (listeners: Listener<T>) => void;
    public abstract trigger: (message: T) => void;
    public abstract stop: () => void;
}