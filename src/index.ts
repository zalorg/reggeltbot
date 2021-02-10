import axios from "axios";
//import Discord = require("discord.js");
import * as Discord from 'discord.js';
import fs = require('fs');
//const bot: { message: { channel: { name: any }; }; user: { username: string; setActivity: Function} } = new Discord.Client();
const bot: any = new Discord.Client();
import DBL = require("dblapi.js");
let ms = require("ms");
import * as admin from 'firebase-admin';
import https = require('https');
import express = require('express');

const app = express();

//declare var  Discord: { MessageEmbed: new () => { (): any; new(): any; setTitle: { (arg0: string): { (): any; new(): any; setColor: { (arg0: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; addField: { (arg0: string, arg1: string): { (): any; new(): any; setFooter: { (arg0: any): { (): any; new(): any; setThumbnail: { (arg0: any): { (): any; new(): any; setTimestamp: { (arg0: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; setURL: { (arg0: string): { (): any; new(): any; setThumbnail: { (arg0: any): any; new(): any; }; }; new(): any; }; }; new(): any; }; }; new(): any; }; }; };


admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: "https://zal1000.firebaseio.com"
});
let rdb = admin.database();

function rdbupdate(){
    const db = admin.database();

    const ref = db.ref(`bots/status`);
    const time = msToTime(bot.uptime);
    ref.update({
        reggeltbotPing: `${bot.ws.ping}`,
        reggeltbotUp: `${bot.uptime}`,
        reggeltbotUpRead: time,
    });

    setTimeout(rdbupdate, 1000);
}
if(!process.env.PROD) {
    rdbupdate();
}

let dblRef = rdb.ref("bots/reggeltbot/dblToken");
dblRef.once("value", function(snapshot: { val: () => any; }) {
    new DBL(snapshot.val(), bot);
    console.debug(snapshot.val());
}, function (errorObject: { code: string; }) {
    console.log("The read failed: " + errorObject.code);
});
bot.on("ready", async() => {
    console.log(`${bot.user!.username} has started`);
    const doc = admin.firestore().collection("bots").doc("reggeltbot-count-all");
    doc.onSnapshot((docSnapshot: any) => {
        bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
    }, (err: any) => {
        console.log(`Encountered error: ${err}`);
        bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
    });

});

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

app.get('/', (req: any, res: any) => {
    res.sendStatus(200);
})

app.get('/ping', async (req: any, res: any) => {
    res.status(200).send({
        ping: bot.ws.ping,
    });
});


bot.on('error', async (err: any) => {
    console.log(err);
})


bot.ws.on('INTERACTION_CREATE', async (interaction: any) => {
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
                .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data()!.reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.com/count?i=${dcid})`)
                .setFooter(interaction.member.user.username)
                .setThumbnail(doc.data()!.pp)
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
            .setThumbnail(bot.user!.avatarURL()!)
            .setTimestamp(Date.now());
        interactionResponse(interaction, {
            type: 4,
            data: {
                embeds: [upmbed]
            }
        });
    }
});

bot.on("message", async (message: any) => {
    if(message.author.bot) return;
    let prefix = (await getPrefix()).prefix; 
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    

    if(!message.author.bot) {
        updateUser(message);
        const ref = admin.firestore().collection('dcusers').doc(message.author.id);
        await axios.get(`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif`).then(res => {
            ref.update({
                pp: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.gif`,
                username: message.author.username,
                tag: message.author.tag,
            }).catch(err => {
                console.error(err.code);
            })
        }).catch(err => {
            ref.update({
                pp: `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.webp`,
                username: message.author.username,
                tag: message.author.tag,
            }).catch(err => {
                console.error(err.code);
            })
        })
    }

    // reggelt
    if(message.channel.name === (await getReggeltChannel(process.env.PROD)).channel) {
        const db = admin.firestore();

        console.log(await getBansCache(message.author.id))

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
            .setThumbnail(bot.user!.avatarURL()!)
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
            admin
                .auth()
                .getUserByEmail(args[0])
                .then((userRecord: any) => {
                    return accountLink(userRecord, message);
                })
                .catch((error: any) => {
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
    } else if (cmd === `${prefix}ping`) {
        if(!args) {
            message.reply(bot.ws.ping);
        } else if(args[0] === 'api' && args[1] === 'internal') {
            axios.get(`${(await apiurl()).ip}/ping`).then(res => {
                console.log(res)
                message.reply(res.status);
            }).catch(err => {
                message.reply(err.status);
                throw err;
            })
        }
    } else if (cmd === `${prefix}leaderboard`) {
        console.log((await apiurl()).ip)
        if(!args[0]) {
            await axios.get(`${(await apiurl()).ip}/reggeltbot/leaderboard?m=10`).then(res => {
                const embed = new Discord.MessageEmbed()
                .setTitle('Leaderboard')
                .setColor('#FFCA5C')
                .setURL(`https://reggeltbot.com/leaderboard?m=10`)
                .setThumbnail(res.data[0].pp)
                res.data.forEach((lb: any) => {
                    embed.addField(lb.name, lb.reggeltcount)
                });

                message.channel.send(embed)
            }).catch(err => {
                message.reply('API Error')
                console.error(err);
            })
        } else {
            const number = parseInt(args[0]);
            console.log(number)
            if(!number) {
                message.reply('Please use a number')
            } else if(number < 0) {
                console.log(1)
                message.reply('Please use a number between 1 and 20')
            } else if(number > 21) {
                console.log(2)

                message.reply('Please use a number between 1 and 20')
            } else {
                await axios.get(`${(await apiurl()).ip}/reggeltbot/leaderboard?m=${number}`).then(res => {
                    const embed = new Discord.MessageEmbed()
                    .setTitle('Leaderboard')
                    .setColor('#FFCA5C')
                    .setURL(`https://reggeltbot.com/leaderboard?m=${number}`)
                    .setThumbnail(res.data[0].pp)
                    res.data.forEach((lb: any) => {
                        embed.addField(lb.name, lb.reggeltcount)
                    });
    
                    message.channel.send(embed)
                }).catch(err => {
                    message.reply('API Error')
                    console.error(err);
                })
            }
        }
    }
});

async function updateUser(message: any) {
    const ref = admin.firestore().collection('dcusers').doc(message.author.id).collection('guilds').doc(message.guild.id);
    //const doc = await ref.get();
    const gme = message.guild.member(message.author.id);
    //console.log(gme.permissions.toArray());
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
        //message.reply('Server added/updated succesfuly!');
    }).catch(err => {
        //message.reply('Error adding the server, please try again later and open a new issue on Github(https://github.com/zal1000/reggeltbot/issues)');
        throw err;
    });
}

async function getReggeltChannel(PROD: string | undefined) {
    const db = admin.firestore();
    const ref = db.collection('bots').doc('reggeltbot-channels');
    const doc = await ref.get();
    if(PROD === "false") {
        return {
            channel: doc.data()!.test,
        };
    } else if(PROD === "beta") {
        return {
            channel: doc.data()!.beta,
        };
    } else {
        return {
            channel: doc.data()!.main,
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
            prefix: doc.data()!.testprefix,
        };
    } else if(PROD === "beta") {
        return {
            prefix: doc.data()!.betaprefix,
        };
    } else {
        return {
            prefix: doc.data()!.prefix,
        };
    }
}

async function restartRequest(message: { author: { id: any; }; reply: (arg0: string) => Promise<any>; }) {
    const ref = admin.firestore().collection("bots").doc("reggeltbot");
    const doc = await ref.get();

    if(message.author.id === doc.data()!.ownerid) {
        message.reply('Restarting container...').then(() => {
            bot.destroy();
        }).then(() => {
            process.exit();
        });
        
        
    } else {
        message.reply('Nope <3',);
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

async function getRandomFact(message: any) {
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

async function getCountForUser(message: { author: { id: any; username: any; avatarURL: () => any; }; reply: (arg0: string) => void; createdAt: any; channel: { send: (arg0: any) => void; }; }) {
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
            .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data()!.reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.com/count?i=${dcid})`)
            .setFooter(message.author.username)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp(message.createdAt);
        console.log(upmbed);

        message.channel.send(upmbed);
    }
}

async function botTypeing(channel: any) {
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
      
    const req = https.request(options, (res: any) => {
        console.log(`statusCode: ${res.statusCode}`);
      
        res.on('data', (d: string | Buffer) => {
            process.stdout.write(d);
        });
    });
      
    req.on('error', (error: any) => {
        console.error(error);
    });
      
    req.write(data);
    req.end();
}
console.log(process.env.PROD);
const PROD = process.env.PROD;
botlogin(PROD);

async function getBotToken(PROD: string | undefined) {
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

async function accountLink(userRecord: { uid: any; }, message: { content: string; author: { id: any; }; reply: (arg0: string, arg1: undefined) => void; }) {
    const db = admin.firestore();
    let messageArray = message.content.split(" ");
    //let cmd = messageArray[0];
    let args: any = messageArray.slice(1);
    const userRef = db.collection("users").doc(userRecord.uid);
    const userDoc = await userRef.get();

    const dcUserRef = db.collection("dcusers").doc(message.author.id);
    // eslint-disable-next-line no-unused-vars
    //const dcUserDoc = await dcUserRef.get();

    if(userDoc.data()!.dclinked) {
        message.reply("This account is already linked!", args[1]);
    } else if(`${userDoc.data()!.dclink}` === args[1]) {
        dcUserRef.update({
            uid: message.author.id,
        });
        userRef.update({
            dclink: admin.firestore.FieldValue.delete(),
            dclinked: true,
            dcid: message.author.id,
        });
        message.reply("Account linked succesfuly!", undefined);
    } else {
        message.reply("Error linking account", undefined);
    }
}

async function botlogin(PROD: string | undefined) {
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        bot.login(doc.data()!.testtoken);
    } else if(PROD === "beta") {
        bot.login(doc.data()!.betatoken);
    } else {
        bot.login(doc.data()!.token);
    }
}

async function interactionResponse(interaction: { id: any; token: any; }, data: { type: number; data: { content: string; } | { embeds: any[]; } | { embeds: any[]; }; }) {
    await axios.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, {
        data: data
    })
}

async function apiurl() {
    const prodenv = process.env.PROD;
    if(!prodenv || prodenv === "beta") {
        return {
            ip: "http://10.8.2.188:8080",
        };
    } else {
        return {
            ip: "http://localhost:8080",
        };
    }
}

function msToTime(duration: number) {
    //var milliseconds = (duration % 1000) / 100
    const seconds1 = Math.floor((duration / 1000) % 60)
    const minutes1 = Math.floor((duration / (1000 * 60)) % 60)
    const hours1 = Math.floor((duration / (1000 * 60 * 60)) % 24);
  
    const hours = (hours1 < 10) ? "0" + hours1 : hours1;
    const minutes = (minutes1 < 10) ? "0" + minutes1 : minutes1;
    const seconds = (seconds1 < 10) ? "0" + seconds1 : seconds1;
  
    return hours + ":" + minutes + ":" + seconds;
  }

  async function getBansCache(id: string) {
    fs.readFile('./cache.json', 'utf8', (err: any, data: string) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
            throw err;
        } else {
    
            // parse JSON string to JSON object
            const cache = JSON.parse(data);
    
            // print all databases
            return {
                banned: cache.bans.reggelt.find((e: any) => e === id)
            }
        
        }
    
    });
  }

app.listen(3000);
