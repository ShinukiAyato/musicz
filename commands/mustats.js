const { MessageEmbed } = require("discord.js")
const db = require('quick.db')
module.exports = {
  name: "stats",
  description: "Toggle music loop",
  async execute(message) {
    const serverQueue = message.client.queue.get(message.guild.id);
    let status = ''
    let lup = ''
    let prefix = require("../config.json").PREFIX
    const mbed = new MessageEmbed()
    //.setTitle("Messa bot music stats")
    //.setFooter(`To view non-music stats use ${prefix}stats || Messa bot by rnggadosen._`)
    .setColor("RANDOM")
    .addField("Uptime", `${parseInt((message.client.uptime / (1000 * 60 * 60 * 24)) % 60)}D ${parseInt((message.client.uptime / (1000 * 60 * 60)) % 24)}H ${parseInt((message.client.uptime / (1000 * 60)) % 60)}M ${parseInt((message.client.uptime / 1000) % 60)}S`)
    if (!serverQueue) return message.channel.send(mbed).catch(console.error);
    if(serverQueue.playing === true) status = "Playing"
    if(serverQueue.playing === false) status = "Paused"
    if(serverQueue.loop === true) lup = "Yes"
    if(serverQueue.loop === false) lup = "No"
    mbed.addField("Music", `Playing: ${serverQueue.songs[0].title}
Queued: ${parseInt((serverQueue.songs.length) - 1)} songs
In: ${serverQueue.channel.name}
Volume: ${serverQueue.volume}%
Status: ${status}
Loop? ${lup}
Requester: <@${serverQueue.songs[0].tes}>`)
    message.channel.send(mbed)
  }
}