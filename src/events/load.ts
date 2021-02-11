import * as admin from 'firebase-admin';
import fs = require('fs');

module.exports = {
    name: 'ready',
    execute(bot: any) {
        bot.on("ready", async () => {

            const bansRef = admin.firestore().collection('bots').doc('reggeltbot').collection('bans').doc('global');
            bansRef.onSnapshot(snap => {
                const bans = {
                    bans: snap.data()!.bans
                }
                console.log(bans)
                fs.writeFileSync('./cache/global-bans.json', JSON.stringify(bans))
            })
        
        
            console.log(`${bot.user!.username} has started`);
            const doc = admin.firestore().collection("bots").doc("reggeltbot-count-all");
            doc.onSnapshot((docSnapshot: any) => {
                bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
            }, (err: any) => {
                console.log(`Encountered error: ${err}`);
                bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
            });
        
        });
    }
}