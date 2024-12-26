function checkingIncomingMessage(text, controlWords, avoidWords) {
    text = text.toLowerCase();
    let need = controlWords.some(word => text.includes(word.toLowerCase()));
    let noNeed = avoidWords.some(word => text.includes(word.toLowerCase()));
    if (need && !noNeed) {
        return true;
    } else {
        return false;
    }
} 

module.exports = {
    checkingIncomingMessage,
}