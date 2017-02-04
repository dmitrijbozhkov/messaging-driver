import { Stream } from "xstream";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseType } from "./QueryMessage";
export declare type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
export declare function makeMessagingDriver(broker: IBroker): (source: Stream<SinkMessages>) => ChooseType;
