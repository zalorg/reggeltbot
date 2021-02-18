import * as textToSpeech from '@google-cloud/text-to-speech'
import fs = require('fs');
import util = require('util');

module.exports = {
    name: 'say',
    async execute(message: any, args: Array<string>, bot: any) {
        //console.log(args.join(' '))

        
        const client = new textToSpeech.TextToSpeechClient();

        async function quickStart() {
            // The text to synthesize
            const text = 'hello, world!';
          
            // Construct the request
          
            // Performs the text-to-speech request
            const [response] = await client.synthesizeSpeech({
                input: {text: text},
                // Select the language and SSML voice gender (optional)
                voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                // select the type of audio encoding
                audioConfig: {audioEncoding: 'MP3'},
              });
            // Write the binary audio content to a local file
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(`${message.author.id}.mp3`, response.audioContent, 'binary');
            console.log('Audio content written to file: output.mp3');
            
            var voiceChannel = message.member.voice.channel;
            voiceChannel.join().then((connection: { play: (arg0: any) => any; }) => {
                const file = fs.readFileSync(`${message.author.id}.mp3`, 'base64')

               connection.play(file).on("end", (end: any) => {
                 voiceChannel.leave();
                 });
             }).catch((err: any) => console.log(err));

          }
          quickStart();
    }
}