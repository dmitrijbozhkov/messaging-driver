import {IBrokerMessage, MessagingCategories, MessagingTypes, IEnvelope, IPortMessage, Transferable} from "./AbstractBroker";
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
export class TargetRoute implements ITargetRouter {
    /**
     * Error event handler
     * @param error ErrorEvent from target
     */
    public onerror: (error: ErrorEvent) => void;
    /**
     * Handles messages from target
     * @param message Message from target that was routed
     */
    public onmessage: (message: IBrokerMessage) => void;
    /**
     * Events that wasn't routed
     * @param data MessageEvent that doesn't have proper data field
     */
    public ondeadletter: (data: MessageEvent) => void;
    /**
     * Checks if message doesn't have envelope or data fields
     * @param message Message from target
     */
    private checkIsDeadLetter(message: IBrokerMessage) {
        return typeof message.envelope === "undefined" || typeof message.data === "undefined";
    }
    /**
     * Checks if envelope doesn't have name, category or type
     */
    private checkBadEnvelope(envelope: IEnvelope) {
        return typeof envelope.name === "undefined" || typeof envelope.category === "undefined" || typeof envelope.type === "undefined";
    }
    /**
     * Checks if message is bad
     * @param event Target message event
     */
    public route(event: MessageEvent) {
        if (this.checkIsDeadLetter(event.data)) {
            this.ondeadletter(event);
         } else {
             if (this.checkBadEnvelope(event.data.envelope)) {
                 this.ondeadletter(event);
             } else {
                 this.filter(event);
             }
         }
    }
    /**
     * Passes message to appropriate handler
     * @param message Target message event
     */
    private filter(message: MessageEvent) {
        if (message.data.envelope.type === MessagingTypes[0]) {
            this.onmessage(message.data);
        } else {
            this.ondeadletter(message);
        }
    }
}
/**
 * Class that manages DedicatedWorker as a target
 * @constructor Takes DedicatedWorker and router object that implements ITargetRouter interface
 */
export class WorkerTarget implements IMessageTarget {
    /** Worker which events will be routed */
    private worker: Worker;
    /** Router that will route messages from target */
    private router: ITargetRouter;
    /** Sets worker and router */
    constructor(worker: Worker, router: ITargetRouter) {
        this.worker = worker;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.ondeadletter = (letter: MessageEvent) => { this.ondeadletter(letter); };
        this.router.onerror = (e: ErrorEvent) => this.onerror(e);
        this.worker.onmessage = (e: MessageEvent) => { this.router.route(e); };
        this.worker.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    public makeMessage(message: IBrokerMessage) {
        if (message.envelope.type === MessagingTypes[0]) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data, message.transfer);
            } else {
                this.worker.postMessage(message, message.transfer);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public dispose() {
        this.worker.terminate();
    }
    public onmessage: (message: IBrokerMessage) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (data: MessageEvent) => void;
}
/**
 * Class that manages port of MessageChannel
 * @constructor Takes message port and router
 */
export class PortTarget implements IMessageTarget {
    /** Port which events will be routed */
    private port: MessagePort;
    /** Router that will route messages from target */
    private router: ITargetRouter;
    constructor(port: MessagePort, router: ITargetRouter) {
        this.port = port;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.ondeadletter = (data: MessageEvent) => this.ondeadletter(data);
        this.port.onmessage = (e: MessageEvent) => { this.router.route(e); };
    }
    public makeMessage(message: IBrokerMessage) {
        if (message.envelope.type === MessagingTypes[0]) {
            if (message.envelope.bare) {
                this.port.postMessage(message.data, message.transfer);
            } else {
                this.port.postMessage(message, message.transfer);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public dispose() {}
    public onmessage: (message: IBrokerMessage) => void;
    public ondeadletter: (data: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
}
/**
 * Class that manages iframe
 * @constructor Takes frame and router
*/
export class FrameTarget implements IMessageTarget {
    /** Ifame which events will be routed */
    private frame: Window;
    /** Router that will route messages from target */
    private router: ITargetRouter;
    constructor(frame: Window, router: ITargetRouter) {
        this.frame = frame;
        this.router = router;
        this.frame.onmessage = (message: MessageEvent) => { this.router.route(message); };
        this.frame.onerror = (msg, url, line, col, error) => { this.onerror({ message: msg, filename: url, lineno: line, colno: col, error: error } as any); };
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.ondeadletter = (data: MessageEvent) => this.ondeadletter(data);
        this.router.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    public makeMessage(message: IBrokerMessage) {
        if (message.envelope.type === MessagingTypes[0]) {
            if (message.envelope.origin) {
                if (message.envelope.bare) {
                    this.frame.postMessage(message.data, message.envelope.origin, message.transfer);
                } else {
                    this.frame.postMessage(message, message.envelope.origin, message.transfer);
                }
            } else {
                throw new Error("No targetOrigin specified");
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    dispose() {}
    public onmessage: (message: IBrokerMessage) => void;
    public ondeadletter: (data: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
}