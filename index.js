const discord = require("discord.js");
const client = new discord.Client({ disableEveryone: true, disabledEvents: ["TYPING_START"] });
const { readdirSync } = require("fs");
const { join } = require("path");
const snek = require("node-superfetch")
const { PREFIX } = require("./config.json");
const db = require('quick.db')

client.login(process.env.TOKEN);
client.commands = new discord.Collection();
client.prefix = PREFIX;
client.queue = new Map();
client.chunk = (array, chunkSize) => {
    const temp = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      temp.push(array.slice(i, i + chunkSize));
    }
    return temp};
client.hastebin = async (text) => {
    const { body } = await snek.post("https://hastebin-ini-cuk.glitch.me/documents")
      .send(text);
    return `https://hastebin-ini-cuk.glitch.me/${body.key}`;
  }

/**
 * Client Events
 */
client.on("ready", () => {
	console.log(`${client.user.username} ready!`);
  client.user.setStatus('dnd')
});
client.on("warn", info => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter(file => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (message.content.startsWith(PREFIX)) {
    const args = message.content
      .slice(PREFIX.length)
      .trim()
      .split(/ +/);
    const command = args.shift().toLowerCase();
    let cmd = command
    if (!client.commands.has(command)) 
      try {
      let commandFile = require(`./commands/${cmd}.js`);
      commandFile.run(client, message, args);
    } catch (err) {
      
    }
    
    try {
      
      client.commands.get(command).execute(message, args);
    } catch (error) {
      
    } 
  }
});