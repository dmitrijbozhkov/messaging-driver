import {Listener, Producer} from "xstream";
export interface IEnvelope {
    target?: string; // broker name
    type: string; // messaging type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
    bare?: boolean; // post only data
}
export interface IRoutedEnvelope {
    target: string[]; // broker name
    type: string; // messaging type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
    bare?: boolean; // post only data
}
export type StatusCallback = (status: any) => void;
export interface IRoutedMessage {
    envelope: IRoutedEnvelope;
    data: any;
}
export interface IRoutedPublish {
    envelope: IRoutedEnvelope;
    data: any;
    port: MessagePort;
}
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
export interface IPublishMessage extends IBrokerMessage {
    port: MessagePort;
}
export enum MessagingTypes {
    message,
    publish,
    subscribe
}
export enum MessagingCategories {
    data,
    progress,
    cancel,
    error,
    progressCallback,
    cancelCallback
}
export interface IMessageTarget {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (publish: IPublishMessage) => void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IPublishMessage) => void;
    ondeadletter: (letter: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
export abstract class AbstractMessageProducer<T> implements Producer<T> {
    public abstract start: (listeners: Listener<T>) => void;
    public abstract trigger: (message: T) => void;
    public abstract stop: () => void;
}