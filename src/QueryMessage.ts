import { Stream } from "xstream";
import { MessageBroker, NotifyProducer } from "./MessageBroker";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, MessagingCategories } from "./AbstractBroker";
/*
export class ChooseBroker {
    private brokers: MessageBrokersSetup;
    constructor(listeners: MessageBrokersSetup) {
        this.brokers = listeners;
    }
    public Target(brokerName?: string) {
        if (!brokerName) {
            return new ChooseType(this.brokers["self"]);
        } else if (this.brokers[brokerName]) {
            return new ChooseType(this.brokers[brokerName]);
        } else {
            throw new Error("No such broker");
        }
    }
}
*/
export class SubscribeChooseType {
    private context: IBroker;
    constructor(listener: IBroker) {
        this.context = listener;
    }
    public Messages(name: string) {
        let stream = this.context.attachMessage(name);
        return new ChooseCategory(stream);
    }
    public Subscribe(name: string) {
        let broker = this.context.subscribeHandler(name);
        return new SubscribeChooseType(broker);
    }
    public DeadLetters() {
        let stream = this.context.attachDeadLetter();
        return stream;
    }
    public LifeCycle() {
        let stream = this.context.attachLifeCycle();
        return stream;
    }
}
export class ChooseType extends SubscribeChooseType {
    private eContext: IBroker;
    constructor(listener: IBroker) {
        super(listener);
        this.eContext = listener;
    }
    public Errors() {
        let stream = this.eContext.attachError();
        return stream;
    }
}
export class ChooseCategory {
    private context: Stream<IBrokerMessage>;
    constructor(context: Stream<IBrokerMessage>) {
        this.context = context;
    }
    public Data() {
        let takeMessages = (m: IBrokerMessage) => {
            let c = m.envelope.category;
            return c === MessagingCategories[0] || c === MessagingCategories[1] || c === MessagingCategories[2] || c === MessagingCategories[3];
        };
        return this.context.filter(takeMessages);
    }
    public Progress() {
        return this.context.filter((m: IBrokerMessage) => { return m.envelope.category === MessagingCategories[4]; });
    }
    public Cancel() {
        return this.context.filter((m: IBrokerMessage) => m.envelope.category === MessagingCategories[5]);
    }
    public All() {
        return this.context;
    }
}