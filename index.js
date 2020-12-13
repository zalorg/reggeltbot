const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const DBL = require("dblapi.js");
let ms = require("ms");
const emote = require("./emoji.json");
let admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://zal1000.firebaseio.com"
});
let rdb = admin.database();

let dblRef = rdb.ref("bots/reggeltbot/dblToken");
dblRef.once("value", function(snapshot) {
    const dbl = new DBL(snapshot.val(), bot);
    console.debug(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

bot.on("ready", async() => {
    console.log(`${bot.user.username} has started`);
        
    const db = admin.database();
    const doc = admin.firestore().collection("dcusers").doc("all");
    const observer = doc.onSnapshot(docSnapshot => {
        bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
    }, err => {
        console.log(`Encountered error: ${err}`);
        bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
    });
  
  
    const refS = db.ref("bots/status/reggeltbotS");
    refS.on("value", function(snapshot) {
        bot.user.setStatus(snapshot.val());
        console.log(snapshot.val());
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    }); 

});

bot.on("messageUpdate", async (_, newMsg) => {
    if(newMsg.author.bot) return;

    if(newMsg.channel.name === "reggelt"){
        if( newMsg.content.toLowerCase() !== "reggelt" ) {
            await reggeltUpdateEdit(newMsg);
            if(newMsg.deletable){
                newMsg.delete(1);
                newMsg.author.send("Ebben a formában nem modósíthadod az üzenetedet.");
            }
        }
    }
});

bot.on("message", async message => {
    if(message.author.bot) return;
    
    let prefix = "r!"; 
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    // reggelt
    if(message.channel.name === "reggelt") {
        
        if(cmd.toLowerCase() === "reggelt"){
            
            await reggeltupdateall();
            await reggeltupdatefs(message);

            console.log(`message passed in: "${message.guild}, by.: ${message.author.username} (id: "${message.guild.id}")"(HUN)`);
            message.react("☕");     
        }
        else {
            message.delete(1)
                .then(console.log(`message deleted in "${message.guild} (id: "${message.guild.id}")"(HUN)`))
                .catch(function(error) {
                    message.reply("Error: " + error.message);
                    console.log("Error:", error);
                });
            message.author.send(`Ide csak reggelt lehet írni! (${message.guild})`)
                .then(console.log(`warning sent to: "${message.author.username} (id: "${message.author.id}")"(HUN)`))
                .catch(function(error) {
                    message.reply("Error: " + error);
                    console.log("Error:", error);
                });

            await reggeltupdatefs(message, true);
        }
    }
    
    // help
    else if(message.content === `${prefix}help`){
        let upmbed = new Discord.RichEmbed()
            .setTitle(message.author.username)
            .setColor("#FFCB2B")
            .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.zal1000.com/count.html?=${message.author.id}) is megnézheted)`)
            .addField(`${prefix}invite`, "Bot meghívása")
            .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
            .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
            .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
            .addBlankField()
            .addField("Bot ping", `${bot.ping}ms`)
            .addField("Uptime", `${ms(bot.uptime)}`)
            .setFooter(message.author.username)
            .setThumbnail(bot.user.avatarURL)
            .setTimestamp(message.createdAt);
        message.channel.send(upmbed);
    }

    //count 
    else if(message.content === `${prefix}count`){
        await getCountForUser(message);
    }
});

async function reggeltupdateall() {
    let db = admin.firestore();
    const res = await db.collection("dcusers").doc("all").update({
        reggeltcount: admin.firestore.FieldValue.increment(1)
    });
}

async function reggeltupdatefs(message, decreased = false) {
    let db = admin.firestore();
    const reggeltRef = db.collection("dcusers").doc(message.author.id);
    const doc = await reggeltRef.get();
    if (!doc.exists) {
        reggeltRef.set({
            reggeltcount: (decreased ? -1 : 1),
            pp: message.author.avatarURL,
            tag: message.author.tag,
            username: message.author.username
        });
    } else {
        reggeltRef.update({
            reggeltcount: admin.firestore.FieldValue.increment(decreased ? -1 : 1),
            pp: message.author.avatarURL,
            tag: message.author.tag,
            username: message.author.username
        });
    }
}

async function reggeltUpdateEdit(message) {
    let db = admin.firestore();
    await db.collection("dcusers").doc("all").update({
        reggeltcount: admin.firestore.FieldValue.increment(-1)
    });
    await db.collection("dcusers").doc(message.author.id).update({
        reggeltcount: admin.firestore.FieldValue.increment(-1)
    });
}

async function getCountForUser(message) {
    let db = admin.firestore();
    let dcid = message.author.id;
    const cityRef = db.collection("dcusers").doc(dcid);
    const doc = await cityRef.get();
    if (!doc.exists) {
        console.log("No such document!");
        message.reply("Error reading document!");
    } else {
        let upmbed = new Discord.RichEmbed()
            .setTitle(`${message.author.username}`)
            .setColor("#FFCB5C")
            .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.zal1000.com/count.html?=${dcid})`)
            .setFooter(message.author.username)
            .setThumbnail(message.author.avatarURL)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
    }
}

let tokenRef = rdb.ref("bots/reggeltbot/token");
tokenRef.once("value", function(snapshot) {
    bot.login(snapshot.val());
    console.debug(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});