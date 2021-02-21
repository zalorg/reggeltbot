import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
admin.initializeApp()

const client = new Discord.Client()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export const senddcmessage = functions.firestore.document('bots/reggeltbot/sendmessages/{docId}').onCreate(async (snapshot, context) => {

    const channel = client.channels.cache.find(channel => channel.id === snapshot.data().id)

    console.log(channel);



    const db = admin.firestore()
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();

    client.login(doc.data()!.token)

    console.log(snapshot.data());
    console.log(context);
});