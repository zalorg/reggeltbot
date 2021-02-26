//import * as admin from 'firebase-admin';
import ms = require('ms');
import fs = require('fs');
import { Message, Client, MessageEmbed } from 'discord.js'
import { Guildconfig, Regggeltconfig, Langtypes } from '../types'

module.exports = {
    name: 'help',
    execute(message: Message, prefix: string, bot: Client) {

        //console.log('asd')

        //message.channel.startTyping()

        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
    
        const guildconfig: Guildconfig = langcode.guilds[message.guild!.id];

        const langfull: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildconfig.lang}.json`, 'utf8'));

        const lang = langfull.commands.help;

        const reggeltconfig: Regggeltconfig = JSON.parse(fs.readFileSync(`./lang/${guildconfig.lang}.json`, 'utf8')).events.reggelt;

        const rawbadges: Array<string> = [];

        if(guildconfig.verified) {
            rawbadges.push("<:greenTick:809931766642245663>")
        }

        if(guildconfig.premium) {
            rawbadges.push("<:premium:812821285197447178>")
        }

        if(guildconfig.testing) {
            rawbadges.push("<:test:812821214019190795>")
        }

        const badges = rawbadges.join(' ');

        const alllang = langcode.langs.join(', ')

        const embed = new MessageEmbed()
        .setTitle(lang.title)
        .setDescription(`${badges}`)
        .setColor("#FFCB2B")
        .addField(lang.f1.replace('%!PREFIX%!', prefix), lang.f11.replace('%!DCID%!', message.author.id).replace('%!CHANNEL%!', reggeltconfig.channel))
        .addField(lang.f2.replace('%!PREFIX%!', prefix), lang.f21)
        .addField(lang.setlang1.replace('%!PREFIX%!', prefix), lang.setlang2.replace('%!ALLLANG%!', alllang))
        .addField(lang.f3.replace('%!CHANNEL%!', reggeltconfig.channel), lang.f31.replace('%!CHANNEL%!', reggeltconfig.channel))
        .addField(lang.f4, lang.f41)
        .addField(lang.f5, lang.f51)
        .addField('\u200B', '\u200B');

        if(guildconfig.lang != "en-US") {
            embed
            .addField(`${prefix} setlang [OPTION] [LANG]`, `Options: say, reggelt, full | Lang: Your laungage code.  For example: (${alllang})`)
            .addField('\u200B', '\u200B')
        }

        embed
        .addField(lang.ping, `${bot.ws.ping}ms`)
        .addField(lang.uptime, `${ms(bot.uptime!)}`)
        .setFooter(message.author.username)
        .setThumbnail(bot.user!.avatarURL()!)
        .setTimestamp(Date.now());


        message.channel.send(embed)
        
    }
}

