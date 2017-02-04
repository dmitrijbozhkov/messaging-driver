import { Listener } from "xstream";
import { MessageBrokersSetup, SinkMessages } from "./makeMessagingDriver";
export declare class SinkRouter implements Listener<SinkMessages> {
    private brokers;
    constructor(brokers: MessageBrokersSetup);
    next(m: SinkMessages): void;
    error(e: any): void;
    complete(): void;
    private findBroker(name);
    private getSinkBroker(message);
    private handleMessage(message);
    private handlePublish(publish);
    private handleSubscription(subscribe);
    private handleBroker(status);
}
