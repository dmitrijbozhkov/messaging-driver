import {IBrokerMessage, MessagingTypes, AbstractMessageProducer, IPortMessage, MessagingCategories, IStatusMessage, LifeCycleEvents, Transferable} from "./AbstractBroker";
import {Producer, Listener, Stream} from "xstream";
import {WorkerTarget, PortTarget, TargetRoute, IMessageTarget} from "./MessageTargets";
import {WorkerMock} from "./WorkerMock";
/** Passes messages to all the listeners */
export class NotifyProducer<T> implements AbstractMessageProducer<T> {
    /** Listeners that will be notified with message */
    public listeners: Listener<T>[] = [];
    public start(listener: Listener<T>) {
        this.listeners.push(listener);
    }
    public trigger(message: T) {
        this.listeners.forEach((listener) => {
            listener.next(message);
        });
    }
    public stop() {
        this.listeners.forEach((listener) => {
            listener.complete();
        });
    }
}
/** Broker interface that will manage IMessageTarget */
export interface IBroker {
    /**
     * Sends message to attached message target
     * @param message Message that will be send to message target or port
     */
    sendMessage: (message: IBrokerMessage) => void;
    /**
     * Publishes message port that will be send to target
     * @param publish Message with port
     */
    sendPublish: (publish: IBrokerMessage) => void;
    /**
     * Handles subscriptions on ports published by target
     * @param name Name of the published port
     */
    subscribeHandler: (name: string) => IBroker;
    /**
     * Handles port publishes from target
     * @param publish Message that specifies how port will be handled
     * @param port Port that will be published
     */
    publishHandler: (publish: IBrokerMessage, port: MessagePort) => void;
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
/** Type that will send all messages with specific name to all the listeners of the producer */
type ProducerCollection<T> = { producer: AbstractMessageProducer<T>, name: string };
/** Message brokers of all the targets ports */
type BrokerCollection = { broker: IBroker, name: string };
/**
 * Broker that manages objects of IMessageTargets
 * @constructor Initializes producers
 */
export class MessageBroker implements IBroker {
    /** Target that broker will operate */
    private target: IMessageTarget;
    /** Producers that will respond to target messages */
    private MessageProducers: ProducerCollection<IBrokerMessage>[] = [];
    /** Producer that will notify listeners on target error */
    private ErrorProducer: AbstractMessageProducer<ErrorEvent>;
    /** Producer that will notify listeners if message wasn't routed */
    private DeadLetterProducer: AbstractMessageProducer<MessageEvent>;
    /** Producer that will notify listeners on target initialized or disposed */
    private LifeCycleProducer: AbstractMessageProducer<string>;
    /** Brokers that manage targets ports */
    private PortBrokers: BrokerCollection[] = [];
    constructor() {
        this.ErrorProducer = new NotifyProducer<ErrorEvent>();
        this.DeadLetterProducer = new NotifyProducer<MessageEvent>();
        this.LifeCycleProducer = new NotifyProducer<string>();
    }
    private messageHandler(message: IBrokerMessage) {
        if (message.envelope.category === MessagingCategories[1]) {
            (message as IStatusMessage).status = this.reportStatus(message.envelope.name);
        }
        this.MessageProducers.forEach((producer) => {
            if (producer.name === message.envelope.name) {
                producer.producer.trigger(message);
            }
        });
    }
    private reportStatus(name: string) {
        return (status: any) => {
            let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[3]
            },
            data: {
                status: status
            }
            };
            this.sendMessage(message as any);
        };
    }
    public sendMessage(message: IBrokerMessage) {
        if (!message.envelope.target) {
            this.target.makeMessage(message as any);
        } else if (!message.envelope.target.length) {
            this.target.makeMessage(message as any);
        } else {
            let name = message.envelope.target.splice(0, 1);
            let broker = this.findBroker(name[0]);
            if (broker) {
                (broker.broker as MessageBroker).sendMessage(message);
            } else {
                throw new Error("No such broker");
            }
        }
    }
    public sendPublish(publish: IPortMessage) {
        if (!publish.envelope.target) {
            this.target.makePublish(publish as any);
        } else if (!publish.envelope.target.length) {
            this.target.makePublish(publish as any);
        } else {
            let name = publish.envelope.target.splice(0, 1);
            let broker = this.findBroker(name[0]);
            if (broker) {
                (broker.broker as MessageBroker).sendPublish(publish);
            } else {
                throw new Error("No such broker");
            }
        }
    }
    private findBroker(name: string): BrokerCollection {
        let broker;
        let i = 0;
        for (i = 0; i < this.PortBrokers.length; i += 1) {
            if (this.PortBrokers[i].name === name) {
                broker = this.PortBrokers[i];
                break;
            }
        }
        return broker;
    }
    public publishHandler(publish: IBrokerMessage, port: MessagePort) {
        if (!publish.envelope.name) {
            throw new Error("Name is empty");
        }
        if ((publish as IPortMessage).port) {
            delete (publish as IPortMessage).port;
        }
        let portTarget = new PortTarget(port, new TargetRoute());
        let broker = this.findBroker(publish.envelope.name);
        if (!broker) {
            broker = { broker: new MessageBroker(), name: publish.envelope.name };
            this.PortBrokers.push(broker);
        }
        (broker.broker as MessageBroker).attachTarget(portTarget);
    }
    public subscribeHandler(name: string) {
        if (!name) {
            throw new Error("Name is empty");
        }
        let portBroker = this.findBroker(name);
        if (!portBroker) {
            portBroker = { broker: new MessageBroker(), name: name };
            this.PortBrokers.push(portBroker);
        }
        return portBroker.broker;
    }
    public attachTarget(target: IMessageTarget) {
        if (this.target) {
            this.disposeTarget();
        }
        this.target = (target as WorkerTarget);
        target.onmessage = (message: IBrokerMessage) => { this.messageHandler(message); };
        target.onpublish = (publish: IBrokerMessage, port: MessagePort) => this.publishHandler(publish, port);
        target.onerror = (e: ErrorEvent) => this.ErrorProducer.trigger(e);
        target.ondeadletter = (letter: MessageEvent) => this.DeadLetterProducer.trigger(letter);
        this.fireLifeCycleEvent(LifeCycleEvents[0]);
    }
    public disposeTarget() {
        this.target.dispose();
        this.target = null;
        this.PortBrokers = [];
        this.fireLifeCycleEvent(LifeCycleEvents[1]);
    }
    private findProducers(name: string): ProducerCollection<IBrokerMessage> {
        let broker;
        let i = 0;
        for (i = 0; i < this.MessageProducers.length; i += 1) {
            if (this.MessageProducers[i].name === name) {
                broker = this.MessageProducers[i];
                break;
            }
        }
        return broker;
    }
    private fireLifeCycleEvent(status: string) {
        this.LifeCycleProducer.trigger(status);
    }
    public attachLifeCycle() {
        return Stream.create(this.LifeCycleProducer);
    }
    public attachMessage(name: string) {
        let producer = this.findProducers(name);
        if (!producer) {
            producer = { producer: new NotifyProducer<IBrokerMessage>(), name: name };
            this.MessageProducers.push(producer);
        }
        return Stream.create(producer.producer);
    }
    public attachDeadLetter() {
        return Stream.create(this.DeadLetterProducer);
    }
    public attachError() {
        return Stream.create(this.ErrorProducer);
    }
}