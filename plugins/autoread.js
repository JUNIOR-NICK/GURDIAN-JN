exports.name = "autoread";
exports.run = async (sock, m, from, args, config) => {
    config.AUTO_READ = !config.AUTO_READ;
    await sock.sendMessage(from, { text: `✅ Auto Read: ${config.AUTO_READ ? 'ON' : 'OFF'}` });
};
