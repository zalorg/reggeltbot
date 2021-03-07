import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

import * as express from 'express';

const app = express();

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://zal1000.firebaseio.com"
});

start()

async function botlogin(PROD: string | undefined) {
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        return new Discord.ShardingManager('./dist/index.js', {token: doc.data()!.testtoken});
    } else if(PROD === "beta") {
        return new Discord.ShardingManager('./dist/index.js', {token: doc.data()!.betatoken});
    } else {
        return new Discord.ShardingManager('./dist/index.js', {token: doc.data()!.token});
    }
}

async function start() {
    const manager = await botlogin(process.env.PROD);

manager.on('shardCreate', async shard => {
    console.log(`Shard created (${shard.id})`)
});

manager.spawn('auto');

}

app.listen(3000);
