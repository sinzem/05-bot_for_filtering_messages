require('dotenv').config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const  { TelegramClient, Api } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require('telegram/events');

const apiId = Number(process.env.API_ID); 
const apiHash = process.env.API_HASH; 
const trackedChats1 = (process.env.TRACKED_CHATS_1)?.split(",") || [];
const controlWords1 = (process.env.CONTROL_WORDS_1)?.split(";") || [];
const exceptionWords1 = (process.env.EXCEPTION_WORDS_1)?.split(";") || [];
const chatForResponse = Number(process.env.CHAT_FOR_RESPONSE); 


const stringSession = new StringSession(process.env.TG_SESSION);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const telegramClient = async () => {

    const client = new TelegramClient(stringSession, apiId, apiHash, {
        connectionRetries: 5,
    });
    // --------------------------------------
    await client.start({
        phoneNumber: process.env.USER_PHONE,
        password: process.env.USER_PASSWORD,
        phoneCode: async () =>
        new Promise((resolve) =>
            rl.question("Please enter the code you received: ", resolve) 
        ),
        onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    console.log(client.session.save());  
    // -------------------------------------
    let trackedChatsIds1 = await getChannelsIdArray(client, trackedChats1);

    client.addEventHandler(async (event) => {
        const fromGroupId = getChannelId(event);

        if (trackedChatsIds1.includes(fromGroupId)) {
            const message = event.message.message;
            let checkText = checkMessage(message, controlWords1, exceptionWords1);
            if (checkText) {
                const groupEntity = await getEntity(client, fromGroupId);
                let channel = groupEntity.title || groupEntity.username || "Unknown";
                const senderId = getSenderId(event);
           
                let senderDataMessage;
                if (senderId === "ADMIN") {
                    senderDataMessage = `
                        position: ADMIN
                        id: ${fromGroupId}
                    `; 
                } else {
                    const senderEntity = await getEntity(client, senderId);
                    senderDataMessage = `name: ${senderEntity.firstName}\nsurname: ${senderEntity.lastName}\nusername: ${senderEntity.username}\nphone: ${senderEntity.phone}\nid: ${senderId}`;
                }
                let responseMessage = `<b>Message text:</b>\n${message}\n<b>Group or person:</b>\n${channel}\n<b>Sender details:</b>\n${senderDataMessage}`;
                sendResponse(client, chatForResponse, responseMessage);
            }
        }
        
    }, new NewMessage({}))
};

telegramClient();



async function getChannelsIdArray(client, arr) {
    let trackedChatsIds = [];
    while (arr.length) {
        let name = arr.pop();
        try {
            let entity = await client.getEntity(name);
            trackedChatsIds.push(Number(entity.id?.value));
        } catch (err) {
            console.log(`${name} chat data not found`);
        }
    }
    return trackedChatsIds;
}

async function getEntity(client, verifiable) {
    try {
        let entity = await client.getEntity(verifiable);
        return entity;
    } catch (err) {
        console.log(`${verifiable} data not found`);
    }
}

function getChannelId(update) {
        const peerId = update.message.peerId;
        let chatId;

        if (peerId.channelId) {
            chatId = Number(peerId.channelId); // ID channel or private group
        } else if (peerId.chatId) {
            chatId = Number(peerId.chatId); // ID public group
        } else if (peerId.userId) {
            chatId = Number(peerId.userId); // ID user
        }
        return chatId;
}

function getSenderId(update) {
    const fromId = update.message.fromId; 
    let senderId;

    if (!fromId) {
        senderId = "ADMIN";
    } else {
        senderId = Number(fromId.userId);
    }
    return senderId;
}

function checkMessage(text, controlWords, avoidWords) {
    text = text.toLowerCase();
    let need = controlWords.some(word => text.includes(word.toLowerCase()));
    let noNeed = avoidWords.some(word => text.includes(word.toLowerCase()));
    if (need && !noNeed) {
        return true;
    } else {
        return false;
    }
} 

async function sendResponse(client, chatForResponse, message) {
    try {
        await client.sendMessage(chatForResponse, {
            message: message,
            parseMode: 'html'
        })
    } catch (e) {
        console.log(`Error sending data about the sender of the message: ${e}`);
    }
}


