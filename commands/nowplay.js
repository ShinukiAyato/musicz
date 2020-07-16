const { MessageEmbed } = require("discord.js")
module.exports = {
  name: "nowplay",
  description: "Toggle music loop",
  async execute(message) {
     const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return message.reply("There is nothing playing.").catch(console.error);
    const song = serverQueue.songs[0]
      let sekon = Math.round(song.duration % 60)
      let menit = Math.round((song.duration / 60) % 60)
      let jam = Math.round((song.duration / (60 * 60)) % 24)
      if(sekon < 10) sekon = `0${sekon}`
      if(menit < 10) menit = `0${menit}`
      let nyaga = `${jam}:${menit}:${sekon}`
      if(jam <= 0) nyaga = `${menit}:${sekon}`
      let bjay = new MessageEmbed()
      .setTitle("▶ Playing:")
      .setDescription(`[${song.title}](${song.url}) untuk **[${nyaga}]** dari [${song.channel}](${song.urlc}). <@${song.tes}>`)
      .setImage(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`)
      .setColor("RANDOM")
      .setThumbnail(song.ava)
      //.setFooter("Messa bot by rnggadosen._");
    message.channel.send(bjay)
  }
}