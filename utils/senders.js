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

module.exports = {
    sendResponse,
}