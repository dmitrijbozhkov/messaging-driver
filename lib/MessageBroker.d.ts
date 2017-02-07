import { IBrokerMessage, AbstractMessageProducer, IPortMessage } from "./AbstractBroker";
import { Listener, Stream } from "xstream";
import { IMessageTarget } from "./MessageTargets";
export declare class NotifyProducer<T> implements AbstractMessageProducer<T> {
    listeners: Listener<T>[];
    start(listener: Listener<T>): void;
    trigger(message: T): void;
    stop(): void;
}
export interface IBroker {
    sendMessage: (message: IBrokerMessage) => void;
    sendPublish: (publish: IBrokerMessage) => void;
    subscribeHandler: (name: string) => IBroker;
    publishHandler: (publish: IBrokerMessage, port: MessagePort) => void;
    attachTarget: (target: IMessageTarget) => void;
    disposeTarget: () => void;
    attachLifeCycle: () => Stream<string>;
    attachMessage: (name: string) => Stream<IBrokerMessage>;
    attachDeadLetter: () => Stream<MessageEvent>;
    attachError: () => Stream<ErrorEvent>;
}
export declare class MessageBroker implements IBroker {
    private target;
    private MessageProducers;
    private ErrorProducer;
    private DeadLetterProducer;
    private LifeCycleProducer;
    private PortBrokers;
    constructor();
    private messageHandler(message);
    private reportProgress(name);
    private reportCancel(name);
    sendMessage(message: IBrokerMessage): void;
    sendPublish(publish: IPortMessage): void;
    private findBroker(name);
    publishHandler(publish: IBrokerMessage, port: MessagePort): void;
    subscribeHandler(name: string): IBroker;
    attachTarget(target: IMessageTarget): void;
    disposeTarget(): void;
    private findProducers(name);
    private fireLifeCycleEvent(status);
    attachLifeCycle(): Stream<string>;
    attachMessage(name: string): Stream<IBrokerMessage>;
    attachDeadLetter(): Stream<MessageEvent>;
    attachError(): Stream<ErrorEvent>;
}
