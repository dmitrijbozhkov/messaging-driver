export interface IEnvelope {
    target?: string; // broker name
    type: string; // messaging type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
    bare?: boolean; // post only data
    progress?: boolean; // give progress callback to responder
    cancel?: boolean; // give cancellation token to responder
}
export interface IMessage {
    data: any; // data passed
    progress?: (percent: number, status: string,  message: string) => void; // progress callback
}
export interface IBrokerMessage {
    envelope: IEnvelope;
    message: IMessage;
}
export enum MessagingTypes {
    promise,
    request,
    response,
    publish,
    subscribe
}
export enum MessagingCategories {
    message,
    progress,
    cancel,
    error
}
export interface IMessageBroker {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (message: IBrokerMessage, port: MessagePort) => void;
    onprogress: (progress: IBrokerMessage) => void;
    onmessage: (message: IBrokerMessage, ports?: MessagePort[]) => void;
    oncancel: (token: IBrokerMessage) => void;
    onerror: (error: ErrorEvent) => void;
    ondeadletter: (letter: any, ports: MessagePort[]) => void;
}