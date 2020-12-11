const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs')
//const DBL = require("dblapi.js");
var ms = require("ms");
const emote = require("./emoji.json");
//const dbl = new DBL(process.env.DBL, bot);
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://zal1000.firebaseio.com'
});

  

bot.on("ready", async() => {
      console.log(`${bot.user.username} has started`)
        
      var db = admin.database();
  const doc = admin.firestore().collection('dcusers').doc('all');
  const observer = doc.onSnapshot(docSnapshot => {
    //console.log(`Received doc snapshot: ${docSnapshot.data().reggeltcount}`);
    bot.user.setActivity(`for ${docSnapshot.data().reggeltcount} morning message`, {type: "WATCHING"})
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


  })


bot.on("message", async message => {
//  let prefix = process.env.PREFIX; 
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

    if(message.author.bot) {return}
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
})

var db = admin.database();
var ref = db.ref("bots/reggeltbot/token");
ref.once("value", function(snapshot) {
    bot.login(snapshot.val())
  console.debug(snapshot.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});