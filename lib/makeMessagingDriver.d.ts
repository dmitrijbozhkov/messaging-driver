import { Stream } from "xstream";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseType } from "./QueryMessage";
/**
 * Types of messages that driver takes
 */
export declare type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
/**
 * Creates driver for messaging api
 * @param Broker that will operate target
 * @returns Function that gets stream of messages to send and returns message querying class ChooseType
 */
export declare function makeMessagingDriver(broker: IBroker): (source: Stream<SinkMessages>) => ChooseType;
