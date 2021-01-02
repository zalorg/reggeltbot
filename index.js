/* eslint-disable quotes */
/* eslint-disable no-undef */
const Discord = require("discord.js");
const bot = new Discord.Client();
const DBL = require("dblapi.js");
let ms = require("ms");
let admin = require("firebase-admin");

if(process.env.PROD === "false") {
    console.log("profiler not started");
} else {
    require('@google-cloud/profiler').start({
        serviceContext: {
            service: 'reggeltbot',
            version: '1.0.0'
        }
    }).catch((err) => {
        console.log(`Failed to start profiler: ${err}`);
    });
    console.log("profiler started");
}

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
    const countCMD = {
        name: "count",
        description: "Ennyiszer köszöntél be a #reggelt csatornába"
        // possible options here e.g. options: [{...}]
    };
    
    const factCMD = {
        name: "fact",
        description: "Random fact",
        // possible options here e.g. options: [{...}]
        options: [
            {
                "name": "Options",
                "description": "Command options",
                "type": 3,
                "required": true,
                "choices": [
                    {
                        "name": "Add",
                        "value": "add"
                    },
                    {
                        "name": "Get",
                        "value": "get"
                    },
                ]
            },
            {
                name: 'id',
                description: 'Fact id here (only works with get)',
                type: 3,
                required: false

            },
            {
                name: 'by',
                description: ' (only works with get)',
                type: 6,
                required: false,
            }
        ]
    };
    const testCommandData = {
        name: "help",
        description: "List of all commands"
    };

    const ciuntCMD = {
        name: "ciunt",
        description: "Ennyiszer köszöntél be a #reggelt csatornába"
    };

    bot.api.applications(bot.user.id).guilds('541446521313296385').commands.post({
        data: ciuntCMD,
    }).catch(err => {
        dcApiError(err);
    });

    bot.api.applications(bot.user.id).guilds('738169002085449748').commands.post({
        data: testCommandData
    }).catch(err => {
        dcApiError(err);
    });

    bot.api.applications(bot.user.id).guilds('738169002085449748').commands.post({
        data: factCMD
    }).catch(err => {
        dcApiError(err);
    });

    bot.api.applications(bot.user.id).commands.post({
        data: countCMD,
    }).catch(err => {
        dcApiError(err);
    });

    function dcApiError(err) {
        if(err.code === 50001) {
            return;
        } else {
            console.log(err);
        }
    }
    
    bot.ws.on('INTERACTION_CREATE', async interaction => {
        const command = interaction.data.name.toLowerCase();
        //const args = interaction.data.options;
        if (command === 'count'){
            const userref = admin.firestore().collection("dcusers").doc(interaction.member.user.id);
            const doc = await userref.get();

            let embed = {
                color: 0xFFCB5C,
                title: interaction.member.user.username,
                thumbnail: {
                    url: doc.data().pp,
                },
                fields: [
                    {
                        name: "Ennyiszer köszöntél be a #reggelt csatornába",
                        value: `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.zal1000.com/count.html?=${interaction.member.user.id})`,
                    },
                ],
                footer: {
                    text: interaction.member.user.username,
                },
            };

            bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        "embeds": [embed],
                    }
                }
            });
        } else if(command === "ciunt") {
            const userref = admin.firestore().collection("dcusers").doc(interaction.member.user.id);
            const doc = await userref.get();

            let embed = {
                color: 0xFFCB5C,
                title: interaction.member.user.username,
                thumbnail: {
                    url: doc.data().pp,
                },
                fields: [
                    {
                        name: "Ennyiszer köszöntél be a #reggelt csatornába",
                        value: `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.zal1000.com/count.html?=${interaction.member.user.id})`,
                    },
                ],
                footer: {
                    text: interaction.member.user.username,
                },
            };

            bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        "embeds": [embed],
                    }
                }
            });
        } else if(command === "help") {

            let prefix = "r!";

            let embed = {
                color: 0xFFCB5C,
                title: "Commands",

                fields: [
                    {
                        name: `${prefix}count`,
                        value: `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.zal1000.com/count.html?=${interaction.member.user.id}) is megnézheted)`,
                    },                
                    {
                        name: `${prefix}invite`,
                        value: "Bot meghívása",
                    },                
                    {
                        name: "Reggelt csatorna beállítása",
                        value: "Nevezz el egy csatornát **reggelt**-nek és kész",
                    },                
                    {
                        name: "top.gg",
                        value: "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala",
                    },                
                    {
                        name: "Probléma jelentése",
                        value: "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni",
                    },
                ],
                footer: {
                    text: interaction.member.user.username,
                },
            };
            bot.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        "embeds": [embed],
                    }
                }
            });
        } else if(command === "fact") {

            if(interaction.data.options[0].value === "get") {
                if(!interaction.data.options[1]) {
                    //////////////////////////////////////////////  random fact  ////////////////////////////////////////////////////////////////////////////////
                    const db = admin.firestore();
                    var quotes = db.collection("facts");
                    var key2 = quotes.doc().id;
                    quotes.where(admin.firestore.FieldPath.documentId(), '>=', key2).limit(1).get()
                        .then(snapshot => {
                            if(snapshot.size > 0) {
                                snapshot.forEach(doc => {
                                    sendFactSlas(doc.id, doc.data(), interaction);

                                });
                            } else {
                                quotes.where(admin.firestore.FieldPath.documentId(), '<', key2).limit(1).get()
                                    .then(snapshot => {
                                        snapshot.forEach(doc => {
                                            sendFactSlas(doc.id, doc.data(), interaction);
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


                } else {
                    //////////////////////////////////////////////  fact with id  ///////////////////////////////////////////////////////////////////////////////

                    /*

                    */
                    const db = admin.firestore();
                    const ref = db.collection("facts").doc(interaction.data.options[1].value);
                    const doc = await ref.get();
                    if(!doc.exists) {
                        bot.api.interactions(interaction.id, interaction.token).callback.post({
                            data: {
                                type: 4,
                                data: {
                                    "content": "Cannot find that fact!",
                                }
                            }
                        });                    
                    } else {
                        let upmbed = new Discord.MessageEmbed()
                            .setTitle(`Random fact by.: ${docdata.author}`)
                            .setColor("#FFCB5C")
                            .addField("Fact", `${docdata.fact}`)
                            .addField("Fact id", `${docid}`)
                            .addBlankField()
                            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
                            .setFooter(`${docdata.author}`)
                            .setTimestamp(message.createdAt);
                        
                        console.log(upmbed);
                    }
                }
            }
        }
    });


    const db = admin.database();
    const doc = admin.firestore().collection("dcusers").doc("all");
    doc.onSnapshot(docSnapshot => {
        bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"});
    }, err => {
        console.log(`Encountered error: ${err}`);
        bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"});
    });
  
  
    const refS = db.ref("bots/status/reggeltbotS");
    refS.on("value", function(snapshot) {
        if(process.env.PROD === "false"){
            bot.user.setStatus("dnd");
            console.log("bot started in test mode");
        } else {
            bot.user.setStatus(snapshot.val());
            console.log(snapshot.val());
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
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

bot.on("message", async message => {
    if(message.author.bot) return;
    let prefix = (await getPrefix()).prefix; 
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    // reggelt
    if(message.channel.name === "reggelt") {
        
        if(message.content.toLowerCase().includes("reggelt")){
            
            await reggeltupdateall();
            await reggeltupdatefs(message);

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
            .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.zal1000.com/count.html?=${message.author.id}) is megnézheted)`)
            .addField(`${prefix}invite`, "Bot meghívása")
            .addField("Reggelt csatorna beállítása", "Nevezz el egy csatornát **reggelt**-nek és kész")
            .addField("top.gg", "Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala")
            .addField("Probléma jelentése", "Ha bármi problémát észlelnél a bot használata közben akkor [itt](https://github.com/zal1000/reggeltbot/issues) tudod jelenteni")
            .addBlankField()
            .addField("Bot ping", `${bot.ping}ms`)
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
            const db = admin.firestore();
            admin
                .auth()
                .getUserByEmail(args[0])
                .then((userRecord) => {
                    async function asd() {
                        const userRef = db.collection("users").doc(userRecord.uid);
                        const userDoc = await userRef.get();

                        const dcUserRef = db.collection("dcusers").doc(message.author.id);
                        // eslint-disable-next-line no-unused-vars
                        const dcUserDoc = await dcUserRef.get();

                        if(userDoc.data().dclinked) {
                            message.reply("This account is already linked!", args[1]);
                        } else if(`${userDoc.data().dclink}` === args[1]) {
                            dcUserRef.update({
                                dcid: message.author.id,
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
                    } asd();
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
    }
});

async function sendFactSlas(docid, docdata, interaction) {
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
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`);

        bot.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    "embeds": [upmbed],
                }
            }
        });    
    } else if(!userDoc.data().dcid) {

        let upmbed = new Discord.MessageEmbed()
            .setTitle(`Random fact by.: ${docdata.author}`)
            .setColor("#FFCB5C")
            .addField("Fact", docdata.fact)
            .addField("Fact id", docid)
            .addField('\u200B', '\u200B')
            .addField("Add your fact", `You can add your fact [here](https://facts.zal1000.com/) (to display discord info, link your discord account [here](https://dclink.zal1000.com/))`)
            .setFooter(docdata.author);

        bot.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    "embeds": [upmbed],
                }
            }
        });        
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
            .setThumbnail(dcDoc.data().pp);

        bot.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: {
                    "embeds": [upmbed],
                }
            }
        });
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
        message.reply('Restarting container...');
        bot.destroy();
        process.exit();
    } else {
        message.reply('Nope',);
        console.log(message.author.id);
        console.log(doc.data().ownerid);
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
    console.log("");
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
    await db.collection("dcusers").doc("all").update({
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
    await db.collection("dcusers").doc("all").update({
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
            .addField("Ennyiszer köszöntél be a #reggelt csatornába", `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.zal1000.com/count.html?=${dcid})`)
            .setFooter(message.author.username)
            .setThumbnail(message.author.avatarURL())
            .setTimestamp(message.createdAt);
        
        console.log(upmbed);

        message.channel.send(upmbed);
    }
}
console.log(process.env.PROD);
const PROD = process.env.PROD;
botlogin(PROD);

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
