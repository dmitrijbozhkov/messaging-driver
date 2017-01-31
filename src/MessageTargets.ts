import {IBrokerMessage, MessagingCategories, MessagingTypes, IEnvelope, IPublishMessage} from "./AbstractBroker";
export interface IMessageHandler {
    onerror: (error: ErrorEvent) => void;
    ondeadletter: (data: MessageEvent) => void;
    onmessage: (message: IBrokerMessage) => void;
    onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
}
export interface IMessageTarget extends IMessageHandler {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (message: IBrokerMessage, port: MessagePort) => void;
}
export interface ITargetRouter extends IMessageHandler {
    onerror: (error: ErrorEvent) => void;
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
    private router: TargetRoute;
    constructor(worker: Worker, router: TargetRoute) {
        this.worker = worker;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => this.onmessage(message);
        this.router.onpublish = (publish: IBrokerMessage, port: MessagePort) => this.onpublish(publish, port);
        this.router.ondeadletter = (letter: MessageEvent) => this.ondeadletter(letter);
        this.router.onerror = (e: ErrorEvent) => this.onerror(e);
        this.worker.onmessage = (e: MessageEvent) => this.router.route(e);
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
    public makePublish(message: IPublishMessage) {
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
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (data: MessageEvent) => void;
}

export class PortTarget implements IMessageTarget {
    private port: MessagePort;
    private router: TargetRoute;
    constructor(port: MessagePort, router: TargetRoute) {
        this.port = port;
        this.router = router;
        this.router.onmessage = (message: IBrokerMessage) => {  this.onmessage(message);}
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
    public makePublish(message: IPublishMessage) {
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
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IBrokerMessage, port: MessagePort) => void;
    public ondeadletter: (data: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
}