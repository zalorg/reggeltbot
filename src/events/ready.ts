import * as admin from "firebase-admin";
import fs = require("fs");
import DBL = require("dblapi.js");
import { Client, ReactionCollector } from "discord.js";
//import * as axios from 'axios';
import * as qdb from "quick.db";

const db = admin.firestore();
module.exports = {
  name: "ready",
  execute(bot: Client) {
    bot.on("ready", async () => {
      //console.log(qdb.fetchAll())
      if (qdb.fetchAll().length === 0) {
        process.exit();
      }

      switch (process.env.PROD) {
        case "false":
          qdb.set("version", "testing");
          break;

        case "beta":
          qdb.set("version", "beta");
          break;

        default:
          console.log('prod');

      }

      if (!process.env.PROD) {
        //waikupdate(bot)
      }

      const dblToken = (
        await admin.firestore().collection("bots").doc("reggeltbot").get()
      ).data()?.dblToken;
      const dbl = new DBL(dblToken, bot);
      dbl.on("posted", () => {
        console.log("posted");
      });
      dbl.webhook?.on("vote", (vote) => {
        console.log(`User with ID ${vote.user} just voted!`);
        console.log(vote);
        admin.firestore().collection("dbl").add({
          vote: vote,
        });
      });
      const bansRef = admin
        .firestore()
        .collection("bots")
        .doc("reggeltbot")
        .collection("bans")
        .doc("global");
      bansRef.onSnapshot((snap) => {
        const bans = {
          bans: snap.data()!.bans,
        };
        console.log(bans);
        fs.writeFileSync("./cache/global-bans.json", JSON.stringify(bans));
      });

      const activities_list = [
        `for ${qdb.get("global.reggeltcount") || "some"} morning messages`,
        `version: ${qdb.get("version")}`,
      ];

      let num = 0;

      setInterval(() => {
        //console.log(qdb.get('global.reggeltcount'))
        if (num === activities_list.length) {
          //console.log('reseted')
          num = 0;
          //console.log(num)
        }
        //const index = Math.floor(Math.random() * (activities_list.length - 1) + 1); // generates a random number between 1 and the length of the activities array list (in this case 5).
        bot
          .user!.setActivity(activities_list[num], { type: "WATCHING" })
          .then(() => {
            //console.log(activities_list[num]);
            //console.log(num)
            num = num + 1;
          });

        //console.log(activities_list.length - 1)
      }, 10000);

      console.log(`${bot.user!.username} has started`);

      const msgqueueref = admin
        .firestore()
        .collection("bots")
        .doc("reggeltbot")
        .collection("messagequeue");
      const msgqueuequerry = msgqueueref.where("sent", "==", false);

      msgqueuequerry.onSnapshot((snap) => {
        if (snap.empty) {
          console.log("no new messages");
        } else {
          snap.forEach((doc) => {
            const channel = bot.channels.cache.get(doc.data()?.channel);

            const dm = bot.users.cache.get(doc.data()?.channel);

            const ref = doc.ref;

            if (doc.data()?.sent === true) {
              console.log("message already sent");
              return;
            }

            if (channel?.isText()) {
              if (!doc.data()?.message) {
                ref.update({
                  status: "err",
                  error: "No message!",
                  sent: true,
                });
              } else {
                ref
                  .update({
                    status: "sending",
                    sent: true,
                  })
                  .then((d) => {
                    channel
                      .send(doc.data()?.message)
                      .then((msg) => {
                        ref.update({
                          status: "sent",
                          id: msg.id,
                          type: msg.type,
                          sent: true,
                        });
                      })
                      .catch((e) => {
                        ref.update({
                          status: "err",
                          error: e.message,
                          sent: true,
                        });
                      });
                  });
              }
            } else if (dm?.id) {
              if (!doc.data()?.message) {
                ref.update({
                  status: "err",
                  error: "No message!",
                  sent: true,
                });
              } else {
                ref
                  .update({
                    status: "sending",
                    sent: true,
                  })
                  .then((d) => {
                    dm.send(doc.data()?.message)
                      .then((msg) => {
                        ref.update({
                          status: "sent",
                          id: msg.id,
                          msg: msg.toJSON(),
                          sent: true,
                        });
                      })
                      .catch((e) => {
                        ref.update({
                          status: "err",
                          error: e.message,
                          sent: true,
                        });
                      });
                  });
              }
            } else {
              ref.update({
                status: "err",
                error: "No such user/cannel!",
                sent: true,
              });
            }
          });
        }
      });

      const broadcastref = admin
        .firestore()
        .collection("bots")
        .doc("reggeltbot")
        .collection("reggeltbtoadcast");
      const broadcastquery = broadcastref.where("sent", "==", true);

      broadcastquery.onSnapshot((snap) => {
        snap.forEach((doc) => {
          let senttoguilds: string[] = doc.data()?.senttoguilds || [];

          //const ref = doc.ref;

          //let senttoguilds: string[] = doc.data()?.senttoguilds || [];

          bot.guilds.cache.forEach((guild) => {
            if (senttoguilds.find((e) => e === guild.id)) return;
            const channel = guild.channels.cache.find(
              (c) => c.name === "reggelt"
            );

            if (channel?.isText()) {
              channel.send(doc.data()?.message).then((m) => {
                return senttoguilds.push(guild.id);
              });
            }
          });

          let pendig: string[];

          bot.guilds.cache.forEach((g) => {
            //if(pendig === true) {
            pendig.push(g.id);
            //}
          });

          console.log(pendig!);
        });
      });

      const pollref = db
        .collection("bots")
        .doc("reggeltbot")
        .collection("polls");
      const pollquery = pollref.where("ended", "==", false);

      var collectors: ReactionCollector[] = [];

      pollquery.onSnapshot((snap) => {
        collectors.forEach((c) => {
          c.stop("restart");
        });
        if (snap.empty) return;

        snap.docs.forEach(async (doc) => {
          const channel = bot.channels.cache.get(doc.data()?.channelid);
          if (channel?.isText()) {
            await channel.messages.fetch();

            const message = channel.messages.cache.get(doc.data()?.messageid);

            console.log(message?.content);

            const collector = message?.createReactionCollector(
              (reaction, user) => user.id,
              { dispose: true }
            );

            collectors.push(collector!);

            collector?.on("remove", async (react, user) => {
              const ref = doc.ref.collection("votes");
              const query = ref
                .where("id", "==", user.id)
                .where("reaction.emojiID", "==", react.emoji.id);
              const docs = await query.get();

              docs.forEach((doc2) => {
                doc2.ref.delete().then((d) => {
                  console.log("doc removed");
                });
              });

              console.log("remove");
            });

            collector?.on("collect", (reaction, user) => {
              const ref = doc.ref.collection("votes");
              ref.add({
                reaction: reaction.toJSON(),
                user: user.toJSON(),
                id: user.id,
                emoteid: reaction.emoji.id,
              });
              console.log("add");
            });
          }
        });
      });
    });
  },
};
