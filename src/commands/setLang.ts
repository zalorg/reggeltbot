import fs = require('fs');
import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';

module.exports = {
    name: 'setlang',
    execute(message: any, args: any[]) {
        const langs: any = JSON.parse(fs.readFileSync('./cache/langs.json', 'utf8')).langs;

        if(!args[0]) { 
            message.reply("Please send a language code"); 
        } else if(!args.find((e: any) => e === args[0])) {
            message.reply("Error: cannot find language! Here a list of all language:")
            let embed = new Discord.MessageEmbed()
            .setTitle('All avelible language')
            

            langs.forEach((e: string) => {
                embed.addField("Code", e)
            });
            
            return message.channel.send(embed)
        } else {
            admin.firestore().collection('bots').doc('reggeltbot').collection('langs').doc(message.guild.id).set({
                code: args[0]
            }).then(r => {
                message.reply(`Guild language changed to: ${args[0]}!`)
            }).catch(e => {
                message.reply('Error updateing guild language!')
                throw e;
            })
        }

    }
}