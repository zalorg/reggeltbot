import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Discord from 'discord.js';

admin.initializeApp()

const db = admin.firestore();

const client = new Discord.Client()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const senddcmessage = functions.firestore.document('/bots/reggeltbot/sendmessage/{docID}').onCreate(async (snapshot, context) => {

    const channel = client.channels.cache.find(channel => channel.id === snapshot.data().id)

    console.log(channel);

    const db = admin.firestore()
    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();

    client.login(doc.data()!.token)

    console.log(snapshot.data());
    console.log(context);

});


export const waik_roles_update = functions.pubsub.topic('waik-roles-update').onPublish(async (message) => {

    setTimeout(async () => {
        const bot = new Discord.Client();

        const botRef = db.collection("bots").doc("reggeltbot");
        const doc = await botRef.get();
    
        bot.on('ready', async () =>{
    
            const waik = await bot.guilds.fetch('541446521313296385');
    
            const metrics = db.doc(`bots/reggeltbot/config/${waik.id}`);
    
            metrics.update({
                m3: 0,
                m6: 0,
                y1: 0,
                y2: 0,
            })
            
            waik.members.cache.forEach(async member => {
                const joinref = admin.firestore().doc(`dcusers/${member.id}/guilds/${waik.id}`);
                const joindoc = await joinref.get();
                const join = member.joinedTimestamp!;
                const m3 = 3 * 2592000000;
                const m6 = 6 * 2592000000;
                const y1 = 12 * 2592000000;
                const y2 = 24 * 2592000000;
                const now = Date.now();

                if(joindoc.exists) {
                    joinref.update({
                        joinedTimestamp: member.joinedTimestamp,
                        joinedAt: member.joinedAt,
                        color: member.displayColor,
                        colorHEX: member.displayHexColor,
                    })
                } else {
                    joinref.set({
                        joinedTimestamp: member.joinedTimestamp,
                        joinedAt: member.joinedAt,
                        color: member.displayColor,
                        colorHEX: member.displayHexColor,
                    }, {
                        merge: true,
                    })
                }
        
                if(join + y2 < now) {
                    waik.member(member.id)?.roles.add('814303501512343622').catch(e => console.error(e.message))
                    metrics.update({
                        y2: admin.firestore.FieldValue.increment(1),
                    })
                } else if(join + y1 < now) {
                    waik.member(member.id)?.roles.add('814303109966200864').catch(e => console.error(e.message))
                    metrics.update({
                        y1: admin.firestore.FieldValue.increment(1),
                    })
                } else if(join + m6 < now) {
                    waik.member(member.id)?.roles.add('814302832031301683').catch(e => console.error(e.message))
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
        })

        bot.login(doc.data()!.token);

        return;
    }, 60000);

},)

export const updateAllGuild = functions.pubsub.topic('updateAllGuild').onPublish(async message => {
    functions.logger.info('function started')
    setTimeout(async () => {
        const bot = new Discord.Client();

        const botRef = db.collection("bots").doc("reggeltbot");
        const doc = await botRef.get();
    
        bot.on('ready', async () => {
    
            const logsguild = await bot.guilds.fetch('738169002085449748');
            const logschannel = logsguild.channels.cache.find(c => c.name === "gcloud-logs")
            if(logschannel && logschannel.isText()) {
                logschannel.send('updateAllGuild started')
            }
    
            bot.guilds.cache.forEach(guild => {
                guild.members.cache.forEach(async member => {
                    const ref = admin.firestore().doc(`/dcusers/${member.id}/guilds/${guild.id}`);
                    const doc = await ref.get();
                    const gme = member
    
                    const userref = admin.firestore().doc(`dcusers/${member.id}`);
                    //const userdoc = await userref.get();
    
                    if(!member.user.bot) {
                        userref.set({
                            pp: member.user.avatarURL({dynamic: true}),
                            tag: member.user.tag,
                            username: member.user.username,
                            discriminator: member.user.discriminator,
                        }, {merge: true}).catch(e => console.error(e));
                    }
    
                    if(member.user.bot){ 
                        console.log('bot ignored')
                    } else if(doc.exists) {
                        ref.set({
                            joinedTimestamp: member.joinedTimestamp,
                            joinedAt: member.joinedAt,
                            name: guild.name,
                            owner: guild.ownerID,
                            icon: guild.iconURL(),
                            permissions: {
                                ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
                                MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
                                MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
                                MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES"),                
                            },
                            allpermissions: gme.permissions.toArray(),
                            color: member.displayColor,
                            colorHEX: member.displayHexColor,
                            nick: member.nickname,
                        }, {merge: true}).then(d => console.log(`${member.user.username} updated`)).catch(e => errhandler(e));
                    } else {
                        ref.set({
                            joinedTimestamp: member.joinedTimestamp,
                            joinedAt: member.joinedAt,
                            name: guild.name,
                            owner: guild.ownerID,
                            icon: guild.iconURL(),
                            permissions: {
                                ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
                                MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
                                MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
                                MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES"),                
                            },
                            allpermissions: gme.permissions.toArray(),
                            color: member.displayColor,
                            colorHEX: member.displayHexColor,
                            nick: member.nickname,
                        }).then(d => console.log(`${member.user.username} added`)).catch(e => errhandler(e));
                    }
                })
                if(logschannel && logschannel.isText()) {
                    logschannel.send(`Function **updateAllGuild** finished`)
                }

            })
    
            async function errhandler(e: any) {
                if(logschannel && logschannel.isText()) {
                    logschannel.send(`Error in **updateAllGuild** function: ${e.message}`)
                }
            }
        })
    
    
        bot.login(doc.data()!.token); 

        return;
    }, 60000);


})

export const updateAllGuild2 = functions.https.onRequest(async (req, res) => {
    const bot = new Discord.Client();

    const botRef = db.collection("bots").doc("reggeltbot");
    const doc = await botRef.get();

    bot.on('ready', async () =>{

        bot.guilds.cache.forEach(guild => {
            guild.members.cache.forEach(async member => {
                const ref = admin.firestore().doc(`/dcusers/${member.id}/guilds/${guild.id}`);
                const doc = await ref.get();
                const gme = member

                const userref = admin.firestore().doc(`dcusers/${member.id}`);
                //const userdoc = await userref.get();

                if(!member.user.bot) {
                    userref.set({
                        pp: member.user.avatarURL({dynamic: true}),
                        tag: member.user.tag,
                        username: member.user.username,
                        discriminator: member.user.discriminator,
                    }, {merge: true}).catch(e => console.error(e));
                }

                if(member.user.bot){ 
                    console.log('bot ignored')
                } else if(doc.exists) {
                    ref.set({
                        joinedTimestamp: member.joinedTimestamp,
                        joinedAt: member.joinedAt,
                        name: guild.name,
                        owner: guild.ownerID,
                        icon: guild.iconURL(),
                        permissions: {
                            ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
                            MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
                            MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
                            MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES"),                
                        },
                        allpermissions: gme.permissions.toArray(),
                        color: member.displayColor,
                        colorHEX: member.displayHexColor,
                        nick: member.nickname,
                    }, {merge: true}).then(d => console.log(`${member.user.username} updated`)).catch(e => console.log(e));
                } else {
                    ref.set({
                        joinedTimestamp: member.joinedTimestamp,
                        joinedAt: member.joinedAt,
                        name: guild.name,
                        owner: guild.ownerID,
                        icon: guild.iconURL(),
                        permissions: {
                            ADMINISTRATOR: gme.hasPermission("ADMINISTRATOR"),
                            MANAGE_CHANNELS: gme.hasPermission("MANAGE_CHANNELS"),
                            MANAGE_GUILD: gme.hasPermission("MANAGE_GUILD"),
                            MANAGE_MESSAGES: gme.hasPermission("MANAGE_MESSAGES"),                
                        },
                        allpermissions: gme.permissions.toArray(),
                        color: member.displayColor,
                        colorHEX: member.displayHexColor,
                        nick: member.nickname,
                    }).then(d => console.log(`${member.user.username} added`)).catch(e => console.log(e));
                }
            })
        })
    })

    

    bot.login(doc.data()!.token);

    res.send(200);
})