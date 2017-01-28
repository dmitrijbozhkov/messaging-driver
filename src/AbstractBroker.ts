import {Listener, Producer} from "xstream";
export interface IEnvelope {
    target?: string; // broker name
    type: string; // messaging type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
    bare?: boolean; // post only data
    progress?: boolean; // give progress callback to responder
    cancel?: boolean; // give cancellation token to responder
}
export type CancelCallback = (message: any) => void;
export type ProgressCallback = (progress: number, status: string,  message: string) => void;
export interface IBrokerMessage {
    envelope: IEnvelope;
    message: any;
    callback?: ProgressCallback | CancelCallback;
}
export enum MessagingTypes {
    promise,
    request,
    response,
    publish,
    subscribe,
    deadletter
}
export enum MessagingCategories {
    message,
    progress,
    cancel,
    error
}
export abstract class AbstractMessageProducer<T> implements Producer<T> {
    public abstract start: (listeners: Listener<T>) => void;
    public abstract trigger: (message: T) => void;
    public abstract stop: () => void;
}
export interface IMessageBroker {
    makeSubscribe: (message: IBrokerMessage, port: MessagePort) => void;
    producerFactory: (method: string, name: string) => AbstractMessageProducer<any>;
}