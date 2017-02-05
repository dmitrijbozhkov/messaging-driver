import { Listener, Producer } from "xstream";
import { IMessageTarget } from "./MessageTargets";
export interface IEnvelope {
    target?: string[];
    type: string;
    name: string;
    category?: string;
    bare?: boolean;
    origin?: string;
}
export declare type StatusCallback = (status: any) => void;
export declare type Transferable = MessagePort | ArrayBuffer;
export interface IMessage {
    envelope: IEnvelope;
    data: any;
}
export interface IBrokerMessage extends IMessage {
    transfer?: Transferable[];
}
export interface IProgressMessage extends IMessage {
    progress: StatusCallback;
}
export interface ICancelMessage extends IMessage {
    cancel: StatusCallback;
}
export interface IPortMessage extends IMessage {
    port: MessagePort;
}
export interface IAttachMessage extends IMessage {
    target: IMessageTarget;
}
export declare enum MessagingTypes {
    message = 0,
    publish = 1,
    subscribe = 2,
    broker = 3,
}
export declare enum MessagingCategories {
    data = 0,
    progress = 1,
    cancel = 2,
    error = 3,
    progressCallback = 4,
    cancelCallback = 5,
    attach = 6,
    dispose = 7,
}
export declare enum LifeCycleEvents {
    initialized = 0,
    disposed = 1,
}
export declare abstract class AbstractMessageProducer<T> implements Producer<T> {
    abstract start: (listeners: Listener<T>) => void;
    abstract trigger: (message: T) => void;
    abstract stop: () => void;
}
