import {IMessageBroker, IBrokerMessage, MessagingCategories, MessagingTypes, IEnvelope, IPublishMessage} from "./AbstractBroker";
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
    private checkIsDeadLetter(message: IBrokerMessage) {
        return typeof message.envelope === "undefined" || typeof message.data === "undefined";
    }
    private checkBadEnvelope(envelope: IEnvelope) {
        return typeof envelope.name === "undefined" || typeof envelope.category === "undefined" || typeof envelope.type === "undefined";
    }
    private filter(event: MessageEvent) {
        if (this.checkIsDeadLetter(event.data)) {
            this.ondeadletter(event);
         } else {
             if (this.checkBadEnvelope(event.data.envelope)) {
                 this.ondeadletter(event);
             } else {
                 this.route(event);
             }
         }
    }
    private route(message: MessageEvent) {
        switch (message.data.envelope.type) {
            case MessagingTypes[0]:
                this.onmessage(message.data);
                break;
            case MessagingTypes[1]:
                (message.data as IPublishMessage).port = message.ports[0];
                this.onpublish(message.data);
                break;
            default:
                this.ondeadletter(message);
        }
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0] || type === MessagingTypes[1] || type === MessagingTypes[2];
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
        if (message.envelope.type === MessagingTypes[1]) {
            if (message.envelope.bare) {
                this.worker.postMessage(message.data, [message.port]);
            } else {
                this.worker.postMessage(message, [message.port]);
            }
        } else {
            throw new Error("Wrong message type");
        }
    }
    public onmessage: (message: IBrokerMessage) => void;
    public onpublish: (publish: IPublishMessage) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (data: MessageEvent) => void;
}