import { Message, MessageEmbed } from 'discord.js';
//import * as admin from 'firebase-admin';
//import { Storage } from '@google-cloud/storage';
//import * as fs from 'fs';
//import * as axiosb from 'axios'
//const axios = axiosb.default;
//import Path = require('path');

//const storage = new Storage();
import vision = require('@google-cloud/vision');
const client = new vision.ImageAnnotatorClient();

module.exports = {
    name: 'nsfwimagetest',
    async execute(message: Message, args: Array<string>) {
      console.log('asd');
        //const bucket = storage.bucket('zal1000.net');

        //const member = message.member!;

        const [result] = await client.safeSearchDetection(`${args[0]}`);

        const detections = result.safeSearchAnnotation;
        const embed = new MessageEmbed()
        .setTitle('Image check')
        .addField('NSFW confidance', `${detections!.nsfwConfidence}`)
        .addField('Adult', `${detections!.adult} (conf: ${detections?.adultConfidence})`)
        .addField('Medical', `${detections!.medical} (conf: ${detections?.medicalConfidence})`)
        .addField('Spoof', `${detections!.spoof} (conf: ${detections?.spoofConfidence})`)
        .addField('Violance', `${detections?.violence} (conf: ${detections?.violenceConfidence})`)
        .addField('Racy', `${detections?.racy} (conf: ${detections?.racyConfidence})`)
        .addField('User', `${message.author.tag} \n <@${message.author.id}>`)
        .setImage(message.author.avatarURL()!);
        message.channel.send(embed);

        console.log('Safe search:');
        console.log(`Adult: ${detections!.adult}`);
        console.log(`Medical: ${detections!.medical}`);
        console.log(`Spoof: ${detections!.spoof}`);
        console.log(`Violence: ${detections!.violence}`);
        console.log(`Racy: ${detections!.racy}`);

    } 
}
