
exports.name = "ping";
exports.run = async (sock, m, from) => {
    await sock.sendMessage(from, { text: "🏓 Pong! GUARDIAN-JN is live." });
};
