import {Stream} from "xstream";
import {IBroker} from "./MessageBroker";
import { IBrokerMessage, IPortMessage, IAttachMessage } from "./AbstractBroker";
import { ChooseType } from "./QueryMessage";
import { SinkRouter } from "./SinkRouter";
export type SinkMessages = IBrokerMessage | IPortMessage | IAttachMessage;
export function makeMessagingDriver(broker: IBroker) {
    return (source: Stream<SinkMessages>) => {
        let routeSink = new SinkRouter(broker);
        source.addListener(routeSink);
        return new ChooseType(broker);
    };
}