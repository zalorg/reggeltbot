import * as admin from 'firebase-admin';

module.exports =  {
    name: 'msgUpdate',
    execute(bot: any) {
        bot.on("messageUpdate", async (_: any, newMsg: any) => {
            if(newMsg.author.bot) return;
        
            if(newMsg.channel.name === "reggelt"){
                if(!newMsg.content.toLowerCase().includes("reggelt")) {
                    await reggeltUpdateEdit(newMsg);
                    if(newMsg.deletable){
                        newMsg.delete();
                        newMsg.author.send("Ebben a formában nem modósíthadod az üzenetedet.");
                    }
                }
            }
        });
    }
}

async function reggeltUpdateEdit(message: { author: { id: string; }; }) {
    let db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const decreaseCount = botDoc.data()!.decreaseCount;
    await db.collection("bots").doc("reggeltbot-count-all").update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
    });
    await db.collection("dcusers").doc(message.author.id).update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
    });
}