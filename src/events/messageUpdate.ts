import * as admin from 'firebase-admin';
import fs = require('fs');
import { Client, Message, PartialMessage } from 'discord.js'

module.exports =  {
    name: 'msgUpdate',
    execute(bot: Client) {


        bot.on("messageUpdate", async (_, newMsg) => {
            if(newMsg.author!.bot) return;

        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        const currentLang = langcode.guilds[newMsg.guild!.id]
            
            const lang = JSON.parse(fs.readFileSync(`./lang/${currentLang.code}.json`, 'utf8')).events.reggelt;
        
            if(newMsg.channel.type === "text" && newMsg.channel.name === lang.events.reggelt.channel){
                if(!newMsg.content!.toLowerCase().includes(lang.events.reggelt.keyWord)) {
                    await reggeltUpdateEdit(newMsg);
                    if(newMsg.deletable){
                        newMsg.delete();
                        newMsg.author!.send(lang.editSend.replace('%!GUILD%!', `${newMsg.guild!.name}`));
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