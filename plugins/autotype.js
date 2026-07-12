exports.name = "autotype";
exports.run = async (sock, m, from, args, config) => {
    config.AUTO_TYPE = !config.AUTO_TYPE;
    await sock.sendMessage(from, { text: `✅ Auto Typing/Recording: ${config.AUTO_TYPE ? 'ON' : 'OFF'}` });
};
