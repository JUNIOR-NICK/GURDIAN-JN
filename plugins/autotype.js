exports.name = "autotype";
exports.ownerOnly = true; // <-- add this line
exports.run = async (sock, m, from, args, config, isOwner) => {
    config.AUTO_TYPE = !config.AUTO_TYPE;
    await sock.sendMessage(from, { text: `✅ Auto Typing: ${config.AUTO_TYPE ? 'ON' : 'OFF'}` });
};
