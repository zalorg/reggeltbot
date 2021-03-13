import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import { google } from 'googleapis';

const db = admin.firestore();
const yt = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLEAPIKEY
});

//console.log(process.env.GOOGLEAPIKEY)

module.exports = {
    name: 'postwaikyt',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {
        console.log(args)
        if(message.guild && message.guild.id === "541446521313296385") {
            if(message.guild?.member(message.author.id)?.hasPermission('MANAGE_MESSAGES')) {
                const query = db.collection('waikyt').where('Url', '==', args[0]);
                const queryres = await query.get();
                console.log(queryres);
                if(queryres.empty) {
                    postvid(bot, message, args, "542003224090116096");
                } else {
                    message.reply('This video is already sent to the channel!')
                }
            }
            else {
                message.reply('Nope :)')
            }
        } else if(message.guild && message.guild.id === "738169002085449748" && message.guild.member(message.author.id)?.hasPermission('MANAGE_MESSAGES')) {
            if(message.guild?.member(message.author.id)?.hasPermission('MANAGE_MESSAGES')) {
                const query = db.collection('waikyt').where('Url', '==', args[0]);
                const queryres = await query.get();
                if(queryres.empty) {
                    postvid(bot, message, args, '763040615080263700');
                } else {
                    message.reply('This video is already sent to the channel!')
                }
            }
            else {
                message.reply('Nope :)')
            }
        }
    }
}

async function postvid(bot: Discord.Client, message: Discord.Message, args: Array<string>, sendchannel: string) {
    console.log('empty')
    const channel = bot.channels.cache.get(sendchannel);

    const rawurl = args[0];

    const id = rawurl.split('=', 2) || rawurl.split('e/', 2);
    console.log(id)
    yt.videos.list({
        part: ['contentDetails', 'snippet'],
        id: [`${id[1]}`],
    }).then(async r => {
        if(channel?.isText()) {
            const ref = db.doc('waikyt/defaultmessage');
            const doc = await ref.get()
            const msg = `${doc.data()!.msg}`.replace('%!AUTHOR%!', r.data.items![0].snippet?.channelTitle!).replace('%!URL%!', args[0]);
       
            channel.send(msg).then(m => {
                const vdata = r.data.items![0];
                message.reply(`Video posted! (message id: **${m.id}**)`)
                db.collection('waikyt').add({
                    CreatedAt: `${vdata.snippet?.publishedAt}`,
                    Title: `${vdata.snippet?.title}`,
                    Description: `${vdata.snippet?.description}`,
                    Url: `${args[0]}`,
                    AuthorName: `${vdata.snippet?.channelTitle}`,
                    messageid: m.id,
                }).then(d => {
                    message.channel.send('Video record saved')
                }).catch(e => {
                    message.channel.send('Error saveing video record')
                })
                m.crosspost().catch(e => {

                })
            }).catch(e => {
                message.reply(`Error posting video: ${e.message}`)
            })
       
        }
    }).catch(e => {
        console.log('err')
        console.log(e.message)
        message.reply(e.message)
    })
}