import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
import * as qdb from 'quick.db';

module.exports = {
    name: 'pollCmd',
    async execute(message: Discord.Message, args: string[], bot: Discord.Client) {
        const channel = message.channel;

        if(channel.isText()) {
            const embed = new Discord.MessageEmbed()
            .setTitle('Reggeltbot poll create')
            .setDescription('First, please tag the channel')
            .setFooter(`${message.author.tag} • Reggeltbot poll`, `${message.author.avatarURL({dynamic: true})}`)
            .setTimestamp(Date.now())
            .setColor(qdb.get('config.embedcolor'))

            message.channel.send(embed).then(m => {
                const collector = channel.createMessageCollector(m => m.author.id === message.author.id, {
                    time: 60000
                });

                const guildcounter = qdb.get(`temp.guildcounter.${message.guild?.id}`);

                collector.on('collect', (msg: Discord.Message) => {
                    if(!guildcounter) {
                    }

                    switch (guildcounter) {
                        case 1:
                            
                            break;
                    
                        default:
                            const channelid = msg.content.split('#', 2)[1].split('>', 1)[0]
                            const chnl = bot.channels.cache.get(channelid);

                            let embed2 = new Discord.MessageEmbed()
                            .setTitle('Reggeltbot poll create')
                            .setDescription(`Okay, so i will start the poll in ${chnl}, now please add the option, by reacting to this message \n \n**YOU CAN ONLY USE DEFAULT EMOTES AND EMOTES FROM THIS SERVER!**`)
                            .setFooter(`${message.author.tag} • Reggeltbot poll`, `${message.author.avatarURL({dynamic: true})}`).setTimestamp(Date.now())
                            .setColor(qdb.get('config.embedcolor'))

                            
                            m.edit(embed2).then(m2 => {
                                if(msg.deletable) {
                                    msg.delete()
                                }

                                const collector = m2.createReactionCollector((r, u) => u.id === msg.author);

                                collector.on('collect', (react, user) => {
                                    
                                })
                            })
                            qdb.set(`temp.guildcounter.${message.guild?.id}`, 1)

                    }

                    qdb.delete(`temp.guildcounter.${message.guild?.id}`)

                })

            })


        }
    }
    
}