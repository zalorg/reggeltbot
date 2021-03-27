import * as axios from 'axios';
import * as Discord from 'discord.js';
import fs = require('fs');
import { Langtypes } from '../types'
import * as admin from 'firebase-admin';
import * as qdb from 'quick.db';

const db = admin.firestore();

module.exports = {
    name: 'leaderboard',
    async execute(message: Discord.Message, args: Array<string>, bot: Discord.Client) {
        //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        //const guildconfig: Guildconfig = langcode.guilds[message.guild!.id]

        const langfull: Langtypes = JSON.parse(fs.readFileSync(`./lang/${qdb.get(`guilds.${message.guild?.id}`).lang}.json`, 'utf8'));

        const lang = langfull.commands.leaderboard

        const errchannel = bot.channels.cache.get('816824859958968350')

        const configref = db.collection('bots').doc('kubeconfig');
        const configdoc: any = (await configref.get()).data()

        if(!args[0]) {
            await axios.default.get(`${process.env.RAPIURL || configdoc.RAPIURL}/leaderboard?m=10`).then(res => {
                const embed = new Discord.MessageEmbed()
                .setTitle(lang.leaderboard)
                .setColor(qdb.get('config.embedcolor'))
                .setURL(`https://reggeltbot.com/leaderboard?m=10`)
                .setThumbnail(res.data[0].pp)
                
                res.data.forEach((lb: any) => {
                    embed.addField(lb.name, lb.reggeltcount)
                });

                message.channel.send(embed)
            }).catch(err => {
                message.reply('API Error')
                console.error(err);
                if(errchannel?.isText()) {
                    errchannel.send(`Error: ${err.message}`)
                }
            })
        } else {
            const number = parseInt(args[0]);
            console.log(number)
            if(!number) {
                message.reply(lang.numberNaN)
            } else if(number < 0) {
                console.log(1)
                message.reply(lang.notOneTwenty)
            } else if(number > 21) {
                console.log(2)

                message.reply(lang.notOneTwenty)
            } else {
                await axios.default.get(`${process.env.RAPIURL}/leaderboard?m=${number}`).then(res => {
                    const embed = new Discord.MessageEmbed()
                    .setTitle(lang.leaderboard)
                    .setColor(qdb.get('config.embedcolor'))
                    .setURL(`https://reggeltbot.com/leaderboard?m=${number}`)
                    .setThumbnail(res.data[0].pp)
                    res.data.forEach((lb: any) => {
                        embed.addField(lb.name, lb.reggeltcount)
                    });
    
                    message.channel.send(embed)
                }).catch(err => {
                    message.reply('API Error')
                    console.error(err);
                    if(errchannel?.isText()) {
                        errchannel.send(`Error: ${err.message}`)
                    }
                })
            }
        }
    }
}