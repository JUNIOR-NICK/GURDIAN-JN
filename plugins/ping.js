exports.name = "ping";
exports.run = async (sock, m, from, args, config) => {
    const start = Date.now(); // start timer
    
    const sentMsg = await sock.sendMessage(from, { 
        text: `🏓 *PING...*` 
    });

    const end = Date.now(); // end timer
    const speed = end - start; // calculate ms

    await sock.sendMessage(from, { 
        text: `🏓 *PONG!*\n\n⚡ Speed: ${speed}ms\n🤖 Bot: ${config.BOT_NAME}\n📶 Status: Online`,
        edit: sentMsg.key // edits the "PINGING..." message
    });
};
