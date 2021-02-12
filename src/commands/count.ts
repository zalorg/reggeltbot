import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';

module.exports = {
    name: 'count',
    async execute(message: any) {
        let db = admin.firestore();
        let dcid = message.author.id;
        const cityRef = db.collection("dcusers").doc(dcid);
        const doc = await cityRef.get();
        if (!doc.exists) {
            console.log("No such document!");
            message.reply("Error reading document!");
        } else {
            let upmbed = new Discord.MessageEmbed()
                .setTitle(`${message.author.username}`)
                .setColor("#FFCB5C")
                .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data()!.reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.com/count?i=${dcid})`)
                .setFooter(message.author.username)
                .setThumbnail(message.author.avatarURL())
                .setTimestamp(message.createdAt);
            console.log(upmbed);
    
            message.channel.send(upmbed);
        }
    }
}