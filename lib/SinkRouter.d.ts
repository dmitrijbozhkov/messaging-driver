import { Listener } from "xstream";
import { SinkMessages } from "./makeMessagingDriver";
import { IBroker } from "./MessageBroker";
/**
 * Class that routes messages that will be send to IBroker class
 * @constructor Takes IBroker class
 */
export declare class SinkRouter implements Listener<SinkMessages> {
    /** Broker which will get messages */
    private broker;
    constructor(broker: IBroker);
    next(m: SinkMessages): void;
    error(e: any): void;
    complete(): void;
    /**
     * Handles message with type message
     * @param message IBrokerMessage that will be send to broker
     */
    private handleMessage(message);
    /**
     * Handles broker lifecycle messages
     * @param status Message with status
     */
    private handleBroker(status);
}
