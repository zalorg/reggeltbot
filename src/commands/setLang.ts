import fs = require('fs');
import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import { Message } from 'discord.js'

module.exports = {
    name: 'setlang',
    async execute(message: Message, args: any[]) {
        const langs: any = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8')).langs;

        if(!args[0]) { 
            message.reply("Please send a language code"); 
        } else if(!langs.find((e: any) => e === args[0])) {
            message.reply("Error: cannot find language! Here a list of all language:")
            let embed = new Discord.MessageEmbed()
            .setTitle('All avelible language')
            

            langs.forEach((e: string) => {
                embed.addField("Code", e)
            });
            
            return message.channel.send(embed)
        } else {



            const ref = admin.firestore().collection('bots').doc('reggeltbot').collection('config').doc(message.guild!.id);
            const doc = await ref.get();

            if(message.guild?.member(message.author.id)?.hasPermission('MANAGE_MESSAGES'))

            if(doc.exists) {
                ref.update({
                    lang: args[0],
                }).then(r => {
                    message.reply(`Guild language changed to: ${args[0]}!`)
                }).catch(e => {
                    message.reply('Error updateing guild language!')
                    throw e;
                })
            } else {
                ref.set({
                    lang: args[0],
                    cd: 6,
                    premium: false,
                    disabled: false,
                    testing:false,
                }).then(r => {
                    message.reply(`Guild language changed to: ${args[0]}!`)
                }).catch(e => {
                    message.reply('Error updateing guild language!')
                    throw e;
                })
            }

        }
        return;
    }
}