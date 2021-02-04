/* eslint-disable quotes */
/* eslint-disable no-undef */
const Discord = require("discord.js");
const bot = new Discord.Client();
const DBL = require("dblapi.js");
let ms = require("ms");
let admin = require("firebase-admin");
const https = require('https');
const express = require('express');

const app = express();

admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://zal1000.firebaseio.com"
});
let rdb = admin.database();

let dblRef = rdb.ref("bots/reggeltbot/dblToken");
dblRef.once("value", function(snapshot) {
    new DBL(snapshot.val(), bot);
    console.debug(snapshot.val());
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

bot.on("ready", async() => {
    console.log(`${bot.user.username} has started`);
    const doc = admin.firestore().collection("bots").doc("reggeltbot-count-all");
    doc.onSnapshot(docSnapshot => {
        bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
    }, err => {
        console.log(`Encountered error: ${err}`);
        bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
    });

});

bot.on("messageUpdate", async (_, newMsg) => {
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

app.get('/ping', async (req, res) => {
    res.status(200).send({
        ping: bot.ws.ping,
    });
});

bot.ws.on('INTERACTION_CREATE', async interaction => {
    let prefix = (await getPrefix()).prefix; 
    const cmd = interaction.data.name;
    if(cmd === "count" || cmd === "ciunt") {
        let db = admin.firestore();
        let dcid = interaction.member.user.id;
        const cityRef = db.collection("dcusers").doc(dcid);
        const doc = await cityRef.get();
        if (!doc.exists) {
            interactionResponse(interaction, {
                type: 4,
                data: {
                    content: 'Error reading document!'
                }
            });
        } else {
            let upmbed = new Discord.MessageEmbed()
                .setTitle(`${interaction.member.user.username}`)
                .setColor("#FFCB5C")
                .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.com/count?i=${dcid})`)
                .setFooter(interaction.member.user.username)
                .setThumbnail(doc.data().pp)
                .setTimestamp(Date.now());
            console.log(upmbed);
    
            interactionResponse(interaction, {
                type: 4,
                data: {
                    embeds: [upmbed]
                }
            });
        }
    } else if(cmd === "help") {
        let upmbed = new Discord.MessageEmbed()
            .setTitle(interaction.member.user.username)
            .setColor("#FFCB2B")
            .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.com/count?i=${interaction.member.user.id}) is megnézheted)`)
            .addField(`${prefix}invite`, "Bot meghívása")
            .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
            .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
            .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
            .addField('\u200B', '\u200B')
            .addField("Bot ping", `${bot.ws.ping}ms`)
            .addField("Uptime", `${ms(bot.uptime)}`)
            .setFooter(interaction.member.user.username)
            .setThumbnail(bot.user.avatarURL())
            .setTimestamp(Date.now());
        interactionResponse(interaction, {
            type: 4,
            data: {
                embeds: [upmbed]
            }
        });
    }
});

bot.on("message", async message => {
    if(message.author.bot) return;
    let prefix = (await getPrefix()).prefix; 
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    // reggelt
    if(message.channel.name === (await getReggeltChannel(process.env.PROD)).channel) {
        const db = admin.firestore();

        if(message.content.toLowerCase().includes("reggelt")){
            const ref = db.collection('dcusers').doc(message.author.id);
            const doc = await ref.get();

            const cdref = db.collection('dcusers').doc(message.author.id).collection('cooldowns').doc(message.guild.id);
            const cddoc = await cdref.get();

            const configref = db.collection('bots').doc('reggeltbot').collection('config').doc('default');
            const configDoc = await configref.get();
            const cdval = configDoc.data().cd * 3600;
            const cd = Math.floor(Date.now() / 1000) + cdval;

            console.log(`Cooldown ends: ${cd}`);
            console.log(Math.floor(Date.now() / 1000));

            if(cddoc.exists) {
                console.log('');
                console.log(cddoc.data().reggeltcount);
                if(cddoc.data().reggeltcount > Math.floor(Date.now() / 1000)) {
                    message.delete();
                    message.author.send('You are on cooldown!');
                } else {
                    if(!process.env.PROD === "false") {
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
                if(!process.env.PROD === "false") {
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


            


            console.log(`message passed in: "${message.guild}, by.: ${message.author.username} (id: "${message.guild.id}")"(HUN)`);
            message.react("☕");     
        }
        else {
            if(!message.deletable) {
                message.channel.send('Missing permission!')
                    .catch(err => {
                        message.guild.owner.send('Missing permission! I need **Send Messages** to function correctly');
                        console.log(err);
                    });
                message.guild.owner.send('Missing permission! I need **Manage Messages** to function correctly')
                    .catch(
                        
                    );
            } else {
                message.delete();
                message.author.send(`Ide csak reggelt lehet írni! (${message.guild})`)
                    .catch(function(error) {
                        message.reply("Error: " + error);
                        console.log("Error:", error);
                    });
    
            }
            await reggeltupdatefs(message, true);
        }
    }
    
    // help
    else if(message.content === `${prefix}help`){
        let upmbed = new Discord.MessageEmbed()
            .setTitle(message.author.username)
            .setColor("#FFCB2B")
            .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.com/count?i=${message.author.id}) is megnézheted)`)
            .addField(`${prefix}invite`, "Bot meghívása")
            .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
            .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
            .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
            .addField('\u200B', '\u200B')
            .addField("Bot ping", `${bot.ws.ping}ms`)
            .addField("Uptime", `${ms(bot.uptime)}`)
            .setFooter(message.author.username)
            .setThumbnail(bot.user.avatarURL())
            .setTimestamp(message.createdAt);
        message.channel.send(upmbed);
    }

    //count 
    else if(message.content === `${prefix}count`){
        await getCountForUser(message);
    }
    else if(cmd === `${prefix}link`) {
        if(!args[0]){
            message.reply("Please provide your email");
        } else if(!args[1]) {
            message.reply("Please provide your link code");
        } else {
            botTypeing(message.channel.id);
            const db = admin.firestore();
            admin
                .auth()
                .getUserByEmail(args[0])
                .then((userRecord) => {
                    accountLink(userRecord, db);
                })
                .catch((error) => {
                    console.log("Error fetching user data:", error);
                });
            
        }
    } else if(cmd === `${prefix}fact`) {
        if(!args[0]) {
            await getRandomFact(message);
        } else if(args[0] === `id`) {
            if(!args[1]) {
                message.reply('Please add fact id!');
            } else {
                await getRandomFactWithId(args[1], message);
            }
        }
    } else if (cmd === `${prefix}restart`) {
        await restartRequest(message);
    } else if (cmd === `${prefix}update`) {
        updateUser(message);
    }
});

async function updateUser(message) {
    const ref = admin.firestore().collection('dcusers').doc(message.author.id).collection('guilds').doc(message.guild.id);
    //const doc = await ref.get();
    const gme = message.guild.me;
    console.log(gme.permissions.toArray());
    ref.set({
        name: message.guild.name,
        owner: message.guild.ownerID,
        icon: message.guild.iconURL(),
        permissions: {
            ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
            MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
            MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
            MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES"),                
        },
        allpermissions: gme.permissions.toArray()
    }).then(() => {
        message.reply('Server added/updated succesfuly!');
    }).catch(() => {
        message.reply('Error adding the server, please try again later and open a new issue on Github(https://github.com/zal1000/reggeltbot/issues)');
    });
}


async function getReggeltChannel(PROD) {
    const db = admin.firestore();
    const ref = db.collection('bots').doc('reggeltbot-channels');
    const doc = await ref.get();
    if(PROD === "false") {
        return {
            channel: doc.data().test,
        };
    } else if(PROD === "beta") {
        return {
            channel: doc.data().beta,
        };
    } else {
        return {
            channel: doc.data().main,
        };
    }
}

async function getPrefix() {
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    const PROD = process.env.PROD;
    if(PROD === "false") {
        return {
            prefix: doc.data().testprefix,
        };
    } else if(PROD === "beta") {
        return {
            prefix: doc.data().betaprefix,
        };
    } else {
        return {
            prefix: doc.data().prefix,
        };
    }
}

async function restartRequest(message) {
    const ref = admin.firestore().collection("bots").doc("reggeltbot");
    const doc = await ref.get();

    if(message.author.id === doc.data().ownerid) {
        message.reply('Restarting container...').then(() => {
            bot.destroy();
        }).then(() => {
            process.exit();
        });
        
        
    } else {
        message.reply('Nope <3',);
    }

}

async function getRandomFactWithId(id, message) {
    
    const db = admin.firestore();
    const ref = db.collection("facts").doc(id);
    const doc = await ref.get();
    if(!doc.exists) {
        message.reply('Cannot find that fact!');
    } else {
        sendRandomFact(doc.id, doc.data(), message);
    }
}

async function getRandomFact(message) {
    const db = admin.firestore();

    var quotes = db.collection("facts");

    var key2 = quotes.doc().id;
        
    quotes.where(admin.firestore.FieldPath.documentId(), '>=', key2).limit(1).get()
        .then(snapshot => {
            if(snapshot.size > 0) {
                snapshot.forEach(doc => {
                    sendRandomFact(doc.id, doc.data(), message);
                });
            } else {
                quotes.where(admin.firestore.FieldPath.documentId(), '<', key2).limit(1).get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            sendRandomFact(doc.id, doc.data(), message);
                        });
                    })
                    .catch(err => {
                        message.reply(`Error geting fact: **${err}**`);
                        console.log('Error getting documents', err);
                    });
            }
        })
        .catch(err => {
            message.reply(`Error geting fact: **${err.message}**`);
            console.log('Error getting documents', err);
        });
}

async function sendRandomFact(docid, docdata, message) {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(`${docdata.owner}`);
    const userDoc = await userRef.get();
    if(!docdata.owner){
        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact`)
            .setColor("#FFCB5C")
            .addField("Fact", docdata.fact)
            .setFooter(`This is a template fact`)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
    
    } else if(!userDoc.data().dcid) {

        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact by.: ${docdata.author}`)
            .setColor("#FFCB5C")
            .addField("Fact", docdata.fact)
            .addField("Fact id", docid)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setFooter(docdata.author)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
        
    } else {
        const dcRef = db.collection('dcusers').doc(`${userDoc.data().dcid}`);
        const dcDoc = await dcRef.get();

        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact by.: ${dcDoc.data().username}`)
            .setColor("#FFCB5C")
            .addField("Fact", docdata.fact)
            .addField("Fact id", docid)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setFooter(dcDoc.data().tag)
            .setThumbnail(dcDoc.data().pp)
            .setTimestamp(message.createdAt);

        message.channel.send(upmbed);
    }

}

async function reggeltupdateall() {
    let db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const incrementCount = botDoc.data().incrementCount;
    await db.collection("bots").doc("reggeltbot-count-all").update({
        reggeltcount: admin.firestore.FieldValue.increment(incrementCount)
    });
}

async function reggeltupdatefs(message, decreased = false) {
    let db = admin.firestore();
    const reggeltRef = db.collection("dcusers").doc(message.author.id);
    const doc = await reggeltRef.get();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const decreaseCount = botDoc.data().decreaseCount;
    const incrementCount = botDoc.data().incrementCount;
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

async function reggeltUpdateEdit(message) {
    let db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const botDoc = await botRef.get();
    const decreaseCount = botDoc.data().decreaseCount;
    await db.collection("bots").doc("reggeltbot-count-all").update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
    });
    await db.collection("dcusers").doc(message.author.id).update({
        reggeltcount: admin.firestore.FieldValue.increment(decreaseCount)
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
        let upmbed = new Discord.MessageEmbed()
            .setTitle(`${message.author.username}`)
            .setColor("#FFCB5C")
            .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.com/count?i=${dcid})`)
            .setFooter(message.author.username)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp(message.createdAt);
        console.log(upmbed);

        message.channel.send(upmbed);
    }
}

async function botTypeing(channel) {
    const data = JSON.stringify({});
    console.log((await getBotToken(process.env.PROD)).token);
      
    const options = {
        hostname: 'discord.com',
        port: 443,
        path: `/api/v8/channels/${channel}/typing`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'Authorization': `Bot ${(await getBotToken(process.env.PROD)).token}`,
            
        }
    };
      
    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);
      
        res.on('data', d => {
            process.stdout.write(d);
        });
    });
      
    req.on('error', error => {
        console.error(error);
    });
      
    req.write(data);
    req.end();
}
console.log(process.env.PROD);
const PROD = process.env.PROD;
botlogin(PROD);

async function getBotToken(PROD) {
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        return {
            token: doc.data().testtoken,
        };
    } else if(PROD === "beta") {
        return {
            token: doc.data().betatoken,
        };
    } else {
        return {
            token: doc.data().token,
        };
    } 
}

async function accountLink(userRecord, db) {
    const userRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userRef.get();

    const dcUserRef = db.collection("dcusers").doc(message.author.id);
    // eslint-disable-next-line no-unused-vars
    const dcUserDoc = await dcUserRef.get();

    if(userDoc.data().dclinked) {
        message.reply("This account is already linked!", args[1]);
    } else if(`${userDoc.data().dclink}` === args[1]) {
        dcUserRef.update({
            uid: message.author.id,
        });
        userRef.update({
            dclink: admin.firestore.FieldValue.delete(),
            dclinked: true,
            dcid: message.author.id,
        });
        message.reply("Account linked succesfuly!");
    } else {
        message.reply("Error linking account");
    }
}

async function botlogin(PROD) {
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        bot.login(doc.data().testtoken);
    } else if(PROD === "beta") {
        bot.login(doc.data().betatoken);
    } else {
        bot.login(doc.data().token);
    }
}

async function interactionResponse(interaction, data) {
    bot.api.interactions(interaction.id, interaction.token).callback.post({data: data});
}

app.listen(3000);