require('dotenv').config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const  { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require('telegram/events');
const {getChannelsIdArray, getChannelId} = require("./utils/getters.js");
const filterMessages = require("./modules/filterMessages.js");

/* (Settings of processed channels - id, keywords) */
const trackedChats1 = require("./sortingSettings/trackedChats1.js"); 

/* (The application must be registered on https://my.telegram.org/auth, the resulting id and hash must be saved in .env) */
const apiId = Number(process.env.API_ID); 
const apiHash = process.env.API_HASH; 

/* (When the user bot is launched for the first time successfully, a hash string will be displayed in the terminal; it must be saved in .env for subsequent launches) */
const stringSession = new StringSession(process.env.TG_SESSION);

/* (Chat id to get filtered results) */
const chatForResponse = Number(process.env.CHAT_FOR_RESPONSE); 

/* (When you start the bot, it will ask for a confirmation password (in the terminal), which will be sent to the number you specified) */
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
    /* (Getting an array of channel ids for tracking) */
    let trackedChatsIds1 = await getChannelsIdArray(client, trackedChats1.trackedChats);

    client.addEventHandler(async (event) => {
        const fromGroupId = getChannelId(event);
   
        /* (If the message came from a monitored channel, you need to run the filter function (for other settings objects, you only need to replace the array with the monitored channels and the transmitted settings object)) */
        if (trackedChatsIds1.includes(fromGroupId)) {
            await filterMessages(client, event, fromGroupId, chatForResponse, trackedChats1);
        }   
        
    }, new NewMessage({}))
};

telegramClient();










