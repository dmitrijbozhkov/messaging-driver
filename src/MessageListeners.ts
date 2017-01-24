import {IMessageBroker, IBrokerMessage} from "./AbstractBroker";
export class BrokerListener {
    constructor(broker: IMessageBroker) {
        broker.onmessage = (message, ports) => this.onmessage(message, ports);
        broker.onprogress = (progress) => this.onprogress(progress);
        broker.oncancel = (token) => this.oncancel(token);
        broker.ondeadletter = (letter, ports) => this.ondeadletter(letter, ports);
        broker.onerror = (error) => this.onerror(error);
    }

    private onmessage(message: IBrokerMessage, ports?: MessagePort[]) {
        this.onmessageLsteners.forEach((listener) => {
            listener(message, ports);
        });
    }
    private onprogress(progress: IBrokerMessage) {
        this.onprogressListeners.forEach((listener) => {
            listener(progress);
        });
    }
    private oncancel(token: IBrokerMessage) {
        this.oncancelListeners.forEach((listener) => {
            listener(token);
        });
    }
    private ondeadletter(letter: any, ports: MessagePort[]) {
        this.ondeadletterListeners.forEach((listener) => {
            listener(letter, ports);
        });
    }
    private onerror(error: ErrorEvent) {
        this.onerrorListeners.forEach((listener) => {
            listener(error);
        });
    }

    private onmessageLsteners: ((message: IBrokerMessage, ports?: MessagePort[]) => void)[] = [];
    private onprogressListeners: ((progress: IBrokerMessage) => void)[] = [];
    private oncancelListeners: ((token: IBrokerMessage) => void)[] = [];
    private ondeadletterListeners: ((letter: any, ports: MessagePort[]) => void)[] = [];
    private onerrorListeners: ((error: ErrorEvent) => void)[] = [];

    public addMessageListener(name: string, callback) {
        switch (name) {
            case "message":
                this.onmessageLsteners.push(callback);
                break;
            case "progress":
                this.onprogressListeners.push(callback);
                break;
            case "cancel":
                this.oncancelListeners.push(callback);
                break;
            case "deadletter":
                this.ondeadletterListeners.push(callback);
                break;
            case "error":
                this.onerrorListeners.push(callback);
                break;
            default:
                throw new Error("No such message");
        }
    }
}
export class ChooseBroker {
    private listeners: { [name: string]: BrokerListener };
    constructor(listeners: { [name: string]: BrokerListener }) {
        this.listeners = listeners;
    }
    public Target(brokerName: string) {
    }
}
export class ChooseMethod {
    constructor() {
    }
}
export class ChooseMessage {

}