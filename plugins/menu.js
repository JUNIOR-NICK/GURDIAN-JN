exports.name = "menu";
exports.run = async (sock, m, from, args, config) => {
    let msg = `╭─❍ *${config.BOT_NAME}* ❍─╮\n`;
    msg += `│ 👑 *OWNER:* You\n`;
    msg += `│ ⚡ *PREFIX:* ${config.PREFIX}\n`;
    msg += `│ 🟢 *STATUS:* Online\n`;
    msg += `╰─────────────────╯\n\n`;
    
    msg += `┏━━━『 *GENERAL* 』━━━┓\n`;
    msg += `┃ ${config.PREFIX}ping → Check bot speed\n`;
    msg += `┃ ${config.PREFIX}menu → Show this menu\n`;
    msg += `┗━━━━━━━━━━━━━━━━━┛\n\n`;
    
    msg += `┏━━━『 *FAKE PRESENCE* 』━━━┓\n`;
    msg += `┃ ${config.PREFIX}type <text> → Fake typing\n`;
    msg += `┃ ${config.PREFIX}rec <text> → Fake recording\n`;
    msg += `┗━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
    
    msg += `┏━━━『 *AUTO TOGGLES* 』━━━┓\n`;
    msg += `┃ ${config.PREFIX}autotype → ${config.AUTO_TYPE ? '🟢 ON' : '🔴 OFF'}\n`;
    msg += `┃ ${config.PREFIX}autoread → ${config.AUTO_READ ? '🟢 ON' : '🔴 OFF'}\n`;
    msg += `┃ ${config.PREFIX}autolike → ${config.AUTO_STATUS_LIKE ? '🟢 ON' : '🔴 OFF'}\n`;
    msg += `┗━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;
    
    msg += `┏━━━『 *DOWNLOAD* 』━━━┓\n`;
    msg += `┃ ${config.PREFIX}sticker → Reply to image/video\n`;
    msg += `┗━━━━━━━━━━━━━┛\n\n`;
    
    msg += `╭─❍ *POWERED BY ${config.BOT_NAME}* ❍─╮\n`;
    msg += `│ Made with ❤️ for WhatsApp\n`;
    msg += `╰─────────────────────────╯`;
    
    await sock.sendMessage(from, { 
        text: msg,
        contextInfo: {
            mentionedJid: [m.key.participant || m.key.remoteJid],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363@newsletter',
                newsletterName: config.BOT_NAME,
                serverMessageId: 1
            }
        }
    });
};
