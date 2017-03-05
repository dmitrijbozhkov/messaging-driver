import { Stream } from "xstream";
import { MessageBroker, NotifyProducer } from "./MessageBroker";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, MessagingCategories } from "./AbstractBroker";
import { adapt } from "@cycle/run/lib/adapt";

/**
 * Class for querying messages from port broker
 * @constructor Takes port broker
 */
export class SubscribeChooseType {
    /** Broker which messages will be queried */
    private context: IBroker;
    constructor(listener: IBroker) {
        this.context = listener;
    }
    /**
     * Queries messages with specified name
     * @param name Name of the messages
     * @returns Returns class which queries category of the message
     */
    public Messages(name: string) {
        let stream = this.context.attachMessage(name);
        return new ChooseCategory(stream);
    }
    /**
     * Queries port broker to listen to
     * @param name Name of the published port broker
     * @returns Class that queries the type of the message
     */
    public Subscribe(name: string) {
        let broker = this.context.subscribeHandler(name);
        return new SubscribeChooseType(broker);
    }
    /**
     * Queries DeadLetters of the target
     * @returns Stream of DeadLetters
     */
    public DeadLetters(): any {
        let stream = this.context.attachDeadLetter();
        return adapt(stream as any);
    }
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    public LifeCycle(): any {
        let stream = this.context.attachLifeCycle();
        return adapt(stream as any);
    }
}
/** 
 * Class for querying target messages 
 * @constructor Takes target broker
 */
export class ChooseType extends SubscribeChooseType {
    /** Broker which messages will be queried */
    private eContext: IBroker;
    constructor(listener: IBroker) {
        super(listener);
        this.eContext = listener;
    }
    /**
     * Queries error events of the target
     * @returns Returns stream of ErrorEvents
     */
    public Errors(): any {
        let stream = this.eContext.attachError();
        return adapt(stream as any);
    }
}
/**
 * Class for querying category of the message
 * @constructor Takes stream of messages
 */
export class ChooseCategory {
    /** Stream of messages that will be queried */
    private context: Stream<IBrokerMessage>;
    constructor(context: Stream<IBrokerMessage>) {
        this.context = context;
    }
    /**
     * Queries messages with data
     * @returns Returns stream of data messages
    */
    public Data(): any {
        let takeMessages = (m: IBrokerMessage) => {
            let c = m.envelope.category;
            return c === MessagingCategories[0] || c === MessagingCategories[1] || c === MessagingCategories[2] || c === MessagingCategories[3];
        };
        return adapt(this.context.filter(takeMessages) as any);
    }
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    public Status(): any {
        return adapt(this.context.filter((m: IBrokerMessage) => { return m.envelope.category === MessagingCategories[3]; }) as any);
    }
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    public All(): any {
        return adapt(this.context as any);
    }
}