import * as textToSpeech from '@google-cloud/text-to-speech'
import fs = require('fs');
import { Message } from 'discord.js'

module.exports = {
    name: 'say',
    async execute(message: Message, args: Array<string>,) {
        //if(!args) return message.reply('I cant say nothing')
        
        const client = new textToSpeech.TextToSpeechClient();
        const text = args.join(' ');

        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
        const currentLang = langcode.guilds[message.guild!.id]

        message.reply(`${currentLang.lang}`)

            const [response] = await client.synthesizeSpeech({
                input: {text: text},
                voice: {languageCode: `${currentLang.lang}`, ssmlGender: 'NEUTRAL'},
                audioConfig: {audioEncoding: 'MP3'},
              });

            fs.writeFileSync(`./cache/${message.author.id}.mp3`, response!.audioContent!, 'binary')

            console.log('Audio content written to file: output.mp3');

            
            var voiceChannel = message.member!.voice.channel;
            voiceChannel!.join().then((connection: any) => {
                message.member!.voice.channel!.join().then((VoiceConnection: any) => {
                    VoiceConnection.play(`./cache/${message.author.id}.mp3`).on("finish", () => {
                        VoiceConnection.disconnect();
                        message.reply('Disconnected')
                    });
                }).catch((e: any) => console.log(e))

             }).catch((err: any) => console.log(err));
    }
}
