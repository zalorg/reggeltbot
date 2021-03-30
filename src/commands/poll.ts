import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import * as qdb from 'quick.db';

module.exports = {
    name: 'pollCmd',
    async execute(message: Discord.Message, args: string[], bot: Discord.Client) {

        var clr = () => {
            console.log(1)
        }

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

                collector.on('collect', (msg: Discord.Message) => {

                    let reactions: Discord.Emoji[] = qdb.get(`temp.guildcounter.${message.guild?.id}.reactions`) || [];

                    switch (qdb.get(`temp.guildcounter.${message.guild?.id}.state`)) {
                        case 1:
                            if(msg.content === "stop") {
                                message.channel.send('Poll creation canceled!')
                                qdb.delete(`temp.guildcounter.${message.guild?.id}.state`)
                                clr()
                            }

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

                                    clr();

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
                                    \nCurrent channel: <#${qdb.get(`temp.guildcounter.${message.guild?.id}.channel`).id}>
                                    `)
                                    .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                    .setTimestamp(Date.now())
                                    .setColor(qdb.get('config.embedcolor'))

                                    m.edit(embed).then(m2 => {
                                        if(msg.deletable) {
                                            msg.delete()
                                            m.reactions.removeAll()
                                            qdb.set(`temp.guildcounter.${message.guild?.id}.state`, 2)

                                        }
                                    })
                        
                                }
                            }
                            break;
                        case 2:
                            if(msg.content === "stop") {

                            } else {
                                qdb.set(`temp.guildcounter.${message.guild?.id}.content`, msg.content);

                                let emotes: string[] = [];

                                reactions.forEach(r => {
                                    emotes.push(r.id ? `<:${r.name}:${r.id}>` : r.name)
                                })

                                let embed = new Discord.MessageEmbed()
                                .setTitle('Reggeltbot poll create')
                                .setDescription(`
                                And finaly, confirm!
                                \n React with <:greenTick:809931766642245663> to confirm, or with <:redTick:809931766601220096> to cancel!
                                \n
                                \nMessage: **${qdb.get(`temp.guildcounter.${message.guild?.id}.content`)}**
                                \nEmotes: **${emotes.join('  ')}**
                                \nChannel: <#${qdb.get(`temp.guildcounter.${message.guild?.id}.channel`).id}>
                                `)
                                .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                .setTimestamp(Date.now())
                                .setColor(qdb.get('config.embedcolor'))
                                emotes = [];

                                m.edit(embed).then(m2 => {
                                    if(msg.deletable) {
                                            msg.delete();
                                        }
                                    m.react('809931766642245663').catch(e => console.error)
                                    m.react('809931766601220096').catch(e => console.error)

                                    const coll = m2.createReactionCollector((react, user) => user.id === msg.author.id);

                                    coll.on('collect', (r, u) => {
                                        if(r.emoji.id === "809931766642245663") {


                                            const chnlid = qdb.get(`temp.guildcounter.${message.guild?.id}.channel`).id

                                            const chnl = bot.channels.cache.get(chnlid);

                                            //console.log(chnl)

                                            if(chnl && chnl.isText() && chnl.lastMessage?.guild?.id === message.guild?.id) {
                                                chnl.send(qdb.get(`temp.guildcounter.${message.guild?.id}.content`)).then(mc => {
                                                    let emotes: string[] = [];
                                                    reactions.forEach(r => {
                                                        mc.react(r.id || r.name)
                                                        emotes.push(r.id ? `<:${r.name}:${r.id}>` : r.name)
                                                    })

                                                    m.edit(embed).then(m3 => {
                                                        let embed = new Discord.MessageEmbed()
                                                        .setTitle('Reggeltbot poll create')
                                                        .setDescription(`
                                                        Poll created!
                                                        \n
                                                        \nMessage: **${qdb.get(`temp.guildcounter.${message.guild?.id}.content`)}**
                                                        \nEmotes: **${emotes.join('  ')}**
                                                        \nChannel: <#${qdb.get(`temp.guildcounter.${message.guild?.id}.channel`).id}>
                                                        \nCreator: ${message.author}
                                                        `)
                                                        .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                                        .setTimestamp(Date.now())
                                                        .setColor("#2FBA6A")
                                                        emotes = []
                                                        m.edit(embed).then(me => {
                                                            m.reactions.removeAll().catch(e => console.error);
                                                            coll.stop('poll created');
                                                        })
                                                    })
                                                })
                                            } else {
                                                let embed = new Discord.MessageEmbed()
                                                .setTitle('Reggeltbot poll create')
                                                .setDescription(`
                                                Error creating poll!
                                                \n
                                                \nError: **Channel error!**
                                                `)
                                                .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                                .setTimestamp(Date.now())
                                                .setColor("#CD404E")
                                                emotes = []
                                                m.edit(embed).then(me => {
                                                    coll.stop('channel error')
                                                    m.reactions.removeAll().catch(e => console.error);
                                                })
                                            }


                                        } else if(r.emoji.id === '809931766601220096') {
                                            let embed = new Discord.MessageEmbed()
                                            .setTitle('Reggeltbot poll create')
                                            .setDescription(`
                                            Poll canceled!
                                            `)
                                            .setFooter(`${message.author.tag} • Reggeltbot poll`, message.author.avatarURL({dynamic: true}) || undefined)
                                            .setTimestamp(Date.now())
                                            .setColor("#CD404E")
                                            emotes = []
                                            m.edit(embed).then(me => {
                                                coll.stop('canceled')
                                                m.reactions.removeAll().catch(e => console.error);
                                            })
                                        }
                                    })
                                })
                            }
                            console.log(msg.content)
                            break;
                        default:
                            console.log(qdb.get(`temp.guildcounter.${message.guild?.id}.state`))
                            const chspl = msg.content.split('')
                            if(!chspl.find(e => e === "#")) {
                                message.channel.send('Error! invalid channel!').then(md => {
                                    setTimeout(() => {
                                        if(msg.deletable) {
                                            msg.delete();
                                        }
                                        if(md.deletable) {
                                            md.delete()
                                        }
                                    }, 5000);
                                })
                            } else if(!chspl.find(e => e === ">"))  {
                                message.channel.send('Error! invalid channel!').then(md => {
                                    setTimeout(() => {
                                        if(msg.deletable) {
                                            msg.delete();
                                        }
                                        if(md.deletable) {
                                            md.delete()
                                        }
                                    }, 5000);
                                })
                            } else if(!chspl.find(e => e === "<"))  {
                                message.channel.send('Error! invalid channel!').then(md => {
                                    setTimeout(() => {
                                        if(msg.deletable) {
                                            msg.delete();
                                        }
                                        if(md.deletable) {
                                            md.delete()
                                        }
                                    }, 5000);
                                })
                            } else {
                                //console.log(chspl)
                                const channelid = msg.content.split('#', 2)[1].split('>', 1)[0]
                                const chnl = bot.channels.cache.get(channelid);
    
    
    
                                if(!chnl)  {
                                    message.channel.send('Error! invalid channel!').then(md => {
                                        setTimeout(() => {
                                            if(msg.deletable) {
                                                msg.delete();
                                            }
                                            if(md.deletable) {
                                                md.delete()
                                            }
                                        }, 5000);
                                    })
                                } else {

                                    qdb.set(`temp.guildcounter.${message.guild?.id}.channel`, chnl);
    
                                    let embed2 = new Discord.MessageEmbed()
                                    .setTitle('Reggeltbot poll create')
                                    .setDescription(`Okay, so i will start the poll in ${chnl}, now please add the option, by reacting to this message 
                                    \n**If you see unrendered emoji like this:** *:stonks:* ** please remove it!** 
                                    \n \n**YOU CAN ONLY USE DEFAULT EMOTES AND EMOTES FROM THIS SERVER!**`)
                                    .setFooter(`${message.author.tag} • Reggeltbot poll`, `${message.author.avatarURL({dynamic: true})}`).setTimestamp(Date.now())
                                    .setColor(qdb.get('config.embedcolor'))
                                
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

                                            collector.on('end', (collected) => {
                                                console.log('end')
                                            })

                                            clr = () => {
                                                collector.stop('manual stop')
                                            }
        
                                            
                                        })

                                    })
                                }
                            }


                    }


                })

            })


        }
    }
    
}
