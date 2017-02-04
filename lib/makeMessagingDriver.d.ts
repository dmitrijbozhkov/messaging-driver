import { Stream } from "xstream";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseBroker } from "./QueryMessage";
export declare type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
export declare type MessageBrokersSetup = {
    [name: string]: IBroker;
};
export declare function makeMessagingDriver(brokers: MessageBrokersSetup): (source: Stream<SinkMessages>) => ChooseBroker;
