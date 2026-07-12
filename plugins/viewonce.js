const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

exports.name = "viewonce";
exports.ownerOnly = false; // only you can use it
exports.desc = "Opens and resends viewonce media";

exports.run = async (sock, m, from, args, config, isOwner) => {
    const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;

    // Check if user replied to a message
    if(!quoted){
        return await sock.sendMessage(from, { text: "❌ Reply to a View Once image/video with.viewonce" });
    }

    try{
        let mediaType = Object.keys(quoted)[0];
        let stream, type, mimetype, fileName;

        if(mediaType === "viewOnceMessageV2"){
            mediaType = Object.keys(quoted.viewOnceMessageV2.message)[0];
            const msg = quoted.viewOnceMessageV2.message[mediaType];
            stream = await downloadContentFromMessage(msg, mediaType.replace("Message", ""));
            mimetype = msg.mimetype;
        }
        else if(mediaType === "viewOnceMessage"){
            mediaType = Object.keys(quoted.viewOnceMessage.message)[0];
            const msg = quoted.viewOnceMessage.message[mediaType];
            stream = await downloadContentFromMessage(msg, mediaType.replace("Message", ""));
            mimetype = msg.mimetype;
        }
        else{
            return await sock.sendMessage(from, { text: "❌ That is not a View Once message" });
        }

        let buffer = Buffer.from([]);
        for await(const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        // Send it back
        if(mediaType.includes("image")){
            await sock.sendMessage(from, { image: buffer, caption: "✅ View Once Opened" });
        }
        else if(mediaType.includes("video")){
            await sock.sendMessage(from, { video: buffer, caption: "✅ View Once Opened" });
        }
        else{
            await sock.sendMessage(from, { text: "❌ Unsupported media type" });
        }

    }catch(e){
        console.log(e);
        await sock.sendMessage(from, { text: `❌ Failed to open viewonce: ${e.message}` });
    }
};
