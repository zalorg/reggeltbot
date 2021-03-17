import { GuildMember, Message } from 'discord.js';
//import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as axiosb from 'axios'
const axios = axiosb.default;
import Path = require('path');

const storage = new Storage();
import vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

module.exports = {
    name: 'nsfwimagetest',
    async execute(message: Message, args: Array<string>) {
        const bucket = storage.bucket('zal1000.net');

        const member = message.member!;

        downloadImage(member, args).then(() => {
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
}

async function downloadImage(member: GuildMember, args: Array<string>) {
    const url = `${args[0]}`
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
  