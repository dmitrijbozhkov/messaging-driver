import { IBrokerMessage, IPortMessage } from "./AbstractBroker";
/** Standard interface of class that handles events from target */
export interface IMessageHandler {
    /**
     * Error event handler
     * @param error ErrorEvent from target
     */
    onerror: (error: ErrorEvent) => void;
    /**
     * Event that wasn't routed
     * @param data MessageEvent that doesn't have proper data field
     */
    ondeadletter: (data: MessageEvent) => void;
    /**
     * Handles messages from target
     * @param message Message from target that was routed
     */
    onmessage: (message: IBrokerMessage) => void;
    /**
     * Publishes MessageChannel port to broker
     * @param publish Publishing message that specifies how port will be handled
     * @param port Port that IBroker subscribe to
     */
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
}
/**
 * Interface for class that sends messages to target
 */
export interface IMessageTarget extends IMessageHandler {
    /**
     * Sends messages to target
     * @param message Message that will be send
     */
    makeMessage: (message: IBrokerMessage) => void;
    /**
     * Sends MessageChannel port to target
     * @param message Message that contains port and parameters how to handle it
     */
    makePublish: (message: IPortMessage) => void;
    /** Disposes message target */
    dispose: () => void;
}
/** Routes messages to appropriate handler */
export interface ITargetRouter extends IMessageHandler {
    /**
     * Takes MessageEvents from target and routes them
     * @param event MessageEvent from target
     */
    route: (event: MessageEvent) => void;
}
/**
 * Routes messages to appropriate handler
 */
export declare class TargetRoute implements ITargetRouter {
    /**
     * Error event handler
     * @param error ErrorEvent from target
     */
    onerror: (error: ErrorEvent) => void;
    /**
     * Handles messages from target
     * @param message Message from target that was routed
     */
    onmessage: (message: IBrokerMessage) => void;
    /**
     * Publishes MessageChannel port to broker
     * @param publish Publishing message that specifies how port will be handled
     * @param port Port that IBroker subscribe to
     */
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    /**
     * Events that wasn't routed
     * @param data MessageEvent that doesn't have proper data field
     */
    ondeadletter: (data: MessageEvent) => void;
    /**
     * Checks if message doesn't have envelope or data fields
     * @param message Message from target
     */
    private checkIsDeadLetter(message);
    /**
     * Checks if envelope doesn't have name, category or type
     */
    private checkBadEnvelope(envelope);
    /**
     * Checks if message is bad
     * @param event Target message event
     */
    route(event: MessageEvent): void;
    /**
     * Passes message to appropriate handler
     * @param message Target message event
     */
    private filter(message);
}
/**
 * Class that manages DedicatedWorker as a target
 * @constructor Takes DedicatedWorker and router object that implements ITargetRouter interface
 */
export declare class WorkerTarget implements IMessageTarget {
    /** Worker which events will be routed */
    private worker;
    /** Router that will route messages from target */
    private router;
    /** Sets worker and router */
    constructor(worker: Worker, router: ITargetRouter);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    onerror: (error: ErrorEvent) => void;
    ondeadletter: (data: MessageEvent) => void;
}
/**
 * Class that manages port of MessageChannel
 * @constructor Takes message port and router
 */
export declare class PortTarget implements IMessageTarget {
    /** Port which events will be routed */
    private port;
    /** Router that will route messages from target */
    private router;
    constructor(port: MessagePort, router: ITargetRouter);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    ondeadletter: (data: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
/**
 * Class that manages iframe
 * @constructor Takes frame and router
*/
export declare class FrameTarget implements IMessageTarget {
    /** Ifame which events will be routed */
    private frame;
    /** Router that will route messages from target */
    private router;
    constructor(frame: Window, router: ITargetRouter);
    makeMessage(message: IBrokerMessage): void;
    makePublish(message: IPortMessage): void;
    dispose(): void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    ondeadletter: (data: MessageEvent) => void;
    onerror: (error: ErrorEvent) => void;
}
