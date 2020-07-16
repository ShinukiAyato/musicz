const ytdlDiscord = require("ytdl-core-discord");

module.exports = {
  async play(song, message) {
    const { PRUNING } = require("../config.json");
    const queue = message.client.queue.get(message.guild.id);
    let collector = null;
    const Discord = require("discord.js")
    const aidi = message.author.id
    if (!song) {
      queue.channel.leave();
      message.client.queue.delete(message.guild.id);
      return queue.textChannel.send("🚫 Music queue ended.").catch(console.error);
    }

    try {
      var stream = await ytdlDiscord(song.url);
    } catch (error) {
      if (queue) {
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      }

      
    }

    const dispatcher = queue.connection
      .play(stream, { type: "opus" })
      .on("finish", () => {
        if (collector && !collector.ended) collector.stop();

        if (PRUNING && playingMessage && !playingMessage.deleted)
          playingMessage.delete().catch(console.error);

        if (queue.loop) {
          // if loop is on, push the song back at the end of the queue
          // so it can repeat endlessly
          let lastSong = queue.songs.shift();
          queue.songs.push(lastSong);
          module.exports.play(queue.songs[0], message);
        } else {
          // Recursively play the next song
          queue.songs.shift();
          module.exports.play(queue.songs[0], message);
        }
      })
      .on("error", (err) => {
        console.error(err);
        queue.songs.shift();
        module.exports.play(queue.songs[0], message);
      });
    dispatcher.setVolumeLogarithmic(queue.volume / 100);

    try {
      let sekon = Math.round(song.duration % 60)
      let menit = Math.round((song.duration / 60) % 60)
      let jam = Math.round((song.duration / (60 * 60)) % 24)
      if(sekon < 10) sekon = `0${sekon}`
      if(menit < 10) menit = `0${menit}`
      let nyaga = `${jam}:${menit}:${sekon}`
      if(jam <= 0) nyaga = `${menit}:${sekon}`
      let bjay = new Discord.MessageEmbed()
      .setTitle("▶ Playing:")
      .setDescription(`[${song.title}](${song.url}) untuk **[${nyaga}]** dari [${song.channel}](${song.urlc}). <@${song.tes}>`)
      .setImage(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`)
      .setColor("RANDOM")
      .setThumbnail(song.ava)
      //.setFooter("Messa bot by rnggadosen._");
      //console.log(song.tes)
      var playingMessage = await queue.textChannel.send(bjay);
      await playingMessage.react("⏭");
      await playingMessage.react("⏸");
      await playingMessage.react("▶");
      await playingMessage.react("🔁");
      await playingMessage.react("⏹");
    } catch (error) {
      console.error(error);
    }

    const filter = (reaction, user) => user.id !== message.client.user.id;
    
    collector = playingMessage.createReactionCollector(filter, {
      //time: song.duration > 0 ? song.duration * 1000 : 600000
    });

    collector.on("collect", (reaction, user) => {
      // Stop if there is no queue on the server
      if (!queue) return;
      switch (reaction.emoji.name) {
        case "⏭":
          if(user.id !== aidi) return;
          queue.connection.dispatcher.end();
          queue.textChannel.send(`${user} ⏩ skipped the song`).catch(console.error);
          collector.stop();
          break;

        case "⏸":
          if(user.id !== aidi) return;
          if (!queue.playing) break;
          queue.playing = false;
          queue.connection.dispatcher.pause();
          queue.textChannel.send(`${user} ⏸ paused the music.`).catch(console.error);
          reaction.users.remove(user);
          break;

        case "▶":
          if(user.id !== aidi) return;
          if (queue.playing) break;
          queue.playing = true;
          queue.connection.dispatcher.resume();
          queue.textChannel.send(`${user} ▶ resumed the music!`).catch(console.error);
          reaction.users.remove(user);
          break;

        case "🔁":
          if(user.id !== aidi) return;
          queue.loop = !queue.loop;
          queue.textChannel.send(`Loop is now ${queue.loop ? "**on**" : "**off**"}`).catch(console.error);
          reaction.users.remove(user);
          break;

        case "⏹":
          if(user.id !== aidi) return;
          queue.songs = [];
          queue.textChannel.send(`${user} ⏹ stopped the music!`).catch(console.error);
          try {
            queue.connection.dispatcher.end();
          } catch (error) {
            console.error(error);
            queue.connection.disconnect();
          }
          collector.stop();
          break;

        default:
          break;
      }
    });

    collector.on("end", () => {
      playingMessage.reactions.removeAll();
    });
  }
};