//import * as admin from 'firebase-admin';
import ms = require('ms');
import * as Discord from 'discord.js';
import fs = require('fs');
module.exports = {
    name: 'help',
    execute(message: any, prefix: string, bot: any) {

        const langcode = JSON.parse(fs.readFileSync('./cache/langs.json', 'utf8'));

        const currentLang = langcode.guilds.find((element: any) => element.id === message.guild.id)

        const lang = JSON.parse(fs.readFileSync(`./lang/${currentLang.code}.json`, 'utf8')).commands.help;

        const reggeltconfig = JSON.parse(fs.readFileSync(`./lang/${currentLang.code}.json`, 'utf8')).events.reggelt;

        console.log(reggeltconfig)

        const embed = new Discord.MessageEmbed()
        .setTitle(lang.title)
        .setColor("#FFCB2B")
        .addField(lang.f1.replace('%!PREFIX%!', prefix), lang.f11.replace('%!DCID%!', message.author.id).replace('%!CHANNEL%!', reggeltconfig.channel))
        .addField(lang.f2.replace('%!PREFIX%!', prefix), lang.f21)
        .addField(lang.f3.replace('%!CHANNEL%!', reggeltconfig.channel), lang.f31.replace('%!CHANNEL%!', reggeltconfig.channel))
        .addField(lang.f4, lang.f41)
        .addField(lang.f5, lang.f51)
        .addField('\u200B', '\u200B')
        .addField(lang.ping, `${bot.ws.ping}ms`)
        .addField(lang.uptime, `${ms(bot.uptime)}`)
        .setFooter(message.author.username)
        .setThumbnail(bot.user!.avatarURL()!)
        .setTimestamp(Date.now());

        message.channel.send(embed)

        
    }
}