import * as admin from 'firebase-admin';
import fs = require('fs');
import { Message, MessageEmbed } from 'discord.js'
import * as qdb from 'quick.db';

const coinName = qdb.get('config.coinName');

module.exports = {
    name: 'count',
    async execute(message: Message) {
        //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        const currentLang = qdb.get(`guild.${message.guild?.id}`).lang


        const lang = JSON.parse(fs.readFileSync(`./lang/${currentLang}.json`, 'utf8')).commands.count;

        const reggeltconfig: Reggeltconfig = JSON.parse(fs.readFileSync(`./lang/${currentLang}.json`, 'utf8')).events.reggelt;

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
                .setColor(qdb.get('config.embedcolor'))
                .addField(`${lang.f1}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount1 || 0}`).replace('%!CHANNEL%!', `${reggeltconfig.channel}`).replace('%!USERNAME%!', user.username), `${lang.f2}`.replace("%!KEYWORD%!", reggeltconfig.keyWord).replace("%!COUNT%!", `${doc.data()!.reggeltcount1 || 0}`).replace("%!ID%!", message.author.id))
                .setThumbnail(user.avatarURL()!)
                .setFooter(`${message.author.tag} • Reggeltbot count`, message.author.avatarURL({dynamic: true}) || undefined ).setTimestamp(Date.now());
    
                if(doc.data()?.coins) {
                    upmbed.addField(`${coinName}s`, `${doc.data()?.coins}`)
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