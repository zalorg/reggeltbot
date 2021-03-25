import * as admin from 'firebase-admin';
import fs = require('fs');
const db = admin.firestore();
import * as qdb from 'quick.db';
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

        const configref = db.doc('bots/reggeltbot');

        configref.onSnapshot(s => {
            qdb.set(`config.embedcolor`, s.data()?.embedcolor)
            qdb.set(`config.decreaseCount`, s.data()?.decreaseCount)
            qdb.set(`config.incrementCount`, s.data()?.incrementCount)
            qdb.set(`config.emoteBuy`, s.data()?.emoteBuy)
            qdb.set(`config.emoteSell`, s.data()?.emoteSell)

            //prefix

            switch(process.env.PROD) {
                case 'false':
                    qdb.set(`config.prefix`, s.data()?.testprefix)
                    qdb.set(`config.token`, s.data()?.testtoken)
                    break;
                case 'beta':
                    qdb.set(`config.prefix`, s.data()?.betaprefix)
                    qdb.set(`config.token`, s.data()?.betatoken)
                    break;
                default: 
                    qdb.set(`config.prefix`, s.data()?.prefix)
                    qdb.set(`config.token`, s.data()?.token)
                    break;
            }

            //console.log(qdb.get('config.prefix'))

            console.log('config cache updated')
        });
    


        const ref = db.collection('bots').doc('reggeltbot').collection('config');
    
        ref.onSnapshot(doc => {
            doc.forEach(item => {
                qdb.set(`guild.${item.id}`, item.data())
                my.guilds[item.id] = item.data();
            })
        });

    }
}

interface Interface {
    guilds: { [key: string]: any };
    langs: Array<string>;
}



//            fs.writeFileSync('./cache/guilds.json', JSON.stringify(my))
