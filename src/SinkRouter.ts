import { Listener } from "xstream";
import { IBrokerMessage, IPortMessage, MessagingTypes, IAttachMessage, MessagingCategories } from "./AbstractBroker";
import { SinkMessages } from "./makeMessagingDriver";
import { IBroker } from "./MessageBroker";
export class SinkRouter implements Listener<SinkMessages> {
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
    /*
    private findBroker(name: string) {
        return this.brokers[name];
    }
    private getSinkBroker(message: SinkMessages) {
        let broker: IBroker;
        if (message.envelope.target) {
            broker = this.findBroker(message.envelope.target.splice(0, 1)[0]);
            if (broker) {
                return broker;
            } else {
                throw new Error("No such target");
            }
        } else {
            broker = this.findBroker("self");
            if (broker) {
                return broker;
            } else {
                throw new Error("No self target");
            }
        }
    }
    */
    private handleMessage(message: IBrokerMessage) {
        this.broker.sendMessage(message);
    }
    private handlePublish(publish: IPortMessage) {
        this.broker.sendPublish(publish);
    }
    private handleSubscription(subscribe: IPortMessage) {
        this.broker.publishHandler(subscribe, subscribe.port);
    }
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