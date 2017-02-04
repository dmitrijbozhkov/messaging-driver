import { IBrokerMessage, AbstractMessageProducer, IPortMessage } from "./AbstractBroker";
import { Listener } from "xstream";
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
    attachLifeCycle: (producer: NotifyProducer<string>) => NotifyProducer<string>;
    attachMessage: (producer: NotifyProducer<IBrokerMessage>, name: string) => NotifyProducer<IBrokerMessage>;
    attachDeadLetter: (producer: NotifyProducer<MessageEvent>) => NotifyProducer<MessageEvent>;
    attachError: (producer: NotifyProducer<ErrorEvent>) => NotifyProducer<ErrorEvent>;
}
export declare class MessageBroker implements IBroker {
    private target;
    private MessageProducers;
    private ErrorProducers;
    private DeadLetterProducers;
    private LifeCycleProducers;
    private PortBrokers;
    private messageHandler(message);
    private reportProgress(name);
    private reportCancel(name);
    sendMessage(message: IBrokerMessage): void;
    sendPublish(publish: IPortMessage): void;
    private findBroker(name);
    publishHandler(publish: IBrokerMessage, port: MessagePort): void;
    subscribeHandler(name: string): any;
    attachTarget(target: IMessageTarget): void;
    disposeTarget(): void;
    private fireLifeCycleEvent(status);
    attachLifeCycle(producer: NotifyProducer<string>): NotifyProducer<string>;
    attachMessage(producer: NotifyProducer<IBrokerMessage>, name: string): NotifyProducer<IBrokerMessage>;
    attachDeadLetter(producer: NotifyProducer<MessageEvent>): NotifyProducer<MessageEvent>;
    attachError(producer: NotifyProducer<ErrorEvent>): NotifyProducer<ErrorEvent>;
}
