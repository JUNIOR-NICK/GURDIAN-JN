exports.name = "menu";
exports.run = async (sock, m, from, args, config) => {
    let msg = `╭━━━━━━━━━━━━━━━━━━━╮\n`;
    msg += `┃ 🤖 *${config.BOT_NAME}* ┃\n`;
    msg += `┃ ⚡ Fast • Light • Free ┃\n`;
    msg += `╰━━━━━━━━━━━━━━━━━━━╯\n\n`;

    msg += `*📜 ALL COMMANDS*\n`;
    msg += `┏━━━━━━━━━━━━━━━━━━━┓\n`;
    msg += `┃ ${config.PREFIX}ping → Check bot\n`;
    msg += `┃ ${config.PREFIX}menu → Show commands\n`;
    msg += `┃ ${config.PREFIX}kokote → GUARDIAN iko kokote\n`;
    msg += `┃ ${config.PREFIX}sticker → Make sticker\n`;
    msg += `┗━━━━━━━━━━━━━━━━━━━┛\n\n`;
    msg += `> _Use ${config.PREFIX} before any command_\n`;
    msg += `> _Powered by GUARDIAN-JN v1.2_`;
    
    await sock.sendMessage(from, { 
        text: msg,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true
        }
    });
};
