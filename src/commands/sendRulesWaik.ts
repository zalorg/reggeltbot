import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';

const db = admin.firestore()
module.exports = {
    name: 'sendRulesWaik',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {
        const channel = bot.channels.cache.get('824119912166981705');
        
        if(!message.member?.roles.cache.has('541448684299091978')) {
            message.reply('Nope :)');
            return;
        }
        
        if(channel?.isText()) {
            //channel.send('asd')

            const query = db.collection('waik').doc('discord').collection('rules').where('latest', '==', true).limit(1);

            const queryres = await query.get()

            if(queryres.empty) {
                message.reply(`Error fetching from the database, this dumass probably messed something up <@423925286350880779>`);
                return;
            }

            const querydoc = queryres.docs[0];

            const msg = await channel.messages.fetch(querydoc.data()!.id);

            if(msg.editable) {
                //console.log(args)
                const argsj = args.join(' ');
                console.log(argsj)
                const argsa = argsj.split('\n');
                //console.log(argsa);

                let array: string[][] = [];

                let a2: string[] = [];

                //let map = {};

                let ec = 0;

                argsa.forEach(e => {
                    if(e != "") {
                        if(ec === 0) {
                            a2.push(e);
                        }
                    }

                    if(e === "") {
                        array.push(a2);
                        console.log(a2)
                        a2 = []
                    }
                    
                })

                console.log(array)

                const embed = new Discord.MessageEmbed()
                .setTitle('Szabályzat')
                .setFooter(`${message.author.tag} | Waik moderátor csapat`)
                .setColor('#FFCA5C')
                .setTimestamp(Date.now())

                array.forEach(e => {
                    embed.addField(e[0], e[1]);
                });


                msg.edit(embed).then(m => {
                    db.collection('waik').doc('discord').collection('rules').add({
                        author: message.author.id,
                        content: argsj,
                        contentArray: args,
                        id: msg.id,
                        latest: true,
                    }).then(d => {
                        const ref = db.doc(`waik/discord/rules/${querydoc.id}`);
                        ref.update({
                            latest: false,
                        }).then(d2 => {
                            message.reply(`Rules updated (new: ${d.id}, old: ${querydoc.id})`);
                        }).catch(e => {

                        })
                    }).catch(e => {
                        message.reply(`Error updateing rules (db, ${e.message})`);
                    })
                }).catch(e => {
                    message.reply(`Error updateing rules (dc, ${e.message})`);
                })
            }


        }

        
    }
}