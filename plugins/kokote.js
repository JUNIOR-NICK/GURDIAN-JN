exports.name = "kokote";
exports.run = async (sock, m, from) => {
    const replies = [
        "GUARDIAN-JN iko kokote 🔥", 
        "Niko hapa kokote, boss 😎",
        "Tafuta mimi kokote, utanipata."
    ];
    const random = replies[Math.floor(Math.random() * replies.length)];
    await sock.sendMessage(from, { text: random });
};
