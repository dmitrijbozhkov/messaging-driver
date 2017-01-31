import {Stream} from "xstream";
import {IBroker} from "./MessageBroker";
import {IBrokerMessage} from "./AbstractBroker";
import {} from "./QueryMessage";
export type MessageBrokersSetup = { [name: string]: IBroker };
export function makeMessagingDriver(brokers: MessageBrokersSetup) {
    return (source: Stream<IBrokerMessage>) => {
    };
}