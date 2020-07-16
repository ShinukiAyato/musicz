module.exports = {
  name: "skip",
  async execute(message, args) {
    let serverQueue = message.client.queue.get(message.guild.id);
    if (!message.member.voice.channel) return message.channel.send(`❌ | Can you try again by joining voice channel?`)
    if(message.member.voice.channel.id !== serverQueue.channel.id) return message.reply("Must same voice channel")
    if (!serverQueue) return message.channel.send('No musics are being played.')
    let song = serverQueue.songs[0]   
    let jumem = serverQueue.channel.members.filter(g => !g.user.bot).size
    if (serverQueue.songs[0].vote.includes(message.author.id)) return message.channel.send(`${message.author}, you have already voted! \`\`${song.vote.length}/${jumem}\`\` votes.`);
    
    song.vote.push(message.author.id);
        message.channel.send(`${message.author} voted! \`\`${song.vote.length}/${jumem}\`\` votes.`);
        if (song.vote.length >= jumem) return serverQueue.connection.dispatcher.end();
    
}
};
