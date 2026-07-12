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

// Load all plugins
const cmds = new Map();
const pluginPath = path.join(__dirname, "plugins");
if(!fs.existsSync(pluginPath)) fs.mkdirSync(pluginPath);

for(const file of fs.readdirSync(pluginPath).filter(f => f.endsWith(".js"))){
    const cmd = require(`./plugins/${file}`);
    cmds.set(cmd.name, cmd);
    console.log(`[PLUGIN] ${cmd.name} loaded`);
}

// Web server for QR
app.get("/", async (req, res) => {
    if(connected) return res.send(`<center><h1>✅ ${config.BOT_NAME} is Online</h1><p>Bot is ready to receive commands</p></center>`);
    if(!qr) return res.send(`<center><h1>⏳ Generating QR... Refresh in 5s</h1></center>`);
    res.send(`<center><h1>Scan QR for ${config.BOT_NAME}</h1><img src="${qr}" width="300"/><p>Scan with WhatsApp > Linked Devices</p></center>`);
});

app.listen(PORT, () => console.log(`${config.BOT_NAME} running on port ${PORT}`));

async function connect() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();
    console.log(`Using WA v${version.join('.')}`)

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
            console.log("📱 New QR Generated -> Open Render URL to scan");
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
            console.log("❌ Disconnected. Code:", code);
            if(code !== DisconnectReason.loggedOut) {
                console.log("Reconnecting in 3s...");
                setTimeout(connect, 3000);
            } else {
                console.log("Logged out. Delete /session folder and scan again.");
            }
        }
    });

    // Message Handler
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if(type !== "notify") return;
        const m = messages[0];
        if(!m.message) return; // <-- FIXED: bot now responds to you too

        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        
        const text = m.message.conversation
                   || m.message.extendedTextMessage?.text
                   || m.message.imageMessage?.caption
                   || m.message.videoMessage?.caption
                   || "";

        if(!text.startsWith(config.PREFIX)) return;
        
        const [cmd,...args] = text.slice(1).trim().split(" ");
        const command = cmds.get(cmd.toLowerCase());
        
        if(command){
            try{
                console.log(`[CMD] ${cmd} from ${from}`);
                await command.run(sock, m, from, args, config);
            }catch(e){
                console.log(e);
                await sock.sendMessage(from, { text: `❌ Error in ${cmd} command` });
            }
        }
    });
}
connect();
