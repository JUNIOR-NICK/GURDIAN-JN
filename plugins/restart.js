exports.name = "restart";
exports.ownerOnly = true; // <-- only owner can use
exports.run = async (sock, m, from) => {
    await sock.sendMessage(from, { text: "♻️ Restarting GUARDIAN-JN..." });
    process.exit(1); // Render will auto restart
};
