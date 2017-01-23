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
    }
    private router(message: MessageEvent) {
        if (typeof message.data.envelope === "undefined" || typeof message.data.message === "undefined") {
            this.ondeadletter(message);
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
                    this.ondeadletter(message);
            }
        }
    }
    public makePromise(message: IBrokerMessage) {
        if (message.envelope.type === MessagingTypes[0]) {
            this.worker.postMessage(message);
        }
        else {
            throw new WrongMssageTypeError("Specified message is not a promise");
        }
    }
    public makeRequest(message: IBrokerMessage) {
        this.worker.postMessage(message);
    }
    public onprogress: (progress: IBrokerMessage) => void;
    public onmessage: (message: IBrokerMessage, ports?: MessagePort[]) => void;
    public oncancel: (token: IBrokerMessage) => void;
    public onerror: (error: IBrokerMessage) => void;
    public ondeadletter: (letter: any) => void;
}