import * as textToSpeech from '@google-cloud/text-to-speech'
import fs = require('fs');
import { Message } from 'discord.js'

module.exports = {
    name: 'say',
    async execute(message: Message, args: Array<string>,) {
        if(!args) return message.reply('I cant say nothing')
        
        const client = new textToSpeech.TextToSpeechClient();
        const text = args.join(' ');
          
            const [response] = await client.synthesizeSpeech({
                input: {text: text},
                voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                audioConfig: {audioEncoding: 'MP3'},
              });

            fs.writeFileSync(`./cache/${message.author.id}.mp3`, `${response.audioContent}`, 'binary')

            console.log('Audio content written to file: output.mp3');

            
            var voiceChannel = message.member?.voice.channel;
            voiceChannel?.join().then((connection: any) => {
                message.member?.voice.channel?.join().then(VoiceConnection => {
                    VoiceConnection.play(`./cache/${message.author.id}.mp3`).on("finish", () => VoiceConnection.disconnect());
                }).catch((e: any) => console.log(e))

             }).catch((err: any) => console.log(err));

             return;
    }
}
