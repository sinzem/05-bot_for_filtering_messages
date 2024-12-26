const trackedChats2 = {
    /* (Example of connecting groups for processing. It is better to use id (in the case of private groups, only id), but it also works by nicknames or names of groups, channels or users) */
    trackedChats: ["ChatName", "chatnickname", "-1001234567890" , "ChannelName", "1234567890", "usernickname"], 

    /* (Examples of words for selection, letter case does not matter) */
    controlWords: ["hello", "hi bro", "yes, but", "5 dollars"],
    exceptionWords: ["lend", "free", "no money", "stollen"]
}

module.exports = trackedChats2;
