const { MessageEmbed } = require("discord.js");
const snek = require("node-superfetch");
const { load } = require("cheerio");
const api = require("genius-api");
const genius = new api('g8LU4nz4MLccZqPLXJh5U4SZd08SUPqzseAbZsli0DKxgYr0yKo2HiBoEBza6D4R');

exports.run = async (client, msg, args) => {
  
  try {
    //let serverQueue = client.queue.get(msg.guild.id)
    //let c = ``
    let a = args.slice(0).join(" ")
    let c; // = serverQueue.songs[0].title//.toLowerCase().replace(/official music video/g, "")
    c = a
    if (!c)
    return msg.channel.send({
      embed: {
        color: 0xf91d1d,
        description: "Request Cancelled. No query provided."
      }
    });
    const response = await genius.search(c);
    const { text } = await snek.get(response.hits[0].result.url);

    const chunked = client.chunk(
      load(text)(".lyrics").text(),
      2040
    );
    for (let i = 0; i < chunked.length; i++) {
      const embed = new MessageEmbed()
        .setColor("RANDOM")
        .setTitle(response.hits[0].result.full_title)
        .setURL(response.hits[0].result.url)
        .setThumbnail(response.hits[0].result.header_image_thumbnail_url)
        .setDescription(chunked[i]);
      if (i === chunked.length - 1)
        embed
          .setFooter(
            `Request by: ${msg.author.tag}`,
            msg.author.displayAvatarURL({ size: 512 })
          )
          .setTimestamp();
      await msg.channel.send(embed);
    }
  } catch (e) {
    if (e.message === "Cannot read property 'result' of undefined")
      return msg.channel.send("No results found, Try with another query.");
  }
};