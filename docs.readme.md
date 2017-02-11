# Messagng API for cycle.js
Cycle.js driver for working with browser messaging API.
## Features:
- Send messages to Web Workers
- Send messages to Iframes
- Creation and communication with MessageChannels
- Transfer uncloneable and large objects
## How it works:
1. Create driver with [makeMessagingDriver](modules/_makemessagingdriver_.html#makemessagingdriver) and pass [IBroker](interfaces/_messagebroker_.ibroker.html) object
2. Start messaging with passing [IAttachMessage](interfaces/_abstractbroker_.iattachmessage.html) object with type broker, category attach and target
3. You can now send messages that implement [IBrokerMessage](interfaces/_abstractbroker_.ibrokermessage.html), [IPortMessage](interfaces/_abstractbroker_.iportmessage.html) interfaces
4. Dispose target with passing [IAttachMessage](interfaces/_abstractbroker_.iattachmessage.html) object with type broker and category dispose
## Examples:
- Messaging with web worker
- Transferring ArrayBuffer from worker
- Communicating with iframe
- Creating MessageChannel
- Forward messages from iframe tp worker using MessageChannel
- Communicating with someone elses code 