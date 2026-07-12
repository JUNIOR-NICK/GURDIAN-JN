exports.name = "ping";
exports.ownerOnly = false; // everyone can use
exports.run = async (sock, m, from) => {
    await sock.sendMessage(from, { text: "pong ✅" });
};
