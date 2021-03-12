import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import { google } from 'googleapis';

const db = admin.firestore();
const yt = google.youtube({
    version: 'v3',
    auth: process.env.GOOGLE_APPLICATION_CREDENTIALS
});


module.exports = {
    name: 'postwaikyt',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {
        console.log(args)
        if(message.guild && message.guild.id === "541446521313296385") {
            const query = db.collection('waikyt').where('Url', '==', args[0]);
            const queryres = await query.get();
            if(queryres.empty) {
                console.log('empty')
                const channel = bot.channels.cache.get('542003224090116096');

                const rawurl = args[0];

                const id = rawurl.split('=', 2);
                console.log(id)
                yt.videos.list({
                    part: ['contentDetails', 'snippet'],
                    id: [`${id[1]}`],
                }).then(async r => {
                    if(channel?.isText()) {
                        const ref = db.doc('waikyt/defaultmessage');
                        const doc = await ref.get()
                        const msg = `${doc.data()!.msg}`.replace('%!AUTHOR%!', r.data.items![0].snippet?.channelTitle!).replace('%!URL%!', args[0]);
                        if(message.guild?.member(message.author.id)?.hasPermission('MANAGE_MESSAGES')) {
                            channel.send(msg).then(m => {
                                const vdata = r.data.items![0];
                                message.reply(`Video posted! (message id: **${m.id}**)`)
                                db.collection('waikyt').add({
                                    CreatedAt: `${vdata.snippet?.publishedAt}`,
                                    Title: `${vdata.snippet?.title}`,
                                    Description: `${vdata.snippet?.description}`,
                                    Url: `${args[0]}`,
                                    AuthorName: `${vdata.snippet?.channelTitle}`
                                })
                            }).catch(e => {
                                message.reply(`Error posting video: ${e.message}`)
                            })
                        } else {
                            message.reply('Nope :)')
                        }
                    }
                }).catch(e => {
                    console.log('err')
                    console.log(e.message)
                    message.reply(e.message)
                })
            } else {
                message.reply('This video is already sent to the channel!')
            }
        }
    }
}