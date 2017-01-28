import {IBrokerMessage, MessagingTypes, IMessageBroker, AbstractMessageProducer} from "./AbstractBroker";
import {Producer, Listener} from "xstream";
import {WorkerTarget} from "./MessageTargets";
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
type ProducerCollection<T> = { producer: AbstractMessageProducer<T>, name: string }[];
export class MessageBroker implements IMessageBroker {
    private target: WorkerTarget;
    private PromiseProducers: ProducerCollection<IBrokerMessage> = [];
    private RequestProducers: ProducerCollection<IBrokerMessage> = [];
    private ResponseProducers: ProducerCollection<IBrokerMessage> = [];
    private PublishProducers: ProducerCollection<IBrokerMessage> = [];
    private SubscribeProducers: ProducerCollection<IBrokerMessage> = [];
    private ErrorProducers: (AbstractMessageProducer<ErrorEvent>)[] = [];
    private DeadLetterProducers: (AbstractMessageProducer<MessageEvent>)[] = [];
    private MessagePorts: {port: MessagePort, name: string}[] = [];
    constructor(target: WorkerTarget) {
        this.target = target;
        target.onmessage = (message: MessageEvent) => this.router(message);
        target.onerror = (e: ErrorEvent) => this.ErrorProducers.forEach((producer) => producer.trigger(e));
        target.ondeadletter = (letter: MessageEvent) => this.handleDeadLetter(letter);
    }
    private handlePublish(message: IBrokerMessage, port: MessagePort) {

    }
    private handleDeadLetter(letter: MessageEvent) {
        this.DeadLetterProducers.forEach((producer) => producer.trigger(letter));
    }
    private checkMessage(data: IBrokerMessage) {
        return typeof data.envelope.type === "undefined" || typeof data.envelope.name === "undefined";
    }
    private router(message: MessageEvent) {
        if (this.checkMessage(message.data)) {
            this.handleDeadLetter(message);
        } else {
            let callByName = (producer) => {
                if (producer.name === message.data.envelope.name) {
                    producer.producer.trigger(message.data);
                }
            };
            switch (message.data.envelope.type) {
                case MessagingTypes[0]:
                    this.PromiseProducers.forEach(callByName);
                    break;
                case MessagingTypes[1]:
                    this.RequestProducers.forEach(callByName);
                    break;
                case MessagingTypes[2]:
                    this.ResponseProducers.forEach(callByName);
                    break;
                case MessagingTypes[3]:
                    this.handlePublish(message.data, message.ports[0]);
                    break;
                default:
                    this.DeadLetterProducers.forEach((producer) => producer.trigger(message));
            }
        }
    }
    private channelRouter(message: MessageEvent) {}
    public makeSubscribe(message: IBrokerMessage, port: MessagePort) {}
    public producerFactory(method: string, name: string) {
        let producer = new NotifyProducer<IBrokerMessage>();
        switch (method) {
            case MessagingTypes[0]:
                this.PromiseProducers.push({ producer: producer, name: name });
                break;
            case MessagingTypes[1]:
                this.RequestProducers.push({ producer: producer, name: name });
                break;
            case MessagingTypes[2]:
                this.ResponseProducers.push({ producer: producer, name: name });
                break;
            case MessagingTypes[3]:
                break;
            case MessagingTypes[4]:
                break;
            default:
                throw new Error("No such message type");
        }
        return producer;
    }
}