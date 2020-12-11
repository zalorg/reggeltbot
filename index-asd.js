const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone : false});
const fs = require('fs')
const DBL = require("dblapi.js");
var ms = require("ms");
const emote = require("./emoji.json");
const dbl = new DBL(process.env.DBL, bot);
var admin = require("firebase-admin");
var request = require('request');

/*
request(`https://firebasestorage.googleapis.com/v0/b/zal1000.appspot.com/o/serviceAccountKeys%2Freggeltbot.json?alt=media&token=${process.env.SAK}`, function (error, response, body) {
  if (!error && response.statusCode == 200) {
     const importedJSON = JSON.parse(body);
     console.log(importedJSON);
*/
     admin.initializeApp({
        credential: admin.credential.cert(require("./SAC.json")),
        databaseURL: "https://zal1000.firebaseio.com"
      });

      /////////////////////////////   BOT START //////////////////////////////////////////////////

      function foo() {
        if(process.env.PROD = true){
            if(bot.uptime === null){
              console.log("Bot just started")
            } else {
              var db = admin.database();
              var ref = db.ref("bots/status");
            ref.update({
              reggeltbotUp: ms(bot.uptime),
              reggeltbotPing: `${bot.ping}ms`,
              reggeltbotGuilds: bot.guilds.size
            })
            //  console.log(ms(bot.uptime))
            }} else{
              return;
            }
            
              setTimeout(foo, 1000);
            }
            
            foo();
        
        
            function foo2() {
                bot.guilds.forEach(function (guild) {
            //        message.reply(`${guild.name} Members: ${guild.memberCount}`);
            var guildname = guild.name;
            var membercount = guild.memberCount;
            var db = admin.database();
            var ref = db.ref("bots/reggeltbot/guilds/" + guild.id);
          ref.update({
            membercount: membercount,
            ownerid: guild.ownerID,
            guildname: guildname
          })
                  });
                
                  setTimeout(foo2, 100000);
                }
                
                foo2();
        
        /*
                bot.guilds.forEach(function (guild) {
                    message.reply(`${guild.name} Members: ${guild.memberCount}`);
                  });
        */
        dbl.on('posted', () => {
            return;
          })
          
          dbl.on('error', e => {
           console.log(`Oops! ${e}`);
          })
        
        bot.on("ready", async() => { //bot.on kezdete
            console.log(`${bot.user.username} has started`)
        
            var db = admin.database();
        const doc = admin.firestore().collection('dcusers').doc('all');
        const observer = doc.onSnapshot(docSnapshot => {
          //console.log(`Received doc snapshot: ${docSnapshot.data().reggeltcount}`);
          bot.user.setActivity(`[BOT SLOW]                  for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"})
          // ...
        }, err => {
          console.log(`Encountered error: ${err}`);
          bot.user.setActivity(`Encountered error: ${err}`, {type: "PLAYING"})
        });
        
        
        var refS = db.ref("bots/status/reggeltbotS");
        refS.on("value", function(snapshot) {
          bot.user.setStatus(snapshot.val())
          console.log(snapshot.val())
        }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        }); 
         /* 
            setInterval(function(){
                let status = statusok[Math.floor(Math.random() * statusok.length)];
                bot.user.setActivity(status, {type: "WATCING"}) 
            }, 3000) 
        
        */
        }); //itt vége a bot.on nak
         
         bot.once("disconnect", async() => {
             console.log("Bot disconnected!")
         })
        
         bot.once("reconnecting", async() => {
             console.log("Reconnecting...")
         })
        
        bot.on("guildCreate", async guild => {
          if(guild.channels.has() === "reggelt"){
            return;
          } else {
            guild.createChannel.name = "reggelt";
            }
        })
          
        bot.on("message", async message => { 
            let prefix = process.env.PREFIX; 
            let messageArray = message.content.split(" ");
            let cmd = messageArray[0];
            let args = messageArray.slice(1);
        
            require('log-timestamp');
            if(message.author.bot) return;
        
        
        /*
        
                if(!args[0]) return message.channel.send('Kérlek add meg a megfejtést!');
            if(args[0] === `${vsz}`) 
        
        */
            if(message.channel.id === "751938468225089646"){
                message.delete(1)
            }
        
            if(message.author.bot != true) {
              async function profileupdatefs() {
                var db = admin.firestore();
              const reggeltRef = db.collection('dcusers').doc(message.author.id);
              const doc = await reggeltRef.get();
              if (!doc.exists) {
                reggeltRef.set({
                  pp: message.author.avatarURL,
                  tag: message.author.tag,
                  username: message.author.username
                });
              } else {
                reggeltRef.update({
                  pp: message.author.avatarURL,
                  tag: message.author.tag,
                  username: message.author.username
                });
              }}
              profileupdatefs()
            }
        
            if(cmd === `${prefix}simplequeries`) {
              async function simplequeries() {
                var db = admin.firestore();
              const citiesRef = db.collection('cities');
        const snapshot = await citiesRef.where('capital', '==', true).get();
        if (snapshot.empty) {
          console.log('No matching documents.');
          return;
        };
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
         // message.channel.send(`${doc.id} => ${doc.data().name}`)
          let upmbed = new Discord.RichEmbed()
          .setTitle(`Test query`)
          .setColor("#FFCB2B")
          .addField(`is Capital`, doc.data().capital)
          .addField(`Country`, doc.data().country)
          .addField(`Name`, doc.data().name)
          .addField(`Population`, doc.data().population)
          .addField(`is State`, doc.data().state)
          .setFooter(`Firebase firestore test`)
          .setThumbnail("https://img.icons8.com/color/48/000000/firebase.png")
          .setTimestamp(message.createdAt)
        
          message.channel.send(upmbed);
        })}; simplequeries();
        
            }
        
            if(message.author.id === "423925286350880779"){
            if(message.content === `${prefix}reps`){
              message.delete(1);
              message.guild.members.forEach(function (member) {
                var userID = member.id;
                let getReputation = async (userID) => {
                  let rep = await drep.rep(userID);
                  console.log(`Member: ${member.displayName}, Upvotes: ${rep.upvotes}`);
                  var refRep = db.ref(`bots/userrep/${member.id}`);
                  refRep.update({
                    upvotes: rep.upvotes,
                    downvotes: rep.downvotes,
                    reputation: rep.reputation,
                    rank: rep.rank,
                    xp: rep.xp
                  })//.then(console.log("Database updated"))
        /*
                  let upmbed = new Discord.RichEmbed()
                  .setTitle(`Discoredrep (${member.displayName})`)
                  .setColor(member.displayHexColor)
                  .addField(`Upvotes`, rep.upvotes)
                  .addField(`Downvotes`, rep.downvotes)
                  .addField(`Reputation`, rep.reputation)
                  .addField(`Rank`, rep.rank)
                  .addField(`Xp`, rep.xp)
                  .setTimestamp(message.createdAt)
               
                  message.channel.send(upmbed);*/
               //   message.channel.send(`Name: ${member.displayName}, upvotes: ${rep.upvotes}, downvotes: ${rep.downvotes}, reputation: ${rep.reputation}, rank: ${rep.rank}, xp: ${rep.xp}`)
              }
              getReputation(userID);
              })
            }};
        //console.log("Successful query")
            if(message.content === `${prefix}rep`){
                let getReputation = async (userID) => {
                  let rep = await drep.rep(userID);
                  let upmbed = new Discord.RichEmbed()
                  .setTitle(`Discoredrep`)
                  .setColor("#FFCB2B")
                  .addField(`Upvotes`, rep.upvotes)
                  .addField(`Downvotes`, rep.downvotes)
                  .addField(`Reputation`, rep.reputation)
                  .addField(`Rank`, rep.rank)
                  .addField(`Xp`, rep.xp)
                  .setFooter(message.author.username)
                  .setThumbnail(message.author.avatarURL)
                  .setTimestamp(message.createdAt)
               
                  message.channel.send(upmbed);
              }
              getReputation(message.author.id);
            }
        
            if(cmd === `${prefix}guilds`){
                bot.guilds.forEach(function (guild) {
                    message.reply(`${guild.name} Members: ${guild.memberCount}`);
                  });
            }
            if(cmd === `${prefix}sadcat`){
              message.channel.send(emote.tick);
            }
        
            if(cmd === `${prefix}leaderboard`){
              async function leaderboard() {
                var db = admin.firestore();
                //////////////////////////////////////////////////
                db.collection("dcusers").where("reggeltcount", "!=", null).orderBy("reggeltcount").limitToLast(10)
            .get()
            .then(function(querySnapshot) {
        
        
              let leaderboard = new Discord.RichEmbed()
                .setTitle(`Help`)
                .setDescription("List of all commands")
                .setColor("#F8AA2A");
          
              querySnapshot.forEach((doc) => {
                leaderboard.addField(
                  `Name: ${doc.data().username}, Count: ${doc.data().reggeltcount}`,
                  `${doc.id}`,
                  true
                );
              });
            
              message.channel.send(leaderboard).catch(console.error);
        
                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                });
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
            });
            ///////////////////////////////////////////////////////
              }
              leaderboard();
            }
        
            if(cmd === `${prefix}fetch`){
              if(message.author.id === "423925286350880779"){
                message.guild.members.forEach(function (member) {
                  var database = admin.database();
                  var firestore = admin.firestore();
        
                  var ref = database.ref(`reggeltbot/${member.id}/reggeltcount`)
                  ref.once("value", function(snapshot) {
        
        
                    if(snapshot.val() === null){
                      return
                    } else {
                      console.log(`${member.displayName} count: ${snapshot.val()}`);
                      const docRef = firestore.collection('dcusers').doc(member.id);
                    docRef.set({
                      reggeltcount: snapshot.val()
                    })};
                    
                  });
                });
              } else {
                message.author.send("You cant use that!")
              }
            }
        
            if(message.content === `${prefix}count`){
              async function getCountForUser() {
                var db = admin.firestore();
                var dcid = message.author.id;
                const cityRef = db.collection('dcusers').doc(dcid);
        const doc = await cityRef.get();
        if (!doc.exists) {
          console.log('No such document!');
          message.reply("Error reading document!")
        } else {
          let upmbed = new Discord.RichEmbed()
          .setTitle(`${message.author.username}`)
          .setColor("#FFCB2B")
          .addField(`Ennyiszer köszöntél be a #reggelt csatornába`, `${doc.data().reggeltcount} [(Megnyitás a weboldalon)](https://reggeltbot.zal1000.com/count.html?=${dcid})`)
          .setFooter(message.author.username)
          .setThumbnail(message.author.avatarURL)
          .setTimestamp(message.createdAt)
        
          message.channel.send(upmbed);
        }
        
        
              }
              getCountForUser();
                    
               //    message.reply(`Ennyiszer köszöntél a #reggelt csatornába: **${snapshot.val()}** (https://reggeltbot.zal1000.com/count.html?=${dcid})`);
                
            }
            if(cmd === `${prefix}inv` || cmd === `${prefix}invite`){
                let upmbed = new Discord.RichEmbed()
                .setTitle("Invite")
                .setColor("#FFCB2B")
                .addField(`Köszönöm, hogy annyira megtetszett a bot, hogy a szerveredre akarod betenni! :heart:`, `[Katt ide a linkhez](https://discord.com/api/oauth2/authorize?client_id=749037285621628950&permissions=93184&redirect_uri=https%3A%2F%2Freggeltbot.zal1000.net&scope=bot)`)
                .addField(`Reggelt csatorna beállítása`, `Nevezz el egy csatornát **reggelt**-nek és kész`)
                .setFooter(message.author.username)
                .setThumbnail(bot.user.avatarURL)
                .setTimestamp(message.createdAt)
             
                message.channel.send(upmbed);
            }
        
            if(message.content === `${prefix}help`){
                let upmbed = new Discord.RichEmbed()
                .setTitle(message.author.username)
                .setColor("#FFCB2B")
                .addField(`${prefix}count`, `Megmondja, hogy hányszor köszöntél be a #reggelt csatornába (vagy [itt](https://reggeltbot.zal1000.com/count.html?=${message.author.id}) is megnézheted)`)
                .addField(`${prefix}invite`, `Bot meghívása`)
                .addField(`Reggelt csatorna beállítása`, `Nevezz el egy csatornát **reggelt**-nek és kész`)
                .addField(`top.gg`, `Ha bárkinek is kéne akkor itt van a bot [top.gg](https://top.gg/bot/749037285621628950) oldala`)
                .addBlankField()
                .addField(`Bot ping`, `${bot.ping}ms`)
                .addField(`Uptime`, `${ms(bot.uptime)}`)
                .setFooter(message.author.username)
                .setThumbnail(bot.user.avatarURL)
                .setTimestamp(message.createdAt)
             
                message.channel.send(upmbed);
            }
        /*
            if(message.content === `${prefix}accountHelp`){
                let upmbed = new Discord.RichEmbed()
                .setTitle(`List of all account command and useage`)
                .setColor("#FFCB2B")
                .addField(`${prefix}accountDisable`, `Use this command to disable your account. While your account is disabled you cant do anything.`)
                .addField(`${prefix}accountEnable`, `Use this command to reaneble your diabled account!`)
                .addField(`${prefix}accountPhoneUpdate <PHONE NUMBER HERE>`, `Use this command to update your phone number!`)
                .addField(`${prefix}accountEmailUpdate <EMAIL ADRESS HERE>`, `Use this command to update your email adress!`)
                .setFooter(message.author.username)
                .setTimestamp(message.createdAt)
             
                message.channel.send(upmbed);
            }
        */
            if (message.content === `${prefix}ping`) {
                message.reply(`Pong! (${bot.ping}ms)`);
                console.log(`ping: ${bot.ping}, user: ${message.author.username}, channel: ${message.channel.id}`);
              }
            if (message.author.id === "423925286350880779"){
                if (message.content === `${prefix}restart`){
                    console.log(`Restarting... (requested by.: ${message.author.tag})`)
                    message.channel.send("Restarting...")
                    bot.destroy()
                    bot.login(process.env.DCTOKEN)
                  }
            }
        
            if(cmd === `${prefix}firestore2`){
              const firestore = admin.firestore();
              const docRef = firestore.collection('dcusers').doc(message.author.id);
              docRef.update({
                tag: message.author.tag,
                username: message.author.username,
                pp: message.author.avatarURL
              });
            }
        
            if(message.channel.type != "dm"){
            if(message.guild.id === "541446521313296385" || message.guild.id != "541446521313296385") {
                var db = admin.database();
                var dcid = message.author.id;
                var refAdd = db.ref("dcusers/" + dcid);
              
        
                let getReputation2 = async (userID) => {
                  let rep = await drep.rep(userID);
                  var db = admin.database();
               //   console.log(`Member: ${message.author.username}}, Upvotes: ${rep.upvotes}`);
                  var refRep = db.ref(`bots/userrep/${message.author.id}`);
                  refRep.update({
                    upvotes: rep.upvotes,
                    downvotes: rep.downvotes,
                    reputation: rep.reputation,
                    rank: rep.rank,
                    xp: rep.xp
                  })
              }
              getReputation2(message.author.id);
            }
        
        
                  
        
            };
        
            if(message.channel.name === 'reggelt') {
        
               if(cmd.toLowerCase() === 'reggelt'){
        async function reggeltupdateall() {
        
          var db = admin.firestore();
          // Add a new document in collection "cities" with ID 'LA'
          const res = await db.collection('dcusers').doc('all').update({
            reggeltcount: admin.firestore.FieldValue.increment(1)
          });
          
        }
        reggeltupdateall();
        
        async function reggeltupdatefs() {
          var db = admin.firestore();
        const reggeltRef = db.collection('dcusers').doc(message.author.id);
        const doc = await reggeltRef.get();
        if (!doc.exists) {
          reggeltRef.set({
            reggeltcount: 1,
            pp: message.author.avatarURL,
            tag: message.author.tag,
            username: message.author.username
          });
        } else {
          reggeltRef.update({
            reggeltcount: admin.firestore.FieldValue.increment(1),
            pp: message.author.avatarURL,
            tag: message.author.tag,
            username: message.author.username
          });
        }}
        reggeltupdatefs()
                console.log('\x1b[32m%s\x1b[0m' ,`message passed in: "${message.guild}, by.: ${message.author.username} (id: "${message.guild.id}")"(HUN)`)
                message.react('☕');     
                }
            
                else {
                    
                    message.delete(1)
                    .then(console.log('\x1b[31m%s\x1b[0m' ,`message deleted in "${message.guild} (id: "${message.guild.id}")"(HUN)`))
                    .catch(function(error) {
                        message.reply("Error: " + error.message)
                      console.log('Error:', error);
                    })
                    message.author.send(`Ide csak reggelt lehet írni! (${message.guild})`)
                    .then(console.log('\x1b[33m%s\x1b[0m' ,`warning sent to: "${message.author.username} (id: "${message.author.id}")"(HUN)`))
                    .catch(function(error) {
                        message.reply("Error: " + error)
                      console.log('Error:', error);
                    })
        
                    var db = admin.firestore();
                    async function reggeltupdatefs2() {
                      var db = admin.firestore();
                    const reggeltRef = db.collection('dcusers').doc(message.author.id);
                    const doc = await reggeltRef.get();
                    if (!doc.exists) {
                      reggeltRef.set({
                        reggeltcount: -1,
                        pp: message.author.avatarURL,
                        tag: message.author.tag,
                        username: message.author.username
                      });
                    } else {
                      reggeltRef.update({
                        reggeltcount: admin.firestore.FieldValue.increment(-1),
                        pp: message.author.avatarURL,
                        tag: message.author.tag,
                        username: message.author.username
                      });
                    }}
                    reggeltupdatefs2()
                  }
               
            }
        
            if(message.channel.name === 'morning') {
        
                if(cmd.toLowerCase() === 'morning'){
                 console.log('\x1b[32m%s\x1b[0m' ,`message passed in: "${message.guild}, by.: ${message.author.username} (id: "${message.guild.id}")"(ENG)`)
                 message.react('☕');
        
                 async function reggeltupdatefsen() {
                  var db = admin.firestore();
                const reggeltRef = db.collection('dcusers').doc(message.author.id);
                const doc = await reggeltRef.get();
                if (!doc.exists) {
                  reggeltRef.set({
                    reggeltcount: 1,
                    pp: message.author.avatarURL,
                    tag: message.author.tag,
                    username: message.author.username
                  });
                } else {
                  reggeltRef.update({
                    reggeltcount: admin.firestore.FieldValue.increment(1),
                    pp: message.author.avatarURL,
                    tag: message.author.tag,
                    username: message.author.username
                  });
                }}
                reggeltupdatefsen()
                 }
             
                 else {
                     message.delete(1)
                     .then(console.log('\x1b[31m%s\x1b[0m' ,`message deleted in "${message.guild} (id: "${message.guild.id}")" (ENG)`))
                     .catch(function(error) {
                        message.reply("Error: " + error.message)
                      console.log('Error updating user:', error);
                    })
                     message.author.send(`You can only type "morning" here! (${message.guild})`)
                     console.log('\x1b[33m%s\x1b[0m' ,`warning sent to: "${message.author.username} (id: "${message.author.id}")"(ENG)`)
        
                     async function reggeltupdatefsen2() {
                      var db = admin.firestore();
                    const reggeltRef = db.collection('dcusers').doc(message.author.id);
                    const doc = await reggeltRef.get();
                    if (!doc.exists) {
                      reggeltRef.set({
                        reggeltcount: -1,
                        pp: message.author.avatarURL,
                        tag: message.author.tag,
                        username: message.author.username
                      });
                    } else {
                      reggeltRef.update({
                        reggeltcount: admin.firestore.FieldValue.increment(-1),
                        pp: message.author.avatarURL,
                        tag: message.author.tag,
                        username: message.author.username
                      });
                    }}
                    reggeltupdatefsen2()
                 }
                
             }
        
            if(message.content.toLocaleLowerCase() == "ping"){
                if(message.channel.type === "dm"){
                    message.reply(`Ping: ${bot.ping}ms`)
                    console.log('\x1b[34m%s\x1b[0m' ,`ping: ${bot.ping}ms (dm)`)
                }
            }
        
            if(message.content.toLocaleLowerCase() == 'reggelt'){
                if(message.channel.type === "dm"){
                    message.reply("Reggelt! :coffee:")
                    console.log('\x1b[34m%s\x1b[0m' ,`whisthing morning for ${message.author.username}`)
                }
            }
        
            if(message.content.toLocaleLowerCase() == 'guild' || message.content.toLocaleLowerCase() == 'guilds'){
                if(message.channel.type === "dm"){
                    let guildNames = bot.guilds.forEach()
                    message.reply(`The bot is in ${bot.guilds.size} guilds (${guildNames})`);
                    console.log('\x1b[34m%s\x1b[0m' ,`guilds number: ${bot.guilds.size} (dm)`)
                }
            }
        })
        
        
        bot.login("NOPE");

/////////////////////////////////////////////////// BOT END  ////////////////////////////////////////////////

  
//})

