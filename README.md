# Messagng API for cycle.js
 Cycle.js driver for working with browser messaging API.
## Features:
    1. Send messages to Web Workers
    2. Send messages to Iframes
    3. Creation and communication with MessageChannels
    4. Transfer uncloneable and large objects.
## How it works:
    1. Create driver with makeMessagingDriver and pass IBroker object
    2. Start messaging with passing IAttachMessage object with type broker, category attach and target
    3. You can now send messages that implement IBrokerMessage, IPortMessage interfaces
    4. Dispose target with passing IAttachMessage object with type broker and category dispose.
## Examples:
    1. Messaging with web worker
    2. Transferring ArrayBuffer from worker
    3. Communicating with iframe
    4. Creating MessageChannel
    5. Forward messages from iframe tp worker using MessageChannel
    6. Communicating with someone elses code.