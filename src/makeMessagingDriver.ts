import {IMessageBroker, IBrokerMessage} from "./AbstractBroker";
import {Stream} from "xstream";
import {BrokerListener} from "./MessageListeners";

export function makeMessagingDriver(messageContext: Window, brokers?: { [name: string]: IMessageBroker }) {
    let listeners: { [name: string]: BrokerListener } = {};
    if (brokers) {
        Object.keys(brokers).forEach((name: string) => {
            listeners[name] = new BrokerListener(brokers[name]);
        });
    }
    return (messages: Stream<IBrokerMessage>) => {
        if (messages) {
            throw new Error("");
        }
    };
}