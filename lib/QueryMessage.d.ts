import { Stream } from "xstream";
import { MessageBrokersSetup } from "./makeMessagingDriver";
import { IBroker } from "./MessageBroker";
import { IBrokerMessage } from "./AbstractBroker";
export declare class ChooseBroker {
    private brokers;
    constructor(listeners: MessageBrokersSetup);
    Target(brokerName?: string): ChooseType;
}
export declare class SubscribeChooseType {
    private context;
    constructor(listener: IBroker);
    Messages(name: string): ChooseCategory;
    Subscribe(name: string): SubscribeChooseType;
    DeadLetters(): Stream<MessageEvent>;
    LifeCycle(): Stream<string>;
}
export declare class ChooseType extends SubscribeChooseType {
    private eContext;
    constructor(listener: IBroker);
    Errors(): Stream<ErrorEvent>;
}
export declare class ChooseCategory {
    private context;
    constructor(context: Stream<IBrokerMessage>);
    Data(): Stream<IBrokerMessage>;
    Progress(): Stream<IBrokerMessage>;
    Cancel(): Stream<IBrokerMessage>;
}
