//import * as admin from 'firebase-admin';
import ms = require('ms');
import * as Discord from 'discord.js';
import fs = require('fs');
import { Message, Client } from 'discord.js'
import { Guildconfig, Regggeltconfig, Langtypes } from '../types'

module.exports = {
    name: 'help',
    execute(message: Message, prefix: string, bot: Client) {

        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
    
        const guildconfig: Guildconfig = langcode.guilds[message.guild!.id];

        const langfull: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildconfig.lang}.json`, 'utf8'));

        const lang = langfull.commands.help;

        const reggeltconfig: Regggeltconfig = JSON.parse(fs.readFileSync(`./lang/${guildconfig.lang}.json`, 'utf8')).events.reggelt;

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
        .addField(lang.uptime, `${ms(bot.uptime!)}`)
        .setFooter(message.author.username)
        .setThumbnail(bot.user!.avatarURL()!)
        .setTimestamp(Date.now());

        message.channel.send(embed)

        
    }
}

