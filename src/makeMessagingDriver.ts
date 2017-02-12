import {Stream} from "xstream";
import {IBroker} from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseType } from "./QueryMessage";
import { SinkRouter } from "./SinkRouter";
/**
 * Types of messages that driver takes
 */
export type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
/**
 * Creates driver for messaging api
 * @param Broker that will operate target
 * @returns Function that gets stream of messages to send and returns message querying class ChooseType
 */
export function makeMessagingDriver(broker: IBroker) {
    return (source: Stream<SinkMessages>) => {
        let routeSink = new SinkRouter(broker);
        try {
            source.addListener(routeSink);
        } catch (e) {
            (source as any).subscribe(routeSink);
        }
        return new ChooseType(broker);
    };
}