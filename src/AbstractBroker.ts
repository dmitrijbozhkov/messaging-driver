import {Listener, Producer} from "xstream";
import { IMessageTarget } from "./MessageTargets";
/** 
 * Mesage envelope interface used for message routing 
 */
export interface IEnvelope {
    /** Path to targets port */
    target?: string[];
    /** Specifies the type of the message */
    type: string;
    /** Specifies the message identifier */
    name: string;
    /** Specifies message attributes */
    category?: string;
    /** If true passes all that is in data send to target */
    bare?: boolean;
    /** Specifies messsage origin */
    origin?: string;
}
/**
 * Callback for notifying progress or cancellation
 */
export type StatusCallback = (status: any) => void;
/**
 * Transferable types
 */
export type Transferable = MessagePort | ArrayBuffer;
/**
 * Basic message interface
 */
export interface IMessage {
    /** Envelope used for routing */
    envelope: IEnvelope;
    /** Data that will be passed to target */
    data: any;
}
/**
 * Message used for sending data
 */
export interface IBrokerMessage extends IMessage {
    /** Used for transferring objects in data */
    transfer?: Transferable[];
}
/**
 * Message with callback that sends progress data to sender
 */
export interface IStatusMessage extends IMessage {
    /** Progress callback used to notidy sender */
    status: StatusCallback;
}
/**
 * Message used to publish port for MessageChannel
 */
export interface IPortMessage extends IMessage {
    /** Port used for publishing */
    port: MessagePort;
}
/**
 * Message used for managing target of MessageBroker
 */
export interface IAttachMessage extends IMessage {
    /** IMessageTarget object that will be operated by IBroker object */
    target?: IMessageTarget;
}
/**
 * Types of messages that determine how message will be handled
 */
export enum MessagingTypes {
    /** Just sends message to target */
    message,
    /** Publishes port to target */
    publish,
    /** Subscribes to port */
    subscribe,
    /** MessageBroker target managing messages */
    broker
}
/**
 * Categories of messages that determine message routing
 */
export enum MessagingCategories {
    /** Specifies that message just sending data */
    data,
    /** Attaches notify callback to message */
    status,
    /** Specifies the error type message */
    error,
    /** Message from notify callback */
    statusCallback,
    /** Message from cancel callback */
    attach,
    /** Disposes target of IBroker */
    dispose
}
/**
 * Actions from IBroker target
 */
export enum LifeCycleEvents {
    /** Attached new target */
    initialized,
    /** Target disposed */
    disposed
}
/**
 * Abstract class that handles messages
 * @type T Message type
 */
export abstract class AbstractMessageProducer<T> implements Producer<T> {
    /**
     * Subscribes to messages
     * @param listeners Listener that waits for messages
     */
    public abstract start: (listeners: Listener<T>) => void;
    /**
     * Pass message to all handler
     * @param message Message that will be send to listeners
     */
    public abstract trigger: (message: T) => void;
    /** Stops listeners */
    public abstract stop: () => void;
}