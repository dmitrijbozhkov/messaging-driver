# Messagng API for cycle.js
    Cycle.js driver for working with browser messaging API.
## Features:
    - Send messages to Web Workers
    - Send messages to Iframes
    - Creation and communication with MessageChannels
    - Transfer uncloneable and large objects
## How it works:
    1. Create driver with makeMessagingDriver and pass IBroker object
    2. Start messaging with passing IAttachMessage object with type broker, category attach and target
    3. You can now send messages that implement IBrokerMessage, IPortMessage interfaces
    4. Dispose target with passing IAttachMessage object with type broker and category dispose
## Examples:
    - Messaging with web worker
    - Transferring ArrayBuffer from worker
    - Communicating with iframe
    - Creating MessageChannel
    - Forward messages from iframe tp worker using MessageChannel
    - Communicating with someone elses code 