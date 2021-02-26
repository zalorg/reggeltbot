import * as admin from 'firebase-admin';
import axios = require('axios');
import * as Discord from 'discord.js';
import ms = require('ms');
module.exports = {
    name: 'INTERACTION_CREATE',
    execute(bot:any) {
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
    }
}


async function interactionResponse(interaction: { id: any; token: any; }, data: { type: number; data: { content: string; } | { embeds: any[]; } | { embeds: any[]; }; }) {

    axios.default.post(`https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`, {
        headers: {
            'Content-Type': 'application/json',
        },
        data: data
    }).catch(e => {
        console.log(e)
    })
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