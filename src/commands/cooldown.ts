import * as admin from 'firebase-admin';
import { Client, Message, MessageEmbed} from 'discord.js'
import { Guildconfig, Langtypes} from '../types'
import * as fs from 'fs';
// .replace("%!CD%!", new Date(cd * 1000).toLocaleTimeString())
module.exports = {
    name: 'cooldown',
    async execute(bot: Client, message: Message, args: Array<string>) {
        if(!args) {
            
            const guildconfig: Guildconfig = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8')).guilds[message.guild!.id];

            const guildlang = guildconfig.lang || "en-US"
    
            const lang: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8'));
            
            const db = admin.firestore();

            //const ref = db.collection('dcusers').doc(message.author.id);
            //const doc = await ref.get();

            //const cdref = db.collection('dcusers').doc(message.author.id).collection('cooldowns').doc(message.guild!.id);
            //const cddoc = await cdref.get();

            const defconfigref = db.collection('bots').doc('reggeltbot').collection('config').doc('default');
            const defconfigDoc = await defconfigref.get();

            const configref = db.collection('bots').doc('reggeltbot').collection('config').doc(message.guild!.id);
            const configDoc = await configref.get();

            const rawcd = configDoc.exists ? configDoc.data()!.cd : defconfigDoc.data()!.cd;

            const cdval = rawcd * 3600;

            const cd = Math.floor(Date.now() / 1000) + cdval;


            let cdmsg = lang.events.reggelt.onCooldown.replace("%!CD%!", new Date(cd * 1000).toLocaleTimeString());
            
            message.reply(cdmsg);

            let embed = new MessageEmbed()

            message.member?.permissions.toArray()
            message.channel.send(embed)
        }

    }
}