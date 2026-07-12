const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require("@whiskeysockets/baileys");
const express = require("express");
const QRCode = require("qrcode");
const P = require("pino");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const app = express();
let qr = "";
let connected = false;
const PORT = process.env.PORT || 3000;

// Load plugins
const cmds = new Map();
const pluginPath = path.join(__dirname, "plugins");
if(!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);
for(const file of fs.readdirSync(pluginPath).filter(f => f.endsWith(".js"))){
    const cmd = require(`./plugins/${file}`);
    cmds.set(cmd.name, cmd);
}

app.get("/", async (req, res) => {
    if(connected) return res.send(`<center><h1>✅ ${config.BOT_NAME} is Online</h1></center>`);
    if(!qr) return res.send(`<center><h1>⏳ Generating QR...</h1></center>`);
    res.send(`<center><h1>Scan QR for ${config.BOT_NAME}</h1><img src="${qr}" width="300"/></center>`);
});
app.listen(PORT, () => console.log(`${config.BOT_NAME} running on ${PORT}`));

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: "warn" }),
        printQRInTerminal: false,
        browser: [config.BOT_NAME, "Chrome", "120.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (u) => {
        const { connection, lastDisconnect, qr: qrCode } = u;
        if(qrCode){
            qr = await QRCode.toDataURL(qrCode);
            console.log("📱 New QR Generated");
        }
        if(connection === "open"){
            connected = true;
            qr = "";
            console.log(`${config.BOT_NAME} Connected ✅`);
            
            // AUTO STATUS VIEW + LIKE
            sock.ev.on('messages.upsert', async ({ messages }) => {
                if(!config.AUTO_STATUS_LIKE) return;
                const m = messages[0];
                if(!m.key.remoteJid.includes('status@broadcast')) return;
                await sock.readMessages([m.key]);
                await sock.sendMessage(m.key.remoteJid, { react: { text: '❤️', key: m.key } });
            });
        }
        if(connection === "close"){
            connected = false;
            qr = "";
            const code = lastDisconnect.error?.output?.statusCode;
            if(code !== DisconnectReason.loggedOut) setTimeout(connect, 3000);
        }
    });

    // Message Handler with Toggles
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if(type!== "notify") return;
        const m = messages[0];
        if(!m.message) return;

        const from = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

        // AUTO READ - Blue ticks
        if(config.AUTO_READ && !from.includes('status@broadcast')){
            await sock.readMessages([m.key]);
        }

        if(!text.startsWith(config.PREFIX)) return;
        
        const [cmd,...args] = text.slice(1).trim().split(" ");
        const command = cmds.get(cmd.toLowerCase());
        
        if(command){
            try{
                // AUTO TYPE/RECORD
                if(config.AUTO_TYPE){
                    const presence = Math.random() > 0.5? 'composing' : 'recording';
                    await sock.sendPresenceUpdate(presence, from);
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    await sock.sendPresenceUpdate('paused', from);
                }
                
                await command.run(sock, m, from, args, config);
            }catch(e){
                console.log(e);
                await sock.sendMessage(from, { text: `❌ Error in ${cmd}` });
            }
        }
    });
}
connect();
