import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
const {Translate} = require('@google-cloud/translate').v2;
import fs = require('fs');
import * as textToSpeech from '@google-cloud/text-to-speech'
import { Message } from 'discord.js';
import { Guildconfig, Langtypes } from '../types'
import * as qdb from 'quick.db';

const translate = new Translate();

module.exports = {
    name: 'fact',
    async execute(message: Message, args: Array<string>) {

        //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        //const currentLang: Guildconfig = langcode.guilds[message.guild!.id]

        const guildlang = qdb.get(`guild.${message.guild?.id}`).lang || "en-US"
        
        const fulllang: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8'));

        const lang = fulllang.commands.fact;

        if(!args[0] || args[0] === "say") {
            const db = admin.firestore();

            var quotes = db.collection("facts");
        
            var key2 = quotes.doc().id;
            
            quotes.where(admin.firestore.FieldPath.documentId(), '>=', key2).limit(1).get()
                .then((snapshot: { size: number; forEach: (arg0: (doc: any) => void) => void; }) => {
                    if(snapshot.size > 0) {
                        snapshot.forEach((doc: { id: any; data: () => any; }) => {
                            sendRandomFact(doc.id, message, qdb.get(`guild.${message.guild?.id}`).lang, args);
                        });
                    } else {
                        quotes.where(admin.firestore.FieldPath.documentId(), '<', key2).limit(1).get()
                            .then((snapshot: any) => {
                                snapshot.forEach((doc: { id: any; data: () => any; }) => {
                                    sendRandomFact(doc.id, message, qdb.get(`guild.${message.guild?.id}`).lang, args);
                                });
                            })
                            .catch((err: any) => {
                                message.reply(`${lang.errorGF}: **${err}**`);
                                console.log('Error getting documents', err);
                            });
                    }
                })
                .catch((err: { message: any; }) => {
                    message.reply(`${lang.errorGF}: **${err.message}**`);
                    console.log('Error getting documents', err);
                });
        } else if(args[0] === `id`) {
            if(!args[1]) {
                message.reply(lang.noId);
            } else {
                await getRandomFactWithId(args[1], message, args);
            }
        }
    }
}

async function sendRandomFact(docid: any, message: Message, langcode: string, args: Array<string>) {
    const db = admin.firestore();
    const ref = db.collection("facts").doc(docid);
    const doc = await ref.get();
    const userRef = db.collection('users').doc(`${doc.data()!.owner}`);
    const userDoc = await userRef.get();  

    const guildlang = qdb.get(`guild.${message.guild?.id}`).lang || "en-US"

    const lang = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8')).commands.fact;

    if(args[0] === "say" || args[2] === "say") {
        const string: string = await translatefact(doc.data()!.fact, langcode);
        const usingSplit = string.split(' ');
        tts(message, usingSplit);
    }
    
    
    if(!doc.data()!.owner){
        let upmbed = new Discord.MessageEmbed()
            .setTitle(lang.title1)
            .setColor(qdb.get('config.embedcolor'))
            .addField(lang.fact, await translatefact(doc.data()!.fact, langcode))
            .setFooter(`This is a template fact`)
            .addField('\u200B', '\u200B')
            .addField(lang.add, lang.addF)
            .setFooter(`${message.author.tag} • This is a template fact • Reggeltbot facts`, message.author.avatarURL({dynamic: true}) || undefined ).setTimestamp(Date.now());

        message.channel.send(upmbed);
    
    } else if(!userDoc.data()!.dcid) {

        let upmbed = new Discord.MessageEmbed()
            .setTitle(lang.title2.replace('%!AUTHOR%!', doc.data()!.author))
            .setColor(qdb.get('config.embedcolor'))
            .addField(lang.fact, await translatefact(doc.data()!.fact, langcode))
            .addField(lang.factid, docid)
            .addField('\u200B', '\u200B')
            .addField(lang.add, lang.addF)
            .setFooter(`${message.author.tag} • Reggeltbot facts`, message.author.avatarURL({dynamic: true}) || undefined ).setTimestamp(Date.now());

        message.channel.send(upmbed);
        
    } else {
        const dcRef = db.collection('dcusers').doc(`${userDoc.data()!.dcid}`);
        const dcDoc = await dcRef.get();
        
        let upmbed = new Discord.MessageEmbed()
            .setTitle(lang.title2.replace('%!AUTHOR%!', dcDoc.data()!.username))
            .setColor(qdb.get('config.embedcolor'))
            .addField(lang.fact, await translatefact(doc.data()!.fact, langcode))
            .addField(lang.factid, docid)
            .addField('\u200B', '\u200B')
            .addField(lang.add, lang.addF)
            .setThumbnail(dcDoc.data()!.pp)
            .setFooter(`${message.author.tag} • Reggeltbot facts`, message.author.avatarURL({dynamic: true}) || undefined ).setTimestamp(Date.now());

        message.channel.send(upmbed);
    }

}

async function getRandomFactWithId(id: any, message: Message, args: Array<string>) {
    
    const db = admin.firestore();
    const ref = db.collection("facts").doc(id);
    const doc = await ref.get();
    if(!doc.exists) {
    
        const guildlang = qdb.get(`guild.${message.guild?.id}`).lang || "en-US"

        const langfull: Langtypes = JSON.parse(fs.readFileSync(`./lang/${guildlang}.json`, 'utf8'));

        const lang = langfull.commands.fact;

        message.reply(lang.noFact);
    } else {
        sendRandomFact(doc.id, message, qdb.get(`guild.${message.guild?.id}`).lang, args);
    }
}

async function translatefact(text: string, langcode: string) {

    if(langcode === "hu-HU") {
        return text;
    } else {
        const m = langcode.split("-", 1)

        let [translations] = await translate.translate(text, m[0]);
        translations = Array.isArray(translations) ? translations : [translations];
        return translations[0];
    }

}

async function tts(message: Message, args: Array<string>,) {
    //if(!args) return message.reply('I cant say nothing')
    
    const client = new textToSpeech.TextToSpeechClient();
    const text = args.join(' ');

    //const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));
    const guildconfig: Guildconfig = qdb.get(`guild.${message.guild?.id}`)

    //message.reply(`${currentLang.lang}`)

    const guildlang = guildconfig.lang || "en-US";

        const [response] = await client.synthesizeSpeech({
            input: {text: text},
            voice: {languageCode: `${guildlang}`, ssmlGender: 'NEUTRAL'},
            audioConfig: {audioEncoding: 'MP3'},
          });

        fs.writeFileSync(`./cache/${message.author.id}.mp3`, response!.audioContent!, 'binary')

        //console.log('Audio content written to file: output.mp3');

        //message.guild?.me?.voice.setMute(false)

        const voiceChannel = message.member!.voice.channel;

        voiceChannel!.join().then(connection => {
            message.member!.voice.channel!.join().then(VoiceConnection => {
                VoiceConnection.play(`./cache/${message.author.id}.mp3`).on("finish", () => {
                    VoiceConnection.disconnect();
                    //message.reply('Disconnected')
                });
            }).catch(e => console.log(e))

         }).catch(err => console.log(err));
}