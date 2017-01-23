export interface IEnvelope {
    type: string; // operation type
    name: string; // operation name
    category?: string; // specify if message is data, progress message or cancellation token
}
export interface IDataEnvelope extends IEnvelope {
    progress?: boolean; // give progress callback to responder
    cancel?: boolean; // give cancellation token to responder
}
export interface IMessage {
    data: any; // data passed
    progress?: (percent: number, status: string,  message: string) => void; // progress callback
}
export interface IBrokerMessage {
    envelope: IEnvelope | IDataEnvelope;
    message: IMessage;
}
export class WrongMssageTypeError extends Error {}
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
export class WorkerBroker {
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
    private checkIsChannel(type: string) {
        return type === MessagingTypes[3] || type === MessagingTypes[4];
    }
    private checkIsMessage(type: string) {
        return type === MessagingTypes[0] || type === MessagingTypes[1] || type === MessagingTypes[2];
    }
    public makeMessage(message: IBrokerMessage) {
        if (this.checkIsChannel(message.envelope.type)) {
            throw new WrongMssageTypeError("Specified message is not a promise");
        }
        else if (this.checkIsMessage(message.envelope.type)) {
            this.worker.postMessage(message);
        } else {
            throw new WrongMssageTypeError("Wrong message type");
        }
    }
    public makePublish(message: IBrokerMessage, port: MessagePort) {
        if (this.checkIsChannel(message.envelope.type)) {
            this.worker.postMessage(message, port);
        } else if (this.checkIsMessage(message.envelope.type)) {
            throw new WrongMssageTypeError("Specified message is not publish");
        } else {
            throw new WrongMssageTypeError("Wrong message type");
        }
    }
    public onprogress: (progress: IBrokerMessage) => void;
    public onmessage: (message: IBrokerMessage, ports?: MessagePort[]) => void;
    public oncancel: (token: IBrokerMessage) => void;
    public onerror: (error: ErrorEvent) => void;
    public ondeadletter: (letter: any, ports: MessagePort[]) => void;
}