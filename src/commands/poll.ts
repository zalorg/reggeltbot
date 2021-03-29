import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import * as qdb from 'quick.db';

module.exports = {
    name: 'pollCmd',
    async execute(message: Discord.Message, args: string[], bot: Discord.Client) {
        const channel = message.channel;

        qdb.delete(`temp.guildcounter.${message.guild?.id}`)
        qdb.set(`temp.guildcounter.${message.guild?.id}.reactions`, [])

        if(channel.isText()) {
            const embed = new Discord.MessageEmbed()
            .setTitle('Reggeltbot poll create')
            .setDescription('First, please tag the channel')
            .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
            .setTimestamp(Date.now())
            .setColor(qdb.get('config.embedcolor'))

            message.channel.send(embed).then(m => {
                const collector = channel.createMessageCollector(m => m.author.id === message.author.id, {
                    time: 60000
                });

                var guildcounter = qdb.get(`temp.guildcounter.${message.guild?.id}.state`);

                collector.on('collect', (msg: Discord.Message) => {
                    if(!guildcounter) {
                    }

                    let reactions: Discord.Emoji[] = qdb.get(`temp.guildcounter.${message.guild?.id}.reactions`) || [];

                    switch (qdb.get(`temp.guildcounter.${message.guild?.id}.state`)) {
                        case 1:
                            if(msg.content === "stop") {
                                message.channel.send('Poll creation canceled!')
                                qdb.delete(`temp.guildcounter.${message.guild?.id}.state`)
                            }

                            console.log(msg.content);

                            if(msg.content === "next") {
                                console.log(reactions.length)
                                if(reactions.length === 0) {
                                    message.channel.send('Error! No reactions added!').then(m2 => {
                                        setTimeout(() => {
                                            if(m2.deletable) {
                                                m2.delete();
                                            }
                                            if(msg.deletable) {
                                                msg.delete()
                                            }
                                        }, 5000);
                                    })
                                } else {

                                    let emotes: string[] = [];

                                    reactions.forEach(r => {
                                        emotes.push(r.id ? `<:${r.name}:${r.id}>` : r.name)
                                    })
                                    console.log(emotes)
                                    let embed = new Discord.MessageEmbed()
                                    .setTitle('Reggeltbot poll create')
                                    .setDescription(`
                                    Okay, now please enter the message that I shoud send!
                                    \n
                                    \nCurrent emotes: **${emotes.join('  ')}**
                                    `)
                                    .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                    .setTimestamp(Date.now())
                                    .setColor(qdb.get('config.embedcolor'))

                                    m.edit(embed).then(m2 => {
                                        if(msg.deletable) {
                                            msg.delete()
                                            m.reactions.removeAll()
                                        }
                                    })
                        
                                }
                            }
                            break;
                    
                        default:
                            console.log(qdb.get(`temp.guildcounter.${message.guild?.id}.state`))
                            const chspl = msg.content.split('')
                            if(!chspl.find(e => e === "#")) {
                                message.channel.send('Error! invalid channel!')
                                return;
                            }
                            if(!chspl.find(e => e === ">"))  {
                                message.channel.send('Error! invalid channel!')
                                return;
                            }
                            if(!chspl.find(e => e === "<"))  {
                                message.channel.send('Error! invalid channel!')
                                return;
                            }
                            console.log(chspl)
                            const channelid = msg.content.split('#', 2)[1].split('>', 1)[0]
                            const chnl = bot.channels.cache.get(channelid);

                            let embed2 = new Discord.MessageEmbed()
                            .setTitle('Reggeltbot poll create')
                            .setDescription(`Okay, so i will start the poll in ${chnl}, now please add the option, by reacting to this message 
                            \n**If you see unrendered emoji like this:** *:stonks:* ** please remove it!** 
                            \n \n**YOU CAN ONLY USE DEFAULT EMOTES AND EMOTES FROM THIS SERVER!**`)
                            .setFooter(`${message.author.tag} • Reggeltbot poll`, `${message.author.avatarURL({dynamic: true})}`).setTimestamp(Date.now())
                            .setColor(qdb.get('config.embedcolor'))

                            if(!chnl)  {
                                message.channel.send('Error! invalid channel!')
                                return;
                            }

                            
                            m.edit(embed2).then(m2 => {
                                if(msg.deletable) {
                                    msg.delete()
                                    qdb.set(`temp.guildcounter.${message.guild?.id}.state`, 1)

                                }

                                const collector = m2.createReactionCollector((r, u) => u);


                                collector.on('collect', (react, user) => {
                                    if(user.id === msg.author.id) {
                                        console.log('by author')
                                    }
                                    //console.log(react.emoji)
                                    console.log(react.emoji.id || react.emoji.name)
                                    reactions.push(react.emoji)
                                    qdb.set(`temp.guildcounter.${message.guild?.id}.reactions`, reactions)

                                    let embed2 = new Discord.MessageEmbed()
                                    .setTitle('Reggeltbot poll create')
                                    .setDescription(`Okay, so i will start the poll in ${chnl}, now please add the option, by reacting to this message 
                                    \nCurrent emotes: **${reactions.join('  ')}**
                                    \n**If you see unrendered emoji like this:** *:stonks:* ** please remove it!** 
                                    \n \n**YOU CAN ONLY USE DEFAULT EMOTES AND EMOTES FROM THIS SERVER!**`)
                                    .setFooter(`${message.author.tag} • Reggeltbot poll`, `${message.author.avatarURL({dynamic: true})}`).setTimestamp(Date.now())
                                    .setColor(qdb.get('config.embedcolor'))

                                    m.edit(embed2)

                                    
                                })
                            })

                    }


                })

            })


        }
    }
    
}