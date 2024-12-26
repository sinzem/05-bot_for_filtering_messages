const {checkingIncomingMessage} = require("../utils/checkers.js");
const {getSenderId, getEntity} = require("../utils/getters.js");
const {sendResponse} = require("../utils/senders.js");

async function filterMessages(client, 
                                event,
                                fromGroupId, 
                                chatForResponse, 
                                {trackedChats = [], controlWords = [], exceptionWords = []}) {
        const message = event.message.message;
            let checkText = checkingIncomingMessage(message, controlWords, exceptionWords);
            if (checkText) {
                const groupEntity = await getEntity(client, fromGroupId);
                let channel = groupEntity.title || groupEntity.username || "Unknown";
                const senderId = getSenderId(event);
           
                let senderDataMessage;
                if (senderId && senderId === "ADMIN") {
                    senderDataMessage = `position: channel ADMIN\nid: ${fromGroupId}`; 
                } else if (senderId) {
                    const senderEntity = await getEntity(client, senderId);
                    senderDataMessage = `name: ${senderEntity.firstName}\nsurname: ${senderEntity.lastName}\nusername: ${senderEntity.username}\nphone: ${senderEntity.phone}\nid: ${senderId}`;
                }
                let responseMessage = `<b>Message text:</b>\n${message}\n<b>Group or person:</b>\n${channel}\n<b>Sender details:</b>\n${senderDataMessage}`;
                await sendResponse(client, chatForResponse, responseMessage);
            }
}

module.exports = filterMessages;