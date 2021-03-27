import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import * as qdb from 'quick.db';
const db = admin.firestore()

const emoteBuy = qdb.get('config.emoteBuy');
const emoteSell = qdb.get('config.emoteSell');
const coinName = qdb.get('config.coinName');
const prefix = qdb.get('config.prefix')

module.exports = {
    name: 'shop',
    async execute(bot: Discord.Client, message: Discord.Message, args: Array<string>) {

        const coinEmote = bot.emojis.cache.find(e => e.id === qdb.get('config.coinEmote')) ;

        const userref = db.collection('dcusers').doc(message.author.id);
        const emoteref = userref.collection('inventory').doc('emotes');

        console.log(args[2]);

        const emotedoc = await emoteref.get();
        const userdoc = await userref.get()

        if(!args[0]) {
            message.reply('Please specify action!');
            help(message, coinEmote);
            return;
        }

        switch(args[0]) {
            case 'set':
                if(!args[1]) {
                    message.reply('Please specify thing to set!');
                    return;
                }
                if(args[1] === 'reggeltemote') {
                    const emote = args[2];
                    let array: string[] = emotedoc.data()?.have || [];
    
                    if(!array.find(e => e === '☕')) {
                        array.push('☕');
                    }
    
                    if(!array.find(e => e === '🍵')) {
                        array.push('🍵');
                    }
                    
    
                    if(array.find(e => e === emote)) {
                        userref.update({
                            reggeltemote: args[2]
                        }).then(d => {
                            message.reply(`Reggeltemote updated to: ${args[2]}`)
                        }).catch(e => {
                            message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                        })
                    } else {
                        message.reply('You dont own this emote!')
                    }
                }
                break;
            case 'buy':
                if(!args[1]) {
                    message.reply('Please specify thing to add!');
                    help(message, coinEmote);
                    return;
                }
    
                if(args[1] === "emote") {
                    let array: string[] = emotedoc.data()?.have || [];
    
                    if(!args[2]) {
                        message.reply('Please specify emote!');
                    } else if(array.find(e => e === args[2])) {
                        message.reply('You already own this emote!')
                    } else if(array[4]) {
                        message.reply(`You reatched the limit (3 emotes) \n You use these emote: [${array.join(' ')}]`)
                    } else {
                        array.push(args[2]);
                        console.log(array)
                        if(!array.find(e => e === '☕')) {
                            array.push('☕');
                        }

                        if(!array.find(e => e === '🍵')) {
                            array.push('🍵');
                        }
                        
                        console.log(array)

                        if(!userdoc.data()?.coins) {
                            if(!userdoc.data()?.reggeltcount) {
                                message.reply(`You dont have any ${coinName}! Start whising mornigng to people in <#${message.guild?.channels.cache.find(e => e.name === "reggelt")?.id}>`)
                            } else {
                                userref.update({
                                    coins: userdoc.data()?.reggeltcount,
                                }).then(d => {
                                    addemotes();
                                }).catch(e => {
                                    message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                                })
                            }
                        } else {
                            addemotes()
                        }

                        function addemotes() {
                            if(userdoc.data()?.coins >= emoteBuy) {
                                message.channel.send(`Buying emote... (${args[2]})`).then(m => {
                                    userref.update({
                                        coins: admin.firestore.FieldValue.increment(qdb.get('config.coinSell')),
                                    }).then(d1 => {
                                        emoteref.set({
                                            have: array,
                                        }, {merge: true}).then(d => {
                                            m.edit(`Emote added \n Your current emotes: [ ${array.join('   ')}] `);
                                        }).catch(e => {
                                            m.edit('Error! this dumass probably messed something up <@423925286350880779>')
                                        })
                                    }).catch(e => {
                                        m.edit('Error! this dumass probably messed something up <@423925286350880779>')
                                    })
                                })


                            } else {
                                console.log('emote')
                                //console.log(coinEmote)
                                message.reply(`You dont have enough ${coinName} to by an emote \n Your current ${coinName}s: **${userdoc.data()?.coins}** ${coinEmote}`)
                            }


                        }

                    }
                }
                break;
            case 'sell':
                //const coins = userdoc.data()?.coins;

                let emotes: string[] = emotedoc.data()?.have || [];

                const emote = args[2];

                if(!args[1]) {
                    message.reply('Specify the item you wanna sell!');
                    help(message, coinEmote)
                    return;
                } else if(!emotes.find(e => e === args[2])) {
                    message.reply('Try sellig an emote you own!');
                } else if(emote === "☕" || emote === "🍵") {
                    message.reply('You cant sell the default emotes!');
                } else if(emote === userdoc.data()?.reggeltemote) {
                    let embed = new Discord.MessageEmbed()
                    .setTitle(`You must change you current reggeltemote to sell this emote!`)
                    .addField(`Use this command to set the reggeltemote to the default`, '`' + `${prefix}shop set reggeltemote ☕` + '`')
                    .setColor(qdb.get('config.embedcolor'))
                    .setFooter(`${message.author.tag} • Reggeltbot economy`, message.author.avatarURL({dynamic: true}) || 'https://zal.page.link/9cL2').setTimestamp(Date.now())
                    message.channel.send(embed)
                } else {
                    message.channel.send(`Selling emote... ${args[2]} for ${emoteSell} ${coinName}`).then(m => {
                        removeElement(emotes, args[2])
                        userref.update({
                            coins: admin.firestore.FieldValue.increment(10),
                        }).then(d1 => {
                            emoteref.update({
                                have: emotes
                            }).then(d => {
                                m.edit(`Emote sold for ${emoteSell} ${coinEmote}`)
                            }).catch(e => {
                                message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                                console.error(e);
                            })
                        }).catch(e => {
                            message.reply('Error! this dumass probably messed something up <@423925286350880779>')
                            console.log(e)
                        })

                    })

                    removeElement(emotes, args[2]);

                    function removeElement(array: Array<string>, elem: string) {
                        var index = array.indexOf(elem);
                        if (index > -1) {
                            array.splice(index, 1);
                        }
                        console.log(emotes)
                    }

                    
                }
                break;
            default:
                help(message, coinEmote);
        }
    }
}

async function help(message: Discord.Message, coinEmote: Discord.Emoji | undefined) {

    const userref = db.collection('dcusers').doc(message.author.id);
    //const emoteref = userref.collection('inventory').doc('emotes');

    //const emotedoc = await emoteref.get();
    const userdoc = await userref.get()


    let embed = new Discord.MessageEmbed()
    .setTitle('Reggeltbot economy help')
    .setColor(qdb.get('config.embedcolor'))
    .setFooter(`${message.author.tag} • Reggeltbot economy`, `${message.author.avatarURL({dynamic: true})}`)
    .setTimestamp(Date.now())

    .addField(`${prefix}shop buy`, `   **emote** *EMOJI* : You can buy emotes for **${emoteBuy} ${coinName}${coinEmote}** and use them to customise you experimance`)
    .addField('\u200B', '\u200B')
    .addField(`${prefix}sell buy`, `   **emote** *EMOJI* : You can sell unwanted emotes **${emoteSell} ${coinName}${coinEmote}** and free up space in your inventory`)
    .addField('\u200B', '\u200B')
    .addField(`${prefix}shop set`, `
       **reggeltemote** *EMOJI* : You can set the reaction of you reggelt message in <#${message.guild?.channels.cache.find(e => e.name === "reggelt")?.id}> (Your current emote is: ${userdoc.data()?.reggeltemote})`)
    //console.log(embed);
    message.channel.send(embed);
}