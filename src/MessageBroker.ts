import {IBrokerMessage, MessagingTypes, IMessageBroker, AbstractMessageProducer, IPublishMessage} from "./AbstractBroker";
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
    private MessageProducers: ProducerCollection<IBrokerMessage> = [];
    private ErrorProducers: (AbstractMessageProducer<ErrorEvent>)[] = [];
    private DeadLetterProducers: (AbstractMessageProducer<MessageEvent>)[] = [];
    private MessagePorts: {port: MessagePort, name: string}[] = [];
    constructor(target: WorkerTarget) {
        this.target = target;
        target.onmessage = (message: IBrokerMessage) => this.messageHandler(message);
        target.onpublish = (publish: IPublishMessage) => this.publishHandler(publish);
        target.onerror = (e: ErrorEvent) => this.ErrorProducers.forEach((producer) => producer.trigger(e));
        target.ondeadletter = (letter: MessageEvent) => this.DeadLetterProducers.forEach((producer) => producer.trigger(letter));
    }
    private messageHandler(message: IBrokerMessage) {
    }
    private publishHandler(publish: IPublishMessage) {

    }
    private subscribeHandler(producer: NotifyProducer<IBrokerMessage>, name: string) {}
    public producerFactory(method: string, name: string) {
        let producer = new NotifyProducer<IBrokerMessage>();
        switch (method) {
            case MessagingTypes[0]:
                this.MessageProducers.push({ producer: producer, name: name });
                break;
            case MessagingTypes[2]:
                this.subscribeHandler(producer, name);
                break;
            default:
                throw new Error("Wrong message type");
        }
        return producer;
    }
}