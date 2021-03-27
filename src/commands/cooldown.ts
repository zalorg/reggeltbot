import * as admin from 'firebase-admin';
import { Client, Message } from 'discord.js'
import { Langtypes} from '../types'
import * as fs from 'fs';
import * as qdb from 'quick.db';
// .replace("%!CD%!", new Date(cd * 1000).toLocaleTimeString())
module.exports = {
    name: 'cooldown',
    async execute(bot: Client, message: Message, args: Array<string>) {
        //console.log(args)
        if(args) {
            
            //const guildconfig: Guildconfig = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8')).guilds[message.guild!.id];

            const guildlang = qdb.get(`guilds.${message.guild?.id}`).lang || "en-US"
    
            const lang: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8'));
            
            const db = admin.firestore();

            const defconfigref = db.collection('bots').doc('reggeltbot').collection('config').doc('default');
            const defconfigDoc = await defconfigref.get();

            const configref = db.collection('bots').doc('reggeltbot').collection('config').doc(message.guild!.id);
            const configDoc = await configref.get();

            const rawcd = configDoc.exists ? configDoc.data()!.cd : defconfigDoc.data()!.cd;

            const cdval = rawcd * 3600;

            const now = Math.floor(Date.now() / 1000);
            const cd = now + cdval;
            console.log(cd)

            const userref = db.collection('dcusers').doc(message.author.id).collection('cooldowns').doc(message.guild!.id);
            const userdoc = await userref.get();

            const nextTime = userdoc.data()!.reggeltcount;

            if(nextTime > now) {
                let cdmsg = lang.commands.cooldown.on.replace("%!TIME%!", hhmmss(nextTime - now, lang));    
                message.reply(cdmsg);
            } else {
                message.reply(lang.commands.cooldown.off);
            }



            //let embed = new MessageEmbed()

            //message.member?.permissions.toArray()
            //message.channel.send(embed)
        }

    }
}

function hhmmss(time: number, lang: Langtypes) : string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time % 3600 / 60);
    const seconds = time % 60;

    let str = `${hours} ${(hours == 1 ? lang.time.hour : lang.time.hours)} ` + 
              `${minutes} ${(minutes == 1 ? lang.time.minute : lang.time.minutes)} ` + 
              `${seconds} ${(seconds == 1 ? lang.time.second : lang.time.seconds)}`;

    return str;
}