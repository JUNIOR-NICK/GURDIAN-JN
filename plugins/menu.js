exports.name = "menu";
exports.run = async (sock, m, from, args, config, isOwner) => {
    let msg = `╭───「 *${config.BOT_NAME}* 」───╮\n`;
    msg += `│ 🤖 Bot: ${config.BOT_NAME}\n`;
    msg += `│ 👑 Owner: ${isOwner ? 'You' : 'Hidden'}\n`;
    msg += `│ 📌 Prefix: ${config.PREFIX}\n`;
    msg += `╰──────────────────╯\n\n`;

    msg += `*📜 GENERAL COMMANDS*\n`;
    msg += `├ ${config.PREFIX}ping - Check bot speed\n`;
    msg += `├ ${config.PREFIX}menu - Show this menu\n`;
    msg += `└ ${config.PREFIX}kokote - GUARDIAN iko kokote\n\n`;

    if(isOwner){
        msg += `*👑 OWNER COMMANDS*\n`;
        msg += `├ ${config.PREFIX}ban - Ban user\n`;
        msg += `├ ${config.PREFIX}broadcast - Send to all chats\n`;
        msg += `└ ${config.PREFIX}restart - Restart bot\n`;
    }
    
    msg += `> Powered by GUARDIAN-JN v1.2`;
    await sock.sendMessage(from, { text: msg });
};
