const { MessageEmbed } = require("discord.js");
const { play } = require("../include/play");
const { YOUTUBE_API_KEY, MAX_PLAYLIST_SIZE } = require("../config.json");
const ytdl = require("ytdl-core");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI('AIzaSyDAUm6e9c7YgGduSQW1WpyxH12s20eO4fc');

module.exports = {
  name: "playlist",
  description: "Play a playlist from youtube",
  async execute(message, args) {
    const { PRUNING } = require("../config.json");
    const { channel } = message.member.voice;

    if (!args.length)
      return message
        .reply(`Usage: ${message.client.prefix}playlist <YouTube Playlist URL | Playlist Name>`)
        .catch(console.error);
    if (!channel) return message.reply("You need to join a voice channel first!").catch(console.error);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))
      return message.reply("Cannot connect to voice channel, missing permissions");
    if (!permissions.has("SPEAK"))
      return message.reply("I cannot speak in this voice channel, make sure I have the proper permissions!");

    const search = args.join(" ");
    const pattern = /^.*(youtu.be\/|list=)([^#\&\?]*).*/gi;
    const url = args[0];
    const urlValid = pattern.test(args[0]);

    const serverQueue = message.client.queue.get(message.guild.id);
    const queueConstruct = {
      textChannel: message.channel,
      channel,
      connection: null,
      songs: [],
      loop: false,
      volume: 100,
      playing: true
    };

    let song = null;
    let playlist = null;
    let videos = [];

    if (urlValid) {
      try {
        playlist = await youtube.getPlaylist(url);
        videos = await playlist.getVideos()
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        const results = await youtube.searchPlaylists(search, 1);
        playlist = results[0];
        videos = await playlist.getVideos(MAX_PLAYLIST_SIZE || 10);
      } catch (error) {
        console.error(error);
      }
    }

    videos.forEach( async (video) => {
      const songInfo = await ytdl.getInfo(`https://www.youtube.com/watch?v=${video.id}`)
      song = {
          title: songInfo.title,
          url: songInfo.video_url,
          duration: songInfo.length_seconds,
          id: songInfo.video_id,
          channel:songInfo.author.name,
          urlc: songInfo.author.channel_url,
          ava: songInfo.author.avatar,
          tes: message.author.id,
          vote: []
      };
      if (serverQueue) {
        serverQueue.songs.push(song);
        if(channel.id !== serverQueue.channel.id) return message.reply("You need join same voice channel with me!")
        if (!PRUNING)
          message.channel
            .send(`✅ **${song.title}** has been added to the queue by ${message.author}`)
            .catch(console.error);
      } else {
        queueConstruct.songs.push(song);
      }
    });

    if (!PRUNING) {
      let playlistEmbed = new MessageEmbed()
        .setTitle(`${playlist.title}`)
        .setDescription(queueConstruct.songs.map((song, index) => `${index + 1}. ${song.title}`))
        .setURL(playlist.url)
        .setColor("YELLOW");

      playlistEmbed.setTimestamp();
      message.channel.send(`${message.author} Started a playlist`, playlistEmbed);
    }

    if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);
    
    if (!serverQueue) {
      try {
        const connection = await channel.join();
        queueConstruct.connection = connection;
        play(queueConstruct.songs[0], message);
      } catch (error) {
        console.error(`Could not join voice channel: ${error}`);
        message.client.queue.delete(message.guild.id);
        await channel.leave();
        return message.channel.send(`Could not join the channel: ${error}`).catch(console.error);
      }
    }
  }
};