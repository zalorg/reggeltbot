const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require('fs')
//const DBL = require("dblapi.js");
var ms = require("ms");
const emote = require("./emoji.json");
//const dbl = new DBL(process.env.DBL, bot);
var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    databaseURL: "https://zal1000.firebaseio.com"
  });


  var db = admin.database();
  var ref = db.ref("bots/reggeltbot/token");
  ref.once("value", function(snapshot) {
      bot.login(snapshot.val())
    console.debug(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
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
    if(message.author.bot) {return}
    if(message.channel.name === "reggelt"){
        if(message.content === "reggelt"){
            console.log(message.author.id)
        } else {
            console.log("nope")
            message.delete[1]
        }
    }
})