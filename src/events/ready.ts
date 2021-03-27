import * as admin from 'firebase-admin';
import fs = require('fs');
import DBL = require('dblapi.js');
import { Client } from 'discord.js'
//import * as axios from 'axios';
import * as git from 'nodegit';
import * as qdb from 'quick.db'

module.exports = {
    name: 'ready',
    execute(bot: Client) {
        bot.on("ready", async () => {
            //console.log(qdb.fetchAll())
            if(qdb.fetchAll().length === 0) {
                console.log('a')
                process.exit();
            }

            switch(process.env.PROD) {
                case('false'): 
                    qdb.set('version', "testing");
                    break;

                case('beta'):
                    qdb.set('version', "beta");
                    break;
                
                default:

                    try {
                        (await git.Clone.clone('https://github.com/zal1000/reggeltbot', './tmp/repo')).getHeadCommit().then(commit => {
                            console.log(commit.sha())
                        })
                    } catch(e) {
                        //console.log(e)
                    }
                    
                    git.Repository.open('./tmp/repo').then(repo => {
                        repo.getHeadCommit().then(commit => {
                            console.log(commit.sha())
        
                            const a = commit.sha().split('');
        
                            const version = `${a[0]}${a[1]}${a[2]}${a[3]}${a[4]}${a[5]}${a[6]}`
        
                            qdb.set('version', version);
        
                            //console.log(version)
                        })
                    })

            }


            

            if(!process.env.PROD) {
                //waikupdate(bot)
            }

            sendCommands()

            const dblToken = (await admin.firestore().collection('bots').doc('reggeltbot').get()).data()?.dblToken
            const dbl = new DBL(dblToken, bot);
            dbl.on('posted', () => {
                console.log('posted')
            })
            dbl.webhook?.on('vote', vote => {
                console.log(`User with ID ${vote.user} just voted!`);
                console.log(vote)
                admin.firestore().collection('dbl').add({
                    vote: vote
                })
            });
            const bansRef = admin.firestore().collection('bots').doc('reggeltbot').collection('bans').doc('global');
            bansRef.onSnapshot(snap => {
                const bans = {
                    bans: snap.data()!.bans
                }
                console.log(bans)
                fs.writeFileSync('./cache/global-bans.json', JSON.stringify(bans))
            })

            const activities_list = [
                `for ${qdb.get('global.reggeltcount') || 'some'} morning messages`,
                `version: ${qdb.get('version')}`
            ]

            let num = 0;

            setInterval(() => {
                //console.log(qdb.get('global.reggeltcount'))
                if(num === (activities_list.length)) {
                    //console.log('reseted')
                    num = 0;
                    //console.log(num)
                }
                //const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
                bot.user!.setActivity(activities_list[num], {type: "WATCHING"}).then(() => {
                    //console.log(activities_list[num]);
                    //console.log(num)
                    num = num + 1;
                })

                //console.log(activities_list.length - 1)
            }, 10000);

            console.log(`${bot.user!.username} has started`);
        
        });

    }
}

function sendCommands() {
/*
    send({
        "name": "count",
        "description": "Ennyiszer köszöntél be a #reggelt csatornába",
        "options": [
            {
                "name": "user",
                "description": "The user to get",
                "type": 6,
                "required": false
            }
        ]
    })
    */
    
}
/*
async function waikupdate(bot: Client) {
    const db = admin.firestore();


    const waik = await bot.guilds.fetch('541446521313296385');

    const metrics = db.doc(`bots/reggeltbot/config/${waik.id}`);

    metrics.update({
        m3: 0,
        m6: 0,
        y1: 0,
        y2: 0,
    })
    const logchannel = await bot.channels.fetch('763040615080263700', false, true);
    if(logchannel.isText()) {
        logchannel.send("Waik members sync started")
    }
    waik.members.cache.forEach(async member => {


        //const joinref = await admin.firestore().doc(`dcusers/${member.id}/guilds/${waik.id}`).get();
        const join = member.joinedTimestamp!;
        const m3 = 3 * 2592000000;
        const m6 = 6 * 2592000000;
        const y1 = 12 * 2592000000;
        const y2 = 24 * 2592000000;
        const now = Date.now();

        //console.log(join)

        //1 day 86400000 ms

        //newbee 821417192339275887


        if(join + 86400000 > now) {
            waik.member(member.id)?.roles.add('821417192339275887').then(async member => {
                sendlog(member, undefined, "newbee")
                console.log(member.user.tag);

            }).catch(e => {
                console.log(`Error adding ${member.user.tag} to newbee Err: ${e}`);

            })
        } else {
            waik.member(member.id)?.roles.remove('821417192339275887').then(async member => {
                //sendlog(member, undefined, "newbee")
            })
        }

        if(!member.user.bot) {
            sendlog(member, undefined, "bot")
        } else if(join + y2 < now) {
            waik.member(member.id)?.roles.remove("814303109966200864").then(async member => {
                if(logchannel.isText()) {
                    logchannel.send("Waik members sync started")
                }
            }).catch

            waik.member(member.id)?.roles.add('814303501512343622').then(member => sendlog(member, undefined, "y2")).catch(e => sendlog(member, e.message, "y2"))
            metrics.update({
                y2: admin.firestore.FieldValue.increment(1),
            })
        } else if(join + y1 < now) {
            waik.member(member.id)?.roles.add('814303109966200864').then(member => sendlog(member, undefined, "y1")).catch(e => sendlog(member, e.message, "y1"))
            metrics.update({
                y1: admin.firestore.FieldValue.increment(1),
            })
        } else if(join + m6 < now) {
            waik.member(member.id)?.roles.add('814302832031301683').then(member => sendlog(member, undefined, "m2")).catch(e => sendlog(member, e.message, "m6"))
            metrics.update({
                m6: admin.firestore.FieldValue.increment(1),
            })
        } else if(join + m3 < now) {
            //waik.member(member.id)?.roles.add('814302832031301683').catch(e => console.error(e.message))
            metrics.update({
                m3: admin.firestore.FieldValue.increment(1),
            })
        }

    })

    async function sendlog(member: GuildMember, err: string | undefined, role: string) {
        const logchannel = await bot.channels.fetch('763040615080263700', false, true);
        if(logchannel.isText()) {
            if(err) {
                if(role === "y2") {
                    logchannel.send(`<@${member.id}> failed to added to **y2** Error: **${err}**`)
                } else if(role === "y1") {
                    logchannel.send(`<@${member.id}> failed to added to **y1** Error: **${err}**`)
                } else if(role === "m6") {
                    logchannel.send(`<@${member.id}> failed to added to **m6** Error: **${err}**`)
                } else if(role === "bot") {
                    logchannel.send('bot ignored')
                }

                // Err end
            } else {
                if(role === "y2") {
                    logchannel.send(`<@${member.id}> added to **y2**`)
                } else if(role === "y1") {
                    logchannel.send(`<@${member.id}> added to **y1**`)
                } else if(role === "m6") {
                    logchannel.send(`<@${member.id}> added to **m6**`)
                }
            }
        }
    }
}

*/