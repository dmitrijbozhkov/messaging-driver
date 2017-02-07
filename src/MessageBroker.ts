import {IBrokerMessage, MessagingTypes, AbstractMessageProducer, IPortMessage, MessagingCategories, IProgressMessage, ICancelMessage, LifeCycleEvents, Transferable} from "./AbstractBroker";
import {Producer, Listener, Stream} from "xstream";
import {WorkerTarget, PortTarget, TargetRoute, IMessageTarget} from "./MessageTargets";
import {WorkerMock} from "./WorkerMock";
export class NotifyProducer<T> implements AbstractMessageProducer<T> {
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
type ProducerCollection<T> = { producer: AbstractMessageProducer<T>, name: string };
type BrokerCollection = { broker: IBroker, name: string };
export class MessageBroker implements IBroker {
    private target: IMessageTarget;
    private MessageProducers: ProducerCollection<IBrokerMessage>[] = [];
    private ErrorProducer: AbstractMessageProducer<ErrorEvent>;
    private DeadLetterProducer: AbstractMessageProducer<MessageEvent>;
    private LifeCycleProducer: AbstractMessageProducer<string>;
    private PortBrokers: BrokerCollection[] = [];
    constructor() {
        this.ErrorProducer = new NotifyProducer<ErrorEvent>();
        this.DeadLetterProducer = new NotifyProducer<MessageEvent>();
        this.LifeCycleProducer = new NotifyProducer<string>();
    }
    private messageHandler(message: IBrokerMessage) {
        if (message.envelope.category === MessagingCategories[1]) {
            (message as IProgressMessage).progress = this.reportProgress(message.envelope.name);
        } else if (message.envelope.category === MessagingCategories[2]) {
            (message as ICancelMessage).cancel = this.reportCancel(message.envelope.name);
        }
        this.MessageProducers.forEach((producer) => {
            if (producer.name === message.envelope.name) {
                producer.producer.trigger(message);
            }
        });
    }
    private reportProgress(name: string) {
        return (status: any) => {
            let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[4]
            },
            data: {
                status: status
            }
            };
            this.sendMessage(message as any);
        };
    }
    private reportCancel(name: string) {
        return (status: any) => {
            let message: IBrokerMessage = {
            envelope: {
                type: MessagingTypes[0],
                name: name,
                category: MessagingCategories[5]
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
        target.ondeadletter = (letter: MessageEvent) => this.DeadLetterProducer.trigger(letter)
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
        this.LifeCycleProducer.trigger(status)
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