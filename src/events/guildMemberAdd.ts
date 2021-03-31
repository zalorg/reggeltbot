import { Client, MessageEmbed } from 'discord.js';
import * as admin from 'firebase-admin';
//import { Storage } from '@google-cloud/storage';
//import * as fs from 'fs';
//import * as axiosb from 'axios'
//const axios = axiosb.default;
//import Path = require('path');
import * as qdb from 'quick.db';

//const storage = new Storage();
import vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

module.exports = {
    name: 'guildMemberAdd',
    async execute(bot: Client) {
        bot.on('guildMemberAdd', async member => {
            const ref = admin.firestore().doc(`dcusers/${member.id}`);
            const doc = await ref.get();

            if(doc.exists) {
                ref.set({
                    pp: member.user.avatarURL(),
                    tag: member.user.tag,
                    username: member.user.username,
                    discriminator: member.user.discriminator,
                }, {
                    merge: true,
                }).catch(err => {throw err});

                ref.collection('guilds').doc(member.guild.id).set({
                    allpermissions: member.permissions.toArray(),
                    color: member.displayColor,
                    colorHEX: member.displayHexColor,
                    icon: member.guild.iconURL(),
                    nick: member.nickname,
                    owner: member.guild.ownerID,
                    permissions: {
                        ADMINISTRATOR: member.hasPermission("ADMINISTRATOR"),
                        MANAGE_CHANNELS: member.hasPermission("MANAGE_CHANNELS"),
                        MANAGE_GUILD: member.hasPermission("MANAGE_GUILD"),
                        MANAGE_MESSAGES: member.hasPermission("MANAGE_MESSAGES"),                
                    },
                    joinedTimestamp: member.joinedTimestamp,
                    joinedAt: member.joinedAt,
                })
            } else {
                ref.collection('guilds').doc(member.guild.id).set({
                    allpermissions: member.permissions.toArray(),
                    color: member.displayColor,
                    colorHEX: member.displayHexColor,
                    icon: member.guild.iconURL(),
                    nick: member.nickname,
                    owner: member.guild.ownerID,
                    permissions: {
                        ADMINISTRATOR: member.hasPermission("ADMINISTRATOR"),
                        MANAGE_CHANNELS: member.hasPermission("MANAGE_CHANNELS"),
                        MANAGE_GUILD: member.hasPermission("MANAGE_GUILD"),
                        MANAGE_MESSAGES: member.hasPermission("MANAGE_MESSAGES"),                
                    },
                    joinedTimestamp: member.joinedTimestamp,
                    joinedAt: member.joinedAt,
                });
            }

            if(member.guild.id === "541446521313296385" || member.guild.id === "738169002085449748") {

                if(!member.user.avatarURL()) return;

                const [result] = await client.safeSearchDetection(`${member.user.avatarURL()}`);
                      
                const detections = result.safeSearchAnnotation;
                const a = detections!.adult;
                if(a === "LIKELY" || a === "POSSIBLE" || a === "UNKNOWN") {
                    const logchannel = bot.channels.cache.get('542000627698630666');
                    if(logchannel?.isText()) {
                        const embed = new MessageEmbed()
                        .setTitle('Image check')
                        .addField('NSFW confidance', `${detections!.nsfwConfidence}`)
                        .addField('Adult', `${detections!.adult} (conf: ${detections?.adultConfidence})`)
                        .addField('Medical', `${detections!.medical} (conf: ${detections?.medicalConfidence})`)
                        .addField('Spoof', `${detections!.spoof} (conf: ${detections?.spoofConfidence})`)
                        .addField('Violance', `${detections?.violence} (conf: ${detections?.violenceConfidence})`)
                        .addField('Racy', `${detections?.racy} (conf: ${detections?.racyConfidence})`)
                        .addField('User', `${member.user.tag} \n <@${member.user.id}>`)
                        .setImage(member.user.avatarURL()!)
                        .setColor(qdb.get('config.embedcolor'))
                        logchannel.send(embed)
                        logchannel.send('<@283284511104696322> <@423925286350880779>')
                    } else {
                        console.log('Safe search:');
                        console.log(`Adult: ${detections!.adult}`);
                        console.log(`Medical: ${detections!.medical}`);
                        console.log(`Spoof: ${detections!.spoof}`);
                        console.log(`Violence: ${detections!.violence}`);
                        console.log(`Racy: ${detections!.racy}`);
                    }
                }


            }
        });
    }
}
