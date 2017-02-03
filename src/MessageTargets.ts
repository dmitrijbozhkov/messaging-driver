import {IBrokerMessage, MessagingCategories, MessagingTypes, IEnvelope, IPortMessage} from "./AbstractBroker";
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
export class TargetRoute implements ITargetRouter {
    public onerror: (error: ErrorEvent) => void;
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public ondeadletter: (data: MessageEvent) => void;
    private checkIsDeadLetter(message: IBrokerMessage) {
        return typeof message.envelope === "undefined" || typeof message.data === "undefined";
    }
    private checkBadEnvelope(envelope: IEnvelope) {
        return typeof envelope.name === "undefined" || typeof envelope.category === "undefined" || typeof envelope.type === "undefined";
    }
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
    private filter(message: MessageEvent) {
        switch (message.data.envelope.type) {
            case MessagingTypes[0]:
                this.onmessage(message.data);
                break;
            case MessagingTypes[1]:
                this.onpublish(message.data, message.ports[0]);
                break;
            default:
                this.ondeadletter(message);
        }
    }
}
export class WorkerTarget implements IMessageTarget {
    private worker: Worker;
    private router: ITargetRouter;
    constructor(worker: Worker, router: ITargetRouter) {
        this.worker = worker;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.onpublish = (publish: IBrokerMessage, port: MessagePort) => { this.onpublish(publish, port); };
        this.router.ondeadletter = (letter: MessageEvent) => { this.ondeadletter(letter); };
        this.router.onerror = (e: ErrorEvent) => this.onerror(e);
        this.worker.onmessage = (e: MessageEvent) => { this.router.route(e); };
        this.worker.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0];
    }
    public makeMessage(message: IBrokerMessage) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data);
            } else {
                this.worker.postMessage(message);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public makePublish(message: IPortMessage) {
        let port = message.port;
        delete message.port;
        if (message.envelope.type === MessagingTypes[1]) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data, [port]);
            } else {
                this.worker.postMessage(message, [port]);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public dispose() {
        this.worker.terminate();
    }
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (data: MessageEvent) => void;
}

export class PortTarget implements IMessageTarget {
    private port: MessagePort;
    private router: ITargetRouter;
    constructor(port: MessagePort, router: ITargetRouter) {
        this.port = port;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.onpublish = (publish: IBrokerMessage, port: MessagePort) => this.onpublish(publish, port);
        this.router.ondeadletter = (data: MessageEvent) => this.ondeadletter(data);
        this.port.onmessage = (e: MessageEvent) => { this.router.route(e); };
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0];
    }
    public makeMessage(message: IBrokerMessage) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.bare) {
                this.port.postMessage(message.data);
            } else {
                this.port.postMessage(message);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public makePublish(message: IPortMessage) {
        let port = message.port;
        delete message.port;
        if (message.envelope.type === MessagingTypes[1]) {
            if (message.envelope.bare) {
                this.port.postMessage(message.data, [port]);
            } else {
                this.port.postMessage(message, [port]);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public dispose() {}
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public ondeadletter: (data: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
}

export class FrameTarget implements IMessageTarget {
    private frame: Window;
    private router: ITargetRouter;
    constructor(frame: Window, router: ITargetRouter) {
        this.frame = frame;
        this.router = router;
        this.frame.onmessage = (message: MessageEvent) => { this.router.route(message); };
        this.frame.onerror = (msg, url, line, col, error) => { this.onerror({ message: msg, filename: url, lineno: line, colno: col, error: error } as any); };
        this.router.onmessage = (message: IBrokerMessage) => { this.onmessage(message); };
        this.router.onpublish = (publish: IBrokerMessage, port: MessagePort) => this.onpublish(publish, port);
        this.router.ondeadletter = (data: MessageEvent) => this.ondeadletter(data);
        this.router.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0];
    }
    public makeMessage(message: IBrokerMessage) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.origin) {
                if (message.envelope.bare) {
                    this.frame.postMessage(message.data, message.envelope.origin);
                } else {
                    this.frame.postMessage(message, message.envelope.origin);
                }
            } else {
                throw new Error("No targetOrigin specified");
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public makePublish(message: IPortMessage) {
        let port = message.port;
        delete message.port;
        if (message.envelope.type === MessagingTypes[1]) {
            if (message.envelope.origin) {
                if (message.envelope.bare) {
                    this.frame.postMessage(message.data, message.envelope.origin, [port]);
                } else {
                    this.frame.postMessage(message, message.envelope.origin, [port]);
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
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public ondeadletter: (data: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
}