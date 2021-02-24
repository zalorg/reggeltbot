import * as admin from 'firebase-admin';
import fs = require('fs');
import DBL = require('dblapi.js');
import { Client } from 'discord.js'
//import * as axios from 'axios';

module.exports = {
    name: 'ready',
    execute(bot: Client) {
        bot.on("ready", async () => {

            sendCommands()

            const dblToken = (await admin.firestore().collection('bots').doc('reggeltbot').get()).data()?.dblToken
            const dbl = new DBL(dblToken, bot);
            dbl.on('posted', () => {
                console.log('posted')
            })
            dbl.webhook?.on('vote', vote => {
                console.log(`User with ID ${vote.user} just voted!`);
                console.log(vote)
                admin.firestore().collection('dbl').add({
                    vote: vote
                })
            });
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
                bot.user?.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
            }, (err: any) => {
                console.log(`Encountered error: ${err}`);
                bot.user?.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
            });
        
        });
    }
}

function sendCommands() {
/*
    send({
        "name": "count",
        "description": "Ennyiszer köszöntél be a #reggelt csatornába",
        "options": [
            {
                "name": "user",
                "description": "The user to get",
                "type": 6,
                "required": false
            }
        ]
    })
    */
    
}
/*
async function send(data: any) {
    
    axios.default.post('', {
        data: data,
        headers: {
            'Authorization': `Bot ${(await getBotToken())}`,
        }
    })
}

async function getBotToken() {
    const PROD = process.env.PROD;
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        return {
            token: doc.data()!.testtoken,
        };
    } else if(PROD === "beta") {
        return {
            token: doc.data()!.betatoken,
        };
    } else {
        return {
            token: doc.data()!.token,
        };
    } 
}

*/