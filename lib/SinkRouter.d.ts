import { Listener } from "xstream";
import { SinkMessages } from "./makeMessagingDriver";
import { IBroker } from "./MessageBroker";
export declare class SinkRouter implements Listener<SinkMessages> {
    private broker;
    constructor(broker: IBroker);
    next(m: SinkMessages): void;
    error(e: any): void;
    complete(): void;
    private handleMessage(message);
    private handlePublish(publish);
    private handleSubscription(subscribe);
    private handleBroker(status);
}
