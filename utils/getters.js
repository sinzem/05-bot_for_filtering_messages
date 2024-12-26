async function getEntity(client, verifiable) {
    try {
        let entity = await client.getEntity(verifiable);
        return entity;
    } catch (err) {
        console.log(`${verifiable} data not found`);
    }
}

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

function getChannelId(update) {
    const peerId = update.message.peerId;
    let chatId;

    if (peerId.channelId) {
        chatId = Number(peerId.channelId); 
    } else if (peerId.chatId) {
        chatId = Number(peerId.chatId); 
    } else if (peerId.userId) {
        chatId = Number(peerId.userId); 
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

module.exports = {
    getEntity,
    getChannelsIdArray,
    getChannelId,
    getSenderId
}





