import {Stream} from "xstream";
import {IBroker} from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseBroker } from "./QueryMessage";
import { SinkRouter } from "./SinkRouter";
export type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
export type MessageBrokersSetup = { [name: string]: IBroker };
export function makeMessagingDriver(brokers: MessageBrokersSetup) {
    return (source: Stream<SinkMessages>) => {
        let routeSink = new SinkRouter(brokers);
        source.addListener(routeSink);
        return new ChooseBroker(brokers);
    };
}