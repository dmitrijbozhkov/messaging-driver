import * as assert from "assert";
import {makeMessagingDriver} from "../../lib/makeMessagingDriver";
import {Stream} from "xstream";
describe("MessagingDriver tests", () => {
    it("MessagingDriver should return function which returns ChooseSink class");
    it("MessagingDrivers ChooseSink should return ChooseMessage class");

    it("ChooseSink.Error()");

    it("Promise().Message() should return Stream<IBrokerMessage> with type promise and category message");
    it("Promise().Progress() should return Stream<IBrokerMessage> with type promise and category progress");
    it("Promise().Cancel() should return Stream<IBrokerMessage> with type promise and category cancel");

    it("Request() should return Stream<IBrokerMessage> with type request and category message");

    it("Response().Message() should return Stream<IBrokerMessage> with type response and category message");
    it("Response().Progress() should return Stream<IBrokerMessage> with type response and category progress");
    it("Response().Cancel() should return Stream<IBrokerMessage> with type response and category cancel");

    it("Subscribe().Message()");
    it("Subscribe().Progress()");
    it("Subscribe().Cancel()");
    it("Subscribe().Error()");
});