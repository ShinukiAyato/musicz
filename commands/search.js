const { MessageEmbed } = require("discord.js");
const { YOUTUBE_API_KEY } = require("../config.json");
const YouTubeAPI = require("simple-youtube-api");
const youtube = new YouTubeAPI('AIzaSyDAUm6e9c7YgGduSQW1WpyxH12s20eO4fc');

module.exports = {
  name: "search",
  description: "Search and select videos to play",
  async execute(message, args) {
    if (!args.length)
      return message.reply(`Usage: ${message.client.prefix}${module.exports.name} <Video Name>`).catch(console.error);
    if (message.channel.activeCollector)
      return message.reply("A message collector is already active in this channel.");
    if (!message.member.voice.channel)
      return message.reply("You need to join a voice channel first!").catch(console.error);

    const search = args.join(" ");

    let resultsEmbed = new MessageEmbed()
      .setTitle(`**Reply with the song number you want to play**`)
      .setDescription(`Results for: ${search}`)
      .setColor("RANDOM");

    try {
      let videos = []
      const results = await youtube.searchVideos(search, 10);
      results.map((video, index) => { videos.push(`${video.shortURL}`)
                                     resultsEmbed.addField(`${index + 1}. ${video.title}`,`[${video.raw.snippet.channelTitle}](https://youtube.com/channel/${video.raw.snippet.channelId})`)});
      
      var resultsMessage = await message.channel.send(resultsEmbed);

      function filter(msg) {
        const pattern = /(^[1-9][0-9]{0,1}$)/g;
        return pattern.test(msg.content) && parseInt(msg.content.match(pattern)[0]) <= 10;
      }

      message.channel.activeCollector = true;
      const response = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] });
      const choice = videos[parseInt(response.first()) - 1];

      message.channel.activeCollector = false;
      message.client.commands.get("play").execute(message, [choice]);
      resultsMessage.delete().catch(console.error);
    } catch (error) {
      console.error(error);
      message.channel.activeCollector = false;
      resultsMessage.delete().catch(console.error);
    }
  }
};