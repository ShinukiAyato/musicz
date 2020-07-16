module.exports = {
  name: "remove",
  description: "Remove song from the queue",
  async execute(message, args) {
    if (!args.length) return message.reply(`Usage: ${message.client.prefix}remove <Queue Number>`);
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.channel.send("There is no queue.").catch(console.error);
    const { channel } = message.member.voice;
    if(channel.id !== serverQueue.channel.id || !channel) return message.reply("You need join same voice channel with me!")
    const song = serverQueue.songs.splice(args[0] - 1, 1);
    serverQueue.textChannel.send(`${message.author} ❌ removed **${song[0].title}** from the queue.`);
  }
};