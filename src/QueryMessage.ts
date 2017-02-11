import { Stream } from "xstream";
import { MessageBroker, NotifyProducer } from "./MessageBroker";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, MessagingCategories } from "./AbstractBroker";
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
    public DeadLetters() {
        let stream = this.context.attachDeadLetter();
        return stream;
    }
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    public LifeCycle() {
        let stream = this.context.attachLifeCycle();
        return stream;
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
    public Errors() {
        let stream = this.eContext.attachError();
        return stream;
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
    public Data() {
        let takeMessages = (m: IBrokerMessage) => {
            let c = m.envelope.category;
            return c === MessagingCategories[0] || c === MessagingCategories[1] || c === MessagingCategories[2] || c === MessagingCategories[3];
        };
        return this.context.filter(takeMessages);
    }
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    public Progress() {
        return this.context.filter((m: IBrokerMessage) => { return m.envelope.category === MessagingCategories[4]; });
    }
    /**
     * Queries messages with cancel callback
     * @returns Returns messages with cancel callback
     */
    public Cancel() {
        return this.context.filter((m: IBrokerMessage) => m.envelope.category === MessagingCategories[5]);
    }
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    public All() {
        return this.context;
    }
}