import { Client, GuildMember } from 'discord.js';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as axiosb from 'axios'
const axios = axiosb.default;
import Path = require('path');

const storage = new Storage();
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
                });
            }

            if(member.guild.id === "541446521313296385" || member.guild.id === "541446521313296385") {

                const bucket = storage.bucket('zal1000.net');

                
                downloadImage(member).then(() => {
                    uploadFile(member.id).then(async () => {
                        const [result] = await client.safeSearchDetection(`gs://zal1000.net/waik/dcphotos/${member.id}.webp`);
                      
                        const detections = result.safeSearchAnnotation;
                        console.log('Safe search:');
                        console.log(`Adult: ${detections!.adult}`);
                        console.log(`Medical: ${detections!.medical}`);
                        console.log(`Spoof: ${detections!.spoof}`);
                        console.log(`Violence: ${detections!.violence}`);
                        console.log(`Racy: ${detections!.racy}`);
                        
                    }).catch(console.error);

                    bucket.upload(`./cache/${member.id}.webp`).then(() => {            

                          
                    })
                })

            }
        });
    }
}

async function downloadImage (member: GuildMember) {  
    const url = `https://cdn.discordapp.com/avatars/${member.id}/${member.user.avatar}.webp`
    const path = Path.resolve(__dirname, 'cache', `${member.user.avatar}.webp`)
    const writer = fs.createWriteStream(path)
  
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })
  
    response.data.pipe(writer);
  
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  }


  async function uploadFile(id: string) {
    await storage.bucket('zal1000.net').upload(`./cache/${id}.webp`, {
      // By setting the option `destination`, you can change the name of the
      // object you are uploading to a bucket.
      destination: `/waik/dcphotos/${id}.webp`,
      metadata: {
        // Enable long-lived HTTP caching headers
        // Use only if the contents of the file will never change
        // (If the contents will change, use cacheControl: 'no-cache')
        cacheControl: 'public, max-age=31536000',
      },
    });
  
    console.log(`${id} uploaded.`);
  }
  