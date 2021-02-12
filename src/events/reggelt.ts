import * as admin from 'firebase-admin';
import fs = require('fs');

module.exports = {
    name: 'reggelt',
    async execute(message: any) {
        const db = admin.firestore();

        const data = JSON.parse(fs.readFileSync('./cache/global-bans.json', 'utf8'));
        if(data.bans.find((element: any) => element === message.author.id)) {
            message.delete();
            message.author.send('You are banned!')
            return;
        }
        if(message.content.toLowerCase().includes("reggelt")){
            const ref = db.collection('dcusers').doc(message.author.id);
            const doc = await ref.get();

            const cdref = db.collection('dcusers').doc(message.author.id).collection('cooldowns').doc(message.guild!.id);
            const cddoc = await cdref.get();

            const configref = db.collection('bots').doc('reggeltbot').collection('config').doc('default');
            const configDoc = await configref.get();
            const cdval = configDoc.data()!.cd * 3600;
            const cd = Math.floor(Date.now() / 1000) + cdval;

            console.log(`Cooldown ends: ${cd}`);
            console.log(Math.floor(Date.now() / 1000));

            if(cddoc.exists) {
                console.log('');
                console.log(cddoc.data()!.reggeltcount);
                if(cddoc.data()!.reggeltcount > Math.floor(Date.now() / 1000)) {
                    message.delete();
                    message.author.send('You are on cooldown!');
                } else {
                    if(!process.env.PROD) {
                        await reggeltupdateall();
                        await reggeltupdatefs(message);
                    }
                    cdref.update({
                        reggeltcount: cd,
                    });
                    console.log(2);
                }

                console.log(1);
            } else {
                cdref.set({
                    reggeltcount: cd,
                });
                if(!process.env.PROD) {
                    await reggeltupdateall();
                    await reggeltupdatefs(message);
                }
                console.log('doc created');
            }



            if(doc.exists) {
                ref.update({
                    tag: message.author.tag,
                    username: message.author.username,
                    pp: message.author.avatarURL(),
                });
            } else {
                ref.set({
                    tag: message.author.tag,
                    username: message.author.username,
                    pp: message.author.avatarURL(),
                });
            }

            console.log(`message passed in: "${message.guild}, by.: ${message.author.username} (id: "${message.guild!.id}")"(HUN)`);
            message.react("☕");     
        } else {
            if(!message.deletable) {
                message.channel.send('Missing permission!')
                    .catch((err: any) => {
                        message.guild!.owner!.send('Missing permission! I need **Send Messages** to function correctly');
                        console.log(err);
                    });
                message.guild!.owner!.send('Missing permission! I need **Manage Messages** to function correctly')
                    .catch(
                        
                    );
            } else {
                message.delete();
                message.author.send(`Ide csak reggelt lehet írni! (${message.guild})`)
                    .catch(function(error: string) {
                        message.reply("Error: " + error);
                        console.log("Error:", error);
                    });
    
            }
            await reggeltupdatefs(message, true);
        }
    }
}

async function reggeltupdateall() {
    let db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const incrementCount = botDoc.data()!.incrementCount;
    await db.collection("bots").doc("reggeltbot-count-all").update({
        reggeltcount: admin.firestore.FieldValue.increment(incrementCount)
    });
}

async function reggeltupdatefs(message: { author: { id: string; tag: string; username: string; avatarURL: () => string; }; }, decreased = false) {
    let db = admin.firestore();
    const reggeltRef = db.collection("dcusers").doc(message.author.id);
    const doc = await reggeltRef.get();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const decreaseCount = botDoc.data()!.decreaseCount;
    const incrementCount = botDoc.data()!.incrementCount;
    if (!doc.exists) {
        reggeltRef.set({
            reggeltcount: (decreased ? decreaseCount : incrementCount),
            tag: message.author.tag,
            username: message.author.username,
            pp: message.author.avatarURL(),
        });
    } else {
        reggeltRef.update({
            reggeltcount: admin.firestore.FieldValue.increment(decreased ? decreaseCount : incrementCount),
            tag: message.author.tag,
            username: message.author.username,
            pp: message.author.avatarURL(),
        });
    }
}