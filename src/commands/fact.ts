import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';
module.exports = {
    name: 'fact',
    async execute(message: any, args: any) {
        if(!args[0]) {
            const db = admin.firestore();

            var quotes = db.collection("facts");
        
            var key2 = quotes.doc().id;
                
            quotes.where(admin.firestore.FieldPath.documentId(), '>=', key2).limit(1).get()
                .then((snapshot: { size: number; forEach: (arg0: (doc: any) => void) => void; }) => {
                    if(snapshot.size > 0) {
                        snapshot.forEach((doc: { id: any; data: () => any; }) => {
                            sendRandomFact(doc.id, message);
                        });
                    } else {
                        quotes.where(admin.firestore.FieldPath.documentId(), '<', key2).limit(1).get()
                            .then((snapshot: any) => {
                                snapshot.forEach((doc: { id: any; data: () => any; }) => {
                                    sendRandomFact(doc.id, message);
                                });
                            })
                            .catch((err: any) => {
                                message.reply(`Error geting fact: **${err}**`);
                                console.log('Error getting documents', err);
                            });
                    }
                })
                .catch((err: { message: any; }) => {
                    message.reply(`Error geting fact: **${err.message}**`);
                    console.log('Error getting documents', err);
                });
        } else if(args[0] === `id`) {
            if(!args[1]) {
                message.reply('Please add fact id!');
            } else {
                await getRandomFactWithId(args[1], message);
            }
        }
    }
}

async function sendRandomFact(docid: any, message: { createdAt: any; channel: { send: (arg0: any) => void; }; }) {
    const db = admin.firestore();
    const ref = db.collection("facts").doc(docid);
    const doc = await ref.get();
    const userRef = db.collection('users').doc(`${doc.data()!.owner}`);
    const userDoc = await userRef.get();
    if(!doc.data()!.owner){
        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact`)
            .setColor("#FFCB5C")
            .addField("Fact", doc.data()!.fact)
            .setFooter(`This is a template fact`)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
    
    } else if(!userDoc.data()!.dcid) {

        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact by.: ${doc.data()!.author}`)
            .setColor("#FFCB5C")
            .addField("Fact", doc.data()!.fact)
            .addField("Fact id", docid)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setFooter(doc.data()!.author)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
        
    } else {
        const dcRef = db.collection('dcusers').doc(`${userDoc.data()!.dcid}`);
        const dcDoc = await dcRef.get();

        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact by.: ${dcDoc.data()!.username}`)
            .setColor("#FFCB5C")
            .addField("Fact", doc.data()!.fact)
            .addField("Fact id", docid)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setFooter(dcDoc.data()!.tag)
            .setThumbnail(dcDoc.data()!.pp)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
    }

}

async function getRandomFactWithId(id: any, message: any) {
    
    const db = admin.firestore();
    const ref = db.collection("facts").doc(id);
    const doc = await ref.get();
    if(!doc.exists) {
        message.reply('Cannot find that fact!');
    } else {
        sendRandomFact(doc.id, message);
    }
}