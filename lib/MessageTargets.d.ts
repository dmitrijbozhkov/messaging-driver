import { IBrokerMessage, IPortMessage } from "./AbstractBroker";
export interface IMessageHandler {
    onerror: (error: ErrorEvent) => void;
    ondeadletter: (data: MessageEvent) => void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
}
export interface IMessageTarget extends IMessageHandler {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (message: IPortMessage) => void;
    dispose: () => void;
}
export interface ITargetRouter extends IMessageHandler {
    route: (event: MessageEvent) => void;
}
export declare class TargetRoute implements ITargetRouter {
    onerror: (error: ErrorEvent) => void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    ondeadletter: (data: MessageEvent) => void;
    private checkIsDeadLetter(message);
    private checkBadEnvelope(envelope);
    route(event: MessageEvent): void;
    private filter(message);
}
export declare class WorkerTarget implements IMessageTarget {
    private worker;
    private router;
    constructor(worker: Worker, router: ITargetRouter);
    private checkIsMessage(type);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    onerror: (error: ErrorEvent) => void;
    ondeadletter: (data: MessageEvent) => void;
}
export declare class PortTarget implements IMessageTarget {
    private port;
    private router;
    constructor(port: MessagePort, router: ITargetRouter);
    private checkIsMessage(type);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    ondeadletter: (data: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
export declare class FrameTarget implements IMessageTarget {
    private frame;
    private router;
    constructor(frame: Window, router: ITargetRouter);
    private checkIsMessage(type);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    ondeadletter: (data: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
