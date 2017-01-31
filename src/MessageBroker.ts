import {IBrokerMessage, MessagingTypes, AbstractMessageProducer, IPublishMessage, MessagingCategories, IProgressMessage, ICancelMessage, IRoutedMessage, IRoutedPublish, LifeCycleEvents} from "./AbstractBroker";
import {Producer, Listener} from "xstream";
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
    sendMessage: (message: IRoutedMessage) => void;
    sendPublish: (publish: IRoutedPublish) => void;
    subscribeHandler: (name: string) => IBroker;
    attachTarget: (target: IMessageTarget) => void;
    disposeTarget: () => void;
    attachLifeCycle: (producer: NotifyProducer<string>) => NotifyProducer<string>;
    attachMessage: (producer: NotifyProducer<IBrokerMessage>, name: string) => NotifyProducer<IBrokerMessage>;
    attachDeadLetter: (producer: NotifyProducer<MessageEvent>) => NotifyProducer<MessageEvent>;
    attachError: (producer: NotifyProducer<ErrorEvent>) => NotifyProducer<ErrorEvent>;
}
type ProducerCollection<T> = { producer: AbstractMessageProducer<T>, name: string }[];
type BrokerCollection = { broker: IBroker, name: string };
export class MessageBroker implements IBroker {
    private target: IMessageTarget;
    private MessageProducers: ProducerCollection<IBrokerMessage> = [];
    private ErrorProducers: (AbstractMessageProducer<ErrorEvent>)[] = [];
    private DeadLetterProducers: (AbstractMessageProducer<MessageEvent>)[] = [];
    private LifeCycleProducers: (AbstractMessageProducer<string>)[] = [];
    private PortBrokers: BrokerCollection[] = [];
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
    public sendMessage(message: IRoutedMessage) {
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
    public sendPublish(publish: IRoutedPublish) {
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
    private findBroker(name: string) {
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
    private publishHandler(publish: IBrokerMessage, port: MessagePort) {
        let portTarget = new PortTarget(port, new TargetRoute());
        let broker = this.findBroker(publish.envelope.name);
        if (!broker) {
            broker = { broker: new MessageBroker(), name: publish.envelope.name };
            this.PortBrokers.push(broker);
        }
        (broker.broker as MessageBroker).attachTarget(portTarget);
    }
    public subscribeHandler(name: string) {
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
        target.onerror = (e: ErrorEvent) => this.ErrorProducers.forEach((producer) => producer.trigger(e));
        target.ondeadletter = (letter: MessageEvent) => this.DeadLetterProducers.forEach((producer) => producer.trigger(letter));
        this.fireLifeCycleEvent(LifeCycleEvents[0]);
    }
    public disposeTarget() {
        this.target.dispose();
        this.target = null;
        this.fireLifeCycleEvent(LifeCycleEvents[1]);
    }
    private fireLifeCycleEvent(status: string) {
        this.LifeCycleProducers.forEach((producer) => producer.trigger(status));
    }
    public attachLifeCycle(producer: NotifyProducer<string>) {
        this.LifeCycleProducers.push(producer);
        return producer;
    }
    public attachMessage(producer: NotifyProducer<IBrokerMessage>, name: string) {
        this.MessageProducers.push({ producer: producer, name: name });
        return producer;
    }
    public attachDeadLetter(producer: NotifyProducer<MessageEvent>) {
        this.DeadLetterProducers.push(producer);
        return producer;
    }
    public attachError(producer: NotifyProducer<ErrorEvent>) {
        this.ErrorProducers.push(producer);
        return producer;
    }
}