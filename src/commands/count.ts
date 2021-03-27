import * as admin from 'firebase-admin';
import fs = require('fs');
import { Message, MessageEmbed } from 'discord.js'
import * as qdb from 'quick.db';

module.exports = {
    name: 'count',
    async execute(message: Message) {
        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
    
        const currentLang = langcode.guilds[message.guild!.id]

        const lang = JSON.parse(fs.readFileSync(`./lang/${qdb.get(`guilds.${message.guild?.id}`).lang}.json`, 'utf8')).commands.count;

        const reggeltconfig: Reggeltconfig = JSON.parse(fs.readFileSync(`./lang/${currentLang.lang}.json`, 'utf8')).events.reggelt;

        let db = admin.firestore();
        let user = message.mentions.users.first() || message.author;;
        const cityRef = db.collection("dcusers").doc(user.id);
        const doc = await cityRef.get();
        if (!doc.exists) {
            console.log("No such document!");
            message.reply("Error reading document!");
        } else {
            let upmbed = new MessageEmbed()
                .setTitle(`${user.username}`)
                .setColor("#FFCB5C")
                .addField(`${lang.f1}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount}`).replace('%!CHANNEL%!', `${reggeltconfig.channel}`).replace('%!USERNAME%!', user.username), `${lang.f2}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount}`).replace("%!ID%!", message.author.id))
                .setFooter(user.username)
                .setThumbnail(user.avatarURL()!)
                .setTimestamp(message.createdAt);
    
                if(doc.data()?.coins) {
                    upmbed.addField('Coins', `${doc.data()?.coins}`)
                }
                
            message.channel.send(upmbed);
        }
    }
}

interface Reggeltconfig {
    channel: string,
    keyWord: string,
    onCooldown: string,    
    noPrems: string,
    noSend: string,
    notReggelt: string,

}