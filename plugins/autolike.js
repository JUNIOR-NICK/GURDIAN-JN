exports.name = "autolike";
exports.run = async (sock, m, from, args, config) => {
    config.AUTO_STATUS_LIKE = !config.AUTO_STATUS_LIKE;
    await sock.sendMessage(from, { text: `✅ Auto Status View+Like: ${config.AUTO_STATUS_LIKE ? 'ON' : 'OFF'}` });
};
