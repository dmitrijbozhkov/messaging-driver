import {IBrokerMessage, MessagingTypes, MessagingCategories, IMessageBroker} from "./AbstractBroker";
export class WorkerBroker implements IMessageBroker {
    private worker: Worker;
    constructor(worker: Worker) {
        this.worker = worker;
        this.worker.onmessage = (e: MessageEvent) => this.router(e);
        this.worker.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    public loaded: boolean;
    private router(message: MessageEvent) {
        if (typeof message.data.envelope === "undefined" || typeof message.data.message === "undefined") {
            this.ondeadletter(message.data, message.ports);
        } else if (typeof message.data.envelope.category === "undefined") {
            this.onmessage(message.data, message.ports);
        } else {
            switch (message.data.envelope.category) {
                case MessagingCategories[0]:
                    this.onmessage(message.data, message.ports);
                    break;
                case MessagingCategories[1]:
                    this.onprogress(message.data);
                    break;
                case MessagingCategories[2]:
                    this.oncancel(message.data);
                    break;
                case MessagingCategories[3]:
                    this.onerror(message.data);
                    break;
                default:
                    this.ondeadletter(message.data, message.ports);
            }
        }
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0] || type === MessagingTypes[1] || type === MessagingTypes[2];
    }
    public makeMessage(message: IBrokerMessage) {
        if (this.checkIsMessage(message.envelope.type)) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.message.data as any);
            } else {
                this.worker.postMessage(message);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public makePublish(message: IBrokerMessage, port: MessagePort) {
        if (message.envelope.type === MessagingTypes[3]) {
            this.worker.postMessage(message, port);
        } else {
            throw new Error("Wrong message type");
        }
    }
    public onprogress: (progress: IBrokerMessage) => void;
    public onmessage: (message: IBrokerMessage, ports?: MessagePort[]) => void;
    public oncancel: (token: IBrokerMessage) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (letter: any, ports: MessagePort[]) => void;
}