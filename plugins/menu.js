exports.name = "menu";
exports.run = async (sock, m, from, args, config) => {
    let msg = *${config.BOT_NAME} Commands*\n\n;
    for(const [name] of cmds) msg += ${config.PREFIX}${name}\n;
    await sock.sendMessage(from, { text: msg });
};


