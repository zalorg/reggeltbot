//import * as admin from 'firebase-admin';
import ms = require('ms');
import * as Discord from 'discord.js';
module.exports = {
    name: 'help',
    execute(message: any, prefix: string, bot: any) {
        const embed = new Discord.MessageEmbed()
        .setTitle('Reggeltbot help')
        .setColor("#FFCB2B")
        .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.com/count?i=${message.author.id}) is megnézheted)`)
        .addField(`${prefix}invite`, "Bot meghívása")
        .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
        .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
        .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
        .addField('\u200B', '\u200B')
        .addField("Bot ping", `${bot.ws.ping}ms`)
        .addField("Uptime", `${ms(bot.uptime)}`)
        .setFooter(message.author.username)
        .setThumbnail(bot.user!.avatarURL()!)
        .setTimestamp(Date.now());

        message.channel.send(embed);
    }
}