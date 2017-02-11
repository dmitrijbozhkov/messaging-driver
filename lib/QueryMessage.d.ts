import { Stream } from "xstream";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage } from "./AbstractBroker";
/**
 * Class for querying messages from port broker
 * @constructor Takes port broker
 */
export declare class SubscribeChooseType {
    /** Broker which messages will be queried */
    private context;
    constructor(listener: IBroker);
    /**
     * Queries messages with specified name
     * @param name Name of the messages
     * @returns Returns class which queries category of the message
     */
    Messages(name: string): ChooseCategory;
    /**
     * Queries port broker to listen to
     * @param name Name of the published port broker
     * @returns Class that queries the type of the message
     */
    Subscribe(name: string): SubscribeChooseType;
    /**
     * Queries DeadLetters of the target
     * @returns Stream of DeadLetters
     */
    DeadLetters(): Stream<MessageEvent>;
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    LifeCycle(): Stream<string>;
}
/**
 * Class for querying target messages
 * @constructor Takes target broker
 */
export declare class ChooseType extends SubscribeChooseType {
    /** Broker which messages will be queried */
    private eContext;
    constructor(listener: IBroker);
    /**
     * Queries error events of the target
     * @returns Returns stream of ErrorEvents
     */
    Errors(): Stream<ErrorEvent>;
}
/**
 * Class for querying category of the message
 * @constructor Takes stream of messages
 */
export declare class ChooseCategory {
    /** Stream of messages that will be queried */
    private context;
    constructor(context: Stream<IBrokerMessage>);
    /**
     * Queries messages with data
     * @returns Returns stream of data messages
    */
    Data(): Stream<IBrokerMessage>;
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    Progress(): Stream<IBrokerMessage>;
    /**
     * Queries messages with cancel callback
     * @returns Returns messages with cancel callback
     */
    Cancel(): Stream<IBrokerMessage>;
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    All(): Stream<IBrokerMessage>;
}
