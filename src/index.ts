import axios from "axios";
//import Discord = require("discord.js");
import * as Discord from 'discord.js';
import fs = require('fs');
//const bot: { message: { channel: { name: any }; }; user: { username: string; setActivity: Function} } = new Discord.Client();
const bot: any = new Discord.Client();
import DBL = require("dblapi.js");
import * as admin from 'firebase-admin';
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

bot.events = new Discord.Collection();
bot.commands = new Discord.Collection();
bot.wsevents = new Discord.Collection();

let dblRef = rdb.ref("bots/reggeltbot/dblToken");
dblRef.once("value", function(snapshot: { val: () => any; }) {
    new DBL(snapshot.val(), bot);
    console.debug(snapshot.val());
}, function (errorObject: { code: string; }) {
    console.log("The read failed: " + errorObject.code);
});

const commandFiles = fs.readdirSync('./dist/commands/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const m = file.split(".", 1)
    const command = require(`./commands/${m[0]}`);
    console.log(command)
    bot.commands.set(command.name, command)
}

const eventFiles = fs.readdirSync('./dist/events/').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const m = file.split(".", 1)
    const event = require(`./events/${m[0]}`);
    console.log(event)
    bot.events.set(event.name, event)
}

const wseventFiles = fs.readdirSync('./dist/events/ws/').filter(file => file.endsWith('.js'));
for (const file of wseventFiles) {
    const m = file.split(".", 1)
    const event = require(`./events/ws/${m[0]}`);
    console.log(event)
    bot.wsevents.set(event.name, event)
    bot.wsevents.get(event.name).execute(bot);

}
console.log(bot.events.get('ready'))
bot.events.get('ready').execute(bot);
//bot.events.get('rAdd').execute(bot);
bot.events.get('msgUpdate').execute(bot);



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
        await bot.events.get('reggelt').execute(message);
    }
    
    // help
    else if(message.content === `${prefix}help`){
        bot.commands.get('help').execute(message, prefix, bot)
    }

    //count 
    else if(message.content === `${prefix}count`){
        await bot.commands.get('count').execute(message);
    }
    else if(cmd === `${prefix}link`) {
        bot.commands.get('link').execute(message, args)
    } else if(cmd === `${prefix}fact`) {
        bot.commands.get('fact').execute(message, args)
    } else if (cmd === `${prefix}restart`) {
        await restartRequest(message);
    } else if (cmd === `${prefix}ping`) {
        bot.commands.get('ping').execute(bot, args, message)
    } else if (cmd === `${prefix}leaderboard`) {
        await bot.commands.get('leaderboard').execute(message, args);

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



console.log(process.env.PROD);
const PROD = process.env.PROD;
botlogin(PROD);

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


app.listen(3000);
