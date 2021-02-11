//import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
module.exports = {
    name: 'help',
    execute(message: any) {
        const embed = new Discord.MessageEmbed()
        .setThumbnail('Help')
        .setColor('#FFCB5C')
        .setTimestamp(Date.now())

        message.channel.send(embed);
    }
}