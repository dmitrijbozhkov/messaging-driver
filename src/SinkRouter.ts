import { Listener } from "xstream";
import { IBrokerMessage, IPortMessage, MessagingTypes, IAttachMessage, MessagingCategories } from "./AbstractBroker";
import { SinkMessages } from "./makeMessagingDriver";
import { IBroker } from "./MessageBroker";
/**
 * Class that routes messages that will be send to IBroker class
 * @constructor Takes IBroker class
 */
export class SinkRouter implements Listener<SinkMessages> {
    /** Broker which will get messages */
    private broker: IBroker;
    constructor(broker: IBroker) {
        this.broker = broker;
    }
    public next(m: SinkMessages) {
        switch (m.envelope.type) {
            case MessagingTypes[0]:
                this.handleMessage(m);
                break;
            case MessagingTypes[1]:
                this.handlePublish(m as any);
                break;
            case MessagingTypes[2]:
                this.handleSubscription(m as any);
                break;
            case MessagingTypes[3]:
                this.handleBroker(m as any);
                break;
            default:
        }
    }
    public error(e: any) {}
    public complete() {}
    /**
     * Handles message with type message
     * @param message IBrokerMessage that will be send to broker
     */
    private handleMessage(message: IBrokerMessage) {
        this.broker.sendMessage(message);
    }
    /**
     * Handles publish messages
     * @param publish Publish message that will send port
     */
    private handlePublish(publish: IPortMessage) {
        this.broker.sendPublish(publish);
    }
    /**
     * Handles subscription to a port
     * @param subscribe Message with port to subscribe to
     */
    private handleSubscription(subscribe: IPortMessage) {
        this.broker.publishHandler(subscribe, subscribe.port);
    }
    /**
     * Handles broker lifecycle messages
     * @param status Message with status
     */
    private handleBroker(status: IAttachMessage) {
        if (status.envelope.category === MessagingCategories[6]) {
            this.broker.attachTarget(status.target);
        } else if (status.envelope.category === MessagingCategories[7]) {
            this.broker.disposeTarget();
        } else {
            throw new Error("Wrong category");
        }
    }
}