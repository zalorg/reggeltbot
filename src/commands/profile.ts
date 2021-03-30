import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import * as qdb from 'quick.db';

const db = admin.firestore();

module.exports = {
    name: 'profile',
    async execute(bot: Discord.Client, args: string[], message: Discord.Message) {
        console.log('p2')

        if(message.mentions.members?.first()) {
            const member = message.mentions.members?.first()
            if(!member) return message.reply('Error! User not found!').then(m => {
                setTimeout(() => {
                    m.delete().catch(e => console.warn)
                }, 5000);
            })
            return send(bot, args, message, member)
        } else {
            const member = message.member;
            if(!member) return message.reply('Error! User not found!').then(m => {
                setTimeout(() => {
                    m.delete().catch(e => console.warn)
                }, 5000);
            })

            return send(bot, args, message, member)

        }
    }
}

async function send(bot: Discord.Client, args: string[], message: Discord.Message, member: Discord.GuildMember) {
    const ref = db.collection('dcusers').doc(member?.user.id);
    const invenref = ref.collection('inventory');
    const emotedoc = await invenref.doc('emotes').get()
    const doc = await ref.get();

    const userquery = db.collection("users").where("dcid", "==", member?.user.id)
    const userdocs = await userquery.get()
    const userdoc = userdocs.docs[0]

    let avatar = member.user.avatarURL({dynamic: true}) || bot.user?.avatarURL({dynamic: true})!

    if(userdoc.exists) {
        const user = await admin.auth().getUser(userdoc.id);
        const a = user.photoURL
        if(a) {
            avatar = a;
        }
    }
    

    let embed = new Discord.MessageEmbed()
    .setThumbnail(avatar)
    .setTitle(`${member.user.tag}'s profile`)
    .addField(`Reggeltcount`, `${doc.data()?.reggeltcount || '0'}`)
    .addField(`Coins`, `${doc.data()?.coins || '0'} <:${qdb.get('config.coinName')}:${qdb.get('config.coinEmote')}>`)
    .setColor(qdb.get('config.embedcolor'))
    .setFooter(`${message.author.tag} • Reggeltbot profile (Beta)`, message.author.avatarURL({dynamic: true}) || undefined ).setTimestamp(Date.now())

    if(emotedoc.exists) {
        let e: string[] =  emotedoc.data()?.have;

        console.log(e.join('  '))

        embed.addField(`Emotes`, `${e.join('  ')}`)

        e = [];
    }


    message.channel.send(embed);
}