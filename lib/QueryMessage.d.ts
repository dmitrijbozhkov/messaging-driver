import { Stream } from "xstream";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage } from "./AbstractBroker";
/**
 * Class for querying target messages
 * @constructor Takes target broker
 */
export declare class ChooseType {
    /** Broker which messages will be queried */
    private context;
    constructor(listener: IBroker);
    /**
     * Queries error events of the target
     * @returns Returns stream of ErrorEvents
     */
    Errors(): any;
    /**
     * Queries messages with specified name
     * @param name Name of the messages
     * @returns Returns class which queries category of the message
     */
    Messages(name: string): ChooseCategory;
    /**
     * Queries DeadLetters of the target
     * @returns Stream of DeadLetters
     */
    DeadLetters(): any;
    /**
     * Queries LifeCycle events of target
     * @returns Stream of lifecycle events
     */
    LifeCycle(): any;
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
    Data(): any;
    /**
     * Queries messages with progress callback
     * @returns Returns stream of messages with progress callback
    */
    Status(): any;
    /**
     * Queries all messages
     * @returns Returns stream of messages
     */
    All(): any;
}
