exports.name = "autotype";
exports.ownerOnly = true; // only owner can use
exports.run = async (sock, m, from, args, config) => {
    config.AUTO_TYPE =!config.AUTO_TYPE;
    await sock.sendMessage(from, { text: `AutoTyping: ${config.AUTO_TYPE? 'ON' : 'OFF'}` });
};
