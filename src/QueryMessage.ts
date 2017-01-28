import {MessageBroker} from "./MessageBroker";
export class ChooseBroker {
    private listeners: { [name: string]: MessageBroker };
    constructor(listeners: { [name: string]: MessageBroker }) {
        this.listeners = listeners;
    }
    public Target(brokerName?: string) {
        if (!brokerName) {
            return new ChooseType(this.listeners["self"]);
        } else if (this.listeners[brokerName]) {
            return new ChooseType(this.listeners[brokerName]);
        } else {
            throw new Error("No such broker");
        }
    }
}
export class ChooseType {
    private context: BrokerListener;
    constructor(listener: BrokerListener) {
        this.context = listener;
    }
    private makeMessageListener(message: string, contextListener) {
        this.context.addMessageListener(message, contextListener);
    }
    public Promise(name: string) {
        let category = new ChooseCategory(this.context, MessagingTypes[0], name);
    }
    public Request(name: string) {
        return new ChooseCategory(this.context, MessagingTypes[1], name);
    }
    public Response(name: string) {
        return new ChooseCategory(this.context, MessagingTypes[2], name);
    }
    public Subscribe(name: string) {}
    public DeadLetters() {}
    public Error() {}
}
export class ChooseCategory {
    private context: BrokerListener;
    private type: string;
    private name: string;
    constructor(context: BrokerListener, type: string, name: string) {
        this.context = context;
        this.type = type;
        this.name = name;
    }
    public onmessage(message: IBrokerMessage) {
        this.route(message);
    }
    private route(message: IBrokerMessage) {}
    public Message() {}
    public Progress() {}
    public Cancel() {}
}