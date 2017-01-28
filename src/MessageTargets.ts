import {IMessageBroker, IBrokerMessage, MessagingCategories, MessagingTypes} from "./AbstractBroker";
export interface IMessageTarget {
    makeMessage: (message: IBrokerMessage) => void;
    makePublish: (message: IBrokerMessage, port: MessagePort) => void;
}
export class WorkerTarget implements IMessageTarget {
    private worker: Worker;
    constructor(worker: Worker) {
        this.worker = worker;
        this.worker.onmessage = (e: MessageEvent) => this.filter(e);
        this.worker.onerror = (e: ErrorEvent) => this.onerror(e);
    }
    private filter(event: MessageEvent) {
        if (typeof event.data.envelope === "undefined" || typeof event.data.message === "undefined") {
            this.ondeadletter(event);
         } else {
             this.onmessage(event);
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
    public onmessage: (message: MessageEvent) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (data: MessageEvent) => void;
}