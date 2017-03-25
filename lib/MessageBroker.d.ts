import { IBrokerMessage, AbstractMessageProducer } from "./AbstractBroker";
import { Listener, Stream } from "xstream";
import { IMessageTarget } from "./MessageTargets";
/** Passes messages to all the listeners */
export declare class NotifyProducer<T> implements AbstractMessageProducer<T> {
    /** Listeners that will be notified with message */
    listeners: Listener<T>[];
    start(listener: Listener<T>): void;
    trigger(message: T): void;
    stop(): void;
}
/** Broker interface that will manage IMessageTarget */
export interface IBroker {
    /**
     * Sends message to attached message target
     * @param message Message that will be send to message target or port
     */
    sendMessage: (message: IBrokerMessage) => void;
    /**
     * Attaches object that implements IMessageTarget to broker
     * @param target Message target that broker will operate upon
     */
    attachTarget: (target: IMessageTarget) => void;
    /** Disposes message target */
    disposeTarget: () => void;
    /**
     * Attaches target lifecycle listener to broker
     * @returns Returns stream of LifeCycleEvents
    */
    attachLifeCycle: () => Stream<string>;
    /**
     * Attaches listener to messages from broker
     * @param name Type of message to listen to
     * @returns Returns stream of IBrokerMessages
     */
    attachMessage: (name: string) => Stream<IBrokerMessage>;
    /**
     * Attaches listener to messages that wasn't routed
     * @returns Returns stream of MessageEvents
     */
    attachDeadLetter: () => Stream<MessageEvent>;
    /**
     * Attaches listener to target errors
     * @returns Returns stream of ErrorEvents
     */
    attachError: () => Stream<ErrorEvent>;
}
/**
 * Broker that manages objects of IMessageTargets
 * @constructor Initializes producers
 */
export declare class MessageBroker implements IBroker {
    /** Target that broker will operate */
    private target;
    /** Producers that will respond to target messages */
    private MessageProducers;
    /** Producer that will notify listeners on target error */
    private ErrorProducer;
    /** Producer that will notify listeners if message wasn't routed */
    private DeadLetterProducer;
    /** Producer that will notify listeners on target initialized or disposed */
    private LifeCycleProducer;
    constructor();
    private messageHandler(message);
    private reportStatus(name);
    sendMessage(message: IBrokerMessage): void;
    attachTarget(target: IMessageTarget): void;
    disposeTarget(): void;
    private findProducers(name);
    private fireLifeCycleEvent(status);
    attachLifeCycle(): Stream<string>;
    attachMessage(name: string): Stream<IBrokerMessage>;
    attachDeadLetter(): Stream<MessageEvent>;
    attachError(): Stream<ErrorEvent>;
}
