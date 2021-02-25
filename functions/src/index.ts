import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
const db = admin.firestore();
admin.initializeApp()

const client = new Discord.Client()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

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

export const waik_autoroleupdate = functions.pubsub.schedule('every 1 day').onRun(async () => {

    const bot = new Discord.Client();

    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();

    bot.login(doc.data()!.token);
    
    const waik = await bot.guilds.fetch('738169002085449748');

    waik.members.cache.forEach(async member => {
        const joinref = await admin.firestore().doc(`dcusers/${member.id}/guilds/738169002085449748`).get();
        const join = joinref.data()!.joinedTimestamp;
        const m6 = 6 * 2.628e+9;
        const y1 = 1 * 3.154e+10;
        const y2 = 2 * 3.154e+10;
        const y3 = 3 * 3.154e+10;
        const now = Date.now();
        //const channel = waik.channels.cache.find(e => e.name === "bot-testing");
        
        console.log(m6 + join);
        console.log(Date.now());

        if(join + y3 < now) {
            waik.member(member.id)?.roles.add('814266693585076284');
            console.log(3);
        } else if(join + y2 < now) {
            waik.member(member.id)?.roles.add('814266813470605312');
            console.log(2);
        } else if(join + y1 < now) {
            waik.member(member.id)?.roles.add('814266730264002651');
            console.log(1);
        } else if(join + m6 < now) {
            waik.member(member.id)?.roles.add('814266693585076284');
            console.log(6);
        }

    })

    setTimeout(() => {
        bot.destroy();
    }, 10000);
})