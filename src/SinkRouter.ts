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
                this.handleBroker(m as any);
                break;
            default:
                throw new Error("No such message type");
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
     * Handles broker lifecycle messages
     * @param status Message with status
     */
    private handleBroker(status: IAttachMessage) {
        if (status.envelope.category === MessagingCategories[4]) {
            this.broker.attachTarget(status.target);
        } else if (status.envelope.category === MessagingCategories[5]) {
            this.broker.disposeTarget();
        } else {
            throw new Error("Wrong category");
        }
    }
}