import axios = require('axios');
import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import fs = require('fs')
import { Client, Message } from 'discord.js';
module.exports = {
    name: 'ping',
    async execute(bot: Client, args: any, message: Message) {

        const langcode = JSON.parse(fs.readFileSync('./cache/guilds.json', 'utf8'));

        const guildsettings: Guildconfig = langcode.guilds[message.guild!.id]

        const lang = JSON.parse(fs.readFileSync(`./lang/${guildsettings.lang}.json`, 'utf8')).commands.ping;

        axios.default.defaults.headers.common['Authorization'] = `Bot ${(await botlogin())}`;
        await axios.default.post(`https://discord.com/api/v8/channels/${message.channel.id}/typing`).catch(err => {
            console.log(`Error: ${err.message}`)
        })
        const pingss = await pings(bot, lang);
        /*const greenEmote = message.guild.emojis.cache.get('809931766642245663');
        const redEmote = message.guild.emojis.cache.get('809931766601220096');
        const yellowEmote = message.guild.emojis.cache.get('809933477608816702');*/
        const pingval = 500;
        const greenEmote = '<:greenTick:809931766642245663>'
        const redEmote = '<:redTick:809931766601220096>'
        const yellowEmote = '<:pendingClock:809933477608816702>'

        let embed = new Discord.MessageEmbed()
        .setFooter(message.author.username)
        .setTimestamp(Date.now());

        if(pingss.find(element => element.err)) {
            if(pingss.find(element => element.status)) {
                // some ok some not ok
                embed.setColor("#E67E22").setTitle(lang.po)
            } else {
                // none ok
                embed.setColor("#E74C3C").setTitle(lang.mo)
            }
        } else if(pingss.find(element => element.status)) {
            // all ok
            if(pingss.find(element => element.ping > pingval)) {
                embed.setColor("#F1C40F").setTitle(lang.dp)
            } else{
                embed.setColor("#188038").setTitle(lang.aso)
            }
        }

        if(!pingss.find(element => element.err)) {


            pingss.forEach(ping => {
                if(ping.status === 200) {


                    if(ping.ping > pingval) {
                        embed.addField(ping.name, `${yellowEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    } else {
                        embed.addField(ping.name, `${greenEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    }
                } else if(!ping.status) {
                    embed.addField(ping.name, `${redEmote} Error: **${ping.err}**`.replace('Error:', `${lang.error}:`))
                }
            })

            message.channel.send(embed);
        } else if(pingss.find(element => element.status)) {

            pingss.forEach(ping => {
                if(ping.status === 200) {
                    if(ping.ping > pingval) {
                        embed.addField(ping.name, `${yellowEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    } else {
                        embed.addField(ping.name, `${greenEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    }
                } else if(!ping.status) {
                    embed.addField(ping.name, `${redEmote} Error: **${ping.err}**`.replace('Error:', `${lang.error}:`))
                }
            })

            message.channel.send(embed);
        } else {

            pingss.forEach(ping => {
                if(ping.status === 200) {
                    if(ping.ping > pingval) {
                        embed.addField(ping.name, `${yellowEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    } else {
                        embed.addField(ping.name, `${greenEmote} Status: **${ping.data}** Ping: **${ping.ping}ms**`.replace('Status', `${lang.status}`))
                    }
                } else if(!ping.status) {
                    embed.addField(ping.name, `${redEmote} Error: **${ping.err}**`.replace('Error:', `${lang.error}:`))
                }
            })

            message.channel.send(embed);
        }
    }
}

async function pings(bot: any, lang: any) {
    const array: { name: string; status: any; err: any; ping: any; data: any; }[] = [];

    const internalapi = await apiurl();

    array.push({
        name: lang.gateway,
        status: 200,
        err: null,
        ping: bot.ws.ping,
        data: 'OK'
    })
    
    let date2 = Date.now();

    await axios.default.get(`${internalapi.ip}/ping`).then(res => {
        array.push({
            name: lang.internal,
            status: res.status,
            err: null,
            ping: Date.now() - date2,
            data: res.data,
        })
    }).catch(err => {
        array.push({
            name: lang.internal,
            status: err.status,
            err: err.message,
            ping: null,
            data: err.data,
        })
    })

    let date3 = Date.now();

    await axios.default.get(`https://zal1000.ew.r.appspot.com/ping`).then(res => {
        array.push({
            name: 'App Engine',
            status: res.status,
            err: null,
            ping: Date.now() - date3,
            data: res.data,
        })
    }).catch(err => {
        array.push({
            name: 'App Engine',
            status: err.status,
            err: err.message,
            ping: null,
            data: err.data,

        })
    })
    let date4 = Date.now();

    await axios.default.get(`https://api-zd72hz742a-uc.a.run.app/ping`).then(res => {
        array.push({
            name: 'Cloud Run',
            status: res.status,
            err: null,
            ping: Date.now() - date4,
            data: res.data,
        })
    }).catch(err => {
        array.push({
            name: 'Cloud Run',
            status: err.status,
            err: err.message,
            ping: null,
            data: err.data,
        })
    })

    console.log(array);
    return array;

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

async function botlogin() {
    const PROD = process.env.PROD
    const db = admin.firestore();
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();
    if(PROD === "false") {
        return doc.data()!.testtoken;
    } else if(PROD === "beta") {
        return doc.data()!.betatoken;
    } else {
        return doc.data()!.token;
    }
}

interface Guildconfig {
    cd: number,
    disabled: boolean,
    lang: string,
    premium: boolean,
    reggeltlang: string,
    testing: boolean,
}