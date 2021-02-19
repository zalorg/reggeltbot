import * as admin from 'firebase-admin';
import fs = require('fs');
import { Message, MessageEmbed } from 'discord.js'


module.exports = {
    name: 'count',
    async execute(message: Message) {
        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
    
        const currentLang = langcode.guilds[message.guild!.id]

        const lang = JSON.parse(fs.readFileSync(`./lang/${currentLang.lang}.json`, 'utf8')).commands.count;

        const reggeltconfig = JSON.parse(fs.readFileSync(`./lang/${currentLang.lang}.json`, 'utf8')).events.reggelt;

        let db = admin.firestore();
        let dcid = message.author.id;
        const cityRef = db.collection("dcusers").doc(dcid);
        const doc = await cityRef.get();
        if (!doc.exists) {
            console.log("No such document!");
            message.reply("Error reading document!");
        } else {
            let upmbed = new MessageEmbed()
                .setTitle(`${message.author.username}`)
                .setColor("#FFCB5C")
                .addField(`${lang.f1}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount}`), `${lang.f2}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount}`).replace("%!ID%!", message.author.id))
                .setFooter(message.author.username)
                .setThumbnail(message.author.avatarURL()!)
                .setTimestamp(message.createdAt);
            console.log(upmbed);
    
            message.channel.send(upmbed);
        }
    }
}