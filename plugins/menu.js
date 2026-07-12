exports.name = "menu";
exports.run = async (sock, m, from, args, config) => {
    let msg = `*${config.BOT_NAME} Commands*\n\n`;
    msg += `${config.PREFIX}ping - Check if bot is alive\n`;
    msg += `${config.PREFIX}menu - Show this menu\n`;
    msg += `${config.PREFIX}kokote - GUARDIAN iko kokote\n`;
    await sock.sendMessage(from, { text: msg });
};
