import * as admin from 'firebase-admin';
import fs = require('fs');
import { Client, Message, PartialMessage } from 'discord.js'
import { Langtypes } from '../types'
import * as qdb from 'quick.db';

module.exports =  {
    name: 'msgUpdate',
    execute(bot: Client) {

        bot.on("messageUpdate", async (_, newMsg) => {
            if(newMsg.author!.bot) return;

            //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

            //const guild: Guildconfig = langcode.guilds[newMsg.guild!.id]
            
            const guildlang = qdb.get(`guild.${newMsg.guild?.id}`).lang || "en-US";

            const langfull: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8'));

            const lang = langfull.events.reggelt;
        
            if(newMsg.channel.type === "text" && newMsg.channel.name === lang.channel){
                if(!newMsg.content!.toLowerCase().includes(lang.keyWord)) {
                    await reggeltUpdateEdit(newMsg);
                    if(newMsg.deletable){
                        newMsg.delete();
                        newMsg.author!.send(langfull.events.reggeltUpdate.editSend.replace('%!GUILD%!', `${newMsg.guild!.name}`));
                    }
                }
            }
        });
    }
}

async function reggeltUpdateEdit(message: Message | PartialMessage) {
    let db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const decreaseCount = botDoc.data()!.decreaseCount;
    await db.collection("bots").doc("reggeltbot-count-all").update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
    });
    await db.collection("dcusers").doc(message.author!.id).update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
    });
}