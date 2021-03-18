import * as Discord from 'discord.js';

const YT_PING_ROLE = "821157912566038569";

module.exports = {
    name: 'twitchsub',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {
        console.log(args)
        if(message.guild && message.guild.id === "541446521313296385") {
            
            if (message.guild.member(message.author)?.roles.cache.has(YT_PING_ROLE)) {
                await message.guild.member(message.author)?.roles.remove(YT_PING_ROLE);
                await message.channel.send("You unsubscribed the Twitch-ping role")
            } else {
                await message.guild.member(message.author)?.roles.add(YT_PING_ROLE);
                await message.channel.send("You subscribed the Twitch-ping role");
            }

        } 
    }
}