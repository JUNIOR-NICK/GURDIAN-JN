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

console.log("Loading plugins...");
for(const file of fs.readdirSync(pluginPath).filter(f => f.endsWith(".js"))){
    try{
        delete require.cache[require.resolve(`./plugins/${file}`)];
        const cmd = require(`./plugins/${file}`);
        cmds.set(cmd.name, cmd);
        console.log(`✅ Loaded: ${cmd.name}`);
    }catch(e){
        console.log(`❌ Failed to load ${file}`, e);
    }
}
console.log(`Total Commands Loaded: ${cmds.size}`);

app.get("/", async (req, res) => {
    if(connected) return res.send(`<center><h1>✅ ${config.BOT_NAME} is Online | Cmds: ${cmds.size}</h1></center>`);
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
        }
        if(connection === "close"){
            connected = false;
            qr = "";
            const code = lastDisconnect.error?.output?.statusCode;
            if(code!== DisconnectReason.loggedOut) setTimeout(connect, 3000);
        }
    });

    // SINGLE MESSAGE HANDLER
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if(type!== "notify") return;
        const m = messages[0];
        if(!m.message) return;

        const from = m.key.remoteJid;
        const sender = m.key.participant || m.key.remoteJid;
        const senderNum = sender.split("@")[0];
        const isOwner = senderNum === config.OWNER;

        console.log(`[MSG] From: ${senderNum} | Text: ${m.message.conversation || 'media'}`);

        const isStatus = from.includes('status@broadcast');

        // STATUS
        if(isStatus && config.AUTO_STATUS_LIKE){
            await sock.readMessages([m.key]);
            await sock.sendMessage(from, { react: { text: '❤️', key: m.key } });
            return;
        }

        // AUTO READ
        if(config.AUTO_READ) await sock.readMessages([m.key]);

        // AUTO PRESENCE
        if(config.AUTO_TYPE &&!isStatus){
            await sock.sendPresenceUpdate('composing', from);
            await new Promise(r => setTimeout(r, 2000));
            await sock.sendPresenceUpdate('paused', from);
        }

        // GET TEXT
        const text = m.message.conversation
                   || m.message.extendedTextMessage?.text
                   || m.message.imageMessage?.caption
                   || m.message.videoMessage?.caption
                   || "";

        // DEBUG: REPLY TO EVERYTHING FIRST
        await sock.sendMessage(from, { text: `📩 Got your message: "${text}"\nPrefix: ${config.PREFIX}` });

        // COMMAND HANDLER
        if(!text.startsWith(config.PREFIX)) return;

        const [cmd,...args] = text.slice(1).trim().split(" ");
        const command = cmds.get(cmd.toLowerCase());

        if(command){
            if(command.ownerOnly &&!isOwner){
                return await sock.sendMessage(from, { text: "❌ Owner Only Command" });
            }
            try{
                await command.run(sock, m, from, args, config, isOwner);
            }catch(e){
                console.log(e);
                await sock.sendMessage(from, { text: `❌ Error: ${e.message}` });
            }
        }else{
            await sock.sendMessage(from, { text: `❌ Command not found: ${cmd}\nUse ${config.PREFIX}menu` });
        }
    });
}
connect();
