import { TextToSpeechClient } from '@google-cloud/text-to-speech'
import fs = require('fs');
import { Message } from 'discord.js'
import { Guildconfig } from '../types'
import *  as qdb from 'quick.db';

module.exports = {
    name: 'say',
    async execute(message: Message, args: Array<string>,) {
        //if(!args) return message.reply('I cant say nothing')
        
        const client = new TextToSpeechClient();
        const text = args.join(' ');

        //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        const guildconfig: Guildconfig = qdb.get(`guilds.${message.guild?.id}`).lang

        if(!message.member?.voice) return;

        //message.reply(`${guildconfig.lang}`)

            const [response] = await client.synthesizeSpeech({
                input: {text: text},
                voice: {languageCode: `${guildconfig.saylang}`, ssmlGender: 'NEUTRAL'},
                audioConfig: {audioEncoding: 'MP3'},
              });

            fs.writeFileSync(`./cache/${message.author.id}.mp3`, response!.audioContent!, 'binary')

            //console.log('Audio content written to file: output.mp3');
            
            const voiceChannel = message.member!.voice.channel;

            voiceChannel!.join().then((connection: any) => {
                message.member!.voice.channel!.join().then((VoiceConnection: any) => {
                    VoiceConnection.play(`./cache/${message.author.id}.mp3`).on("finish", () => {
                        VoiceConnection.disconnect();
                        //message.reply('Disconnected')
                    });
                }).catch((e: any) => {
                    throw e;
                })

             }).catch((err: any) => {
                 console.error(err);
             });
    }
}
