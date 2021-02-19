import language = require('@google-cloud/language');
const client = new language.LanguageServiceClient();


module.exports = {
    name: 'automod',
    async execute(message:any) {
        const text = message.content;

        const document: any = {
          content: text,
          type: 'PLAIN_TEXT',
        };
      
        // Detects the sentiment of the text
        const [result] = await client.analyzeSentiment({document: document});
        const sentiment = result.documentSentiment;

        console.log(sentiment)
/*
        message.reply(`Text: ${text}`);
        message.reply(`Sentiment score: ${sentiment?.score}`);
        message.reply(`Sentiment magnitude: ${sentiment?.magnitude}`);
        */
    }
}