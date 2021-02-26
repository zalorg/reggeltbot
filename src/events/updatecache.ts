import * as admin from 'firebase-admin';
import fs = require('fs');
const db = admin.firestore();

module.exports = {
    name: 'updatecache',
    async execute() {

        const refDef = admin.firestore().collection('bots').doc('reggeltbot').collection('config').doc('default');
        const docDef = await refDef.get();

        fs.writeFileSync('./cache/default-guild.json', JSON.stringify(docDef.data()), 'utf8')

        var my: Interface = {
            langs: ["hu-HU", "en-US", "de-DE"],
            guilds: {},
        }

        const ref = db.collection('bots').doc('reggeltbot').collection('config');
    
        ref.onSnapshot(s => {
            updatecache(my).then(() => {
                fs.writeFileSync('./cache/guilds.json', JSON.stringify(my))
            })
        })

    }
}

interface Interface {
    guilds: { [key: string]: any };
    langs: Array<string>;
}

async function updatecache(data: Interface) {
    const db = admin.firestore();

    const ref = db.collection('bots').doc('reggeltbot').collection('config');
    const doc = await ref.get();

    doc.forEach(item => {
        data.guilds[item.id] = item.data();
    })
}

//            fs.writeFileSync('./cache/guilds.json', JSON.stringify(my))
