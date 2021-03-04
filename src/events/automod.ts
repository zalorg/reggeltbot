import language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();
import { Message } from 'discord.js'
import * as admin from 'firebase-admin'


module.exports = {
    name: 'automod',
    async execute(message: Message) {
        const text = message.content;

        const document: any = {
          content: text,
          type: 'PLAIN_TEXT',
        };
      
        // Detects the sentiment of the text
        const [result] = await client.analyzeSentiment({document: document});
        //const sentiment = result.documentSentiment;

        //console.log(sentiment)

        admin.firestore().collection('bots').doc('reggeltbot').collection('messageanalytics').add({
          result: result,
          author: message.author.id,
          guild: message.guild?.id
        })
/*
        message.reply(`Text: ${text}`);
        message.reply(`Sentiment score: ${sentiment?.score}`);
        message.reply(`Sentiment magnitude: ${sentiment?.magnitude}`);
        */
    }
}