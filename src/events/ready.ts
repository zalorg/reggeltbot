import * as admin from "firebase-admin";
import fs = require("fs");
import DBL = require("dblapi.js");
import { Client, ReactionCollector } from "discord.js";
import * as axios from "axios";
import * as qdb from "quick.db";
//import * as random from 'random';
const db = admin.firestore();

/*
let errorlist: {
  status:
    | "degraded_performance"
    | "partial_outage"
    | "major_outage"
    | "under_maintenance";
  id: string, name: string;
}[] = [];
let fullstatus: any;
*/
module.exports = {
  name: "ready",
  execute(bot: Client) {
    bot.on("ready", async () => {
      if (!process.env.PROD) {
        setInterval(() => {
          try {
            sendPingToStatusPage(bot.ws.ping);
          } catch {}
        }, 1000);
      }

      let componentIds = [
        "frxly1cd0pxv",
        "0n4bnnhyjtc9",
        "jm3bmv0yzg3r",
        "16ml9zr8mpny",
        "z60x84pdpjp1",
      ];

      setInterval(() => {
        let statuses: {
          status:
            | "degraded_performance"
            | "partial_outage"
            | "major_outage"
            | "under_maintenance";
          id: string;
          name: string;
        }[] = [];
        axios.default
          .get("https://mpp8x8t3hc6r.statuspage.io/api/v2/summary.json")
          .then(async (res) => {
            //fullstatus = res.data;
            for await (const id of componentIds) {
              const components: Component[] = res.data.components;

              const component = components.find((e) => e.id === id);
              //console.log(component);

              if (!component) {
                throw Error;
              }

              if (component.status != "operational") {
                statuses.push({
                  status: component.status,
                  id: component.id,
                  name: component.name,
                });
              }
            }
            //errorlist = statuses;
          });
      }, 5000);

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
          console.log("prod");
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
        `version: ${qdb.get("version") || "prod"}`,
      ];

      let num = 0;

      setInterval(() => {
        //console.log(errorlist)
        /*
        if (errorlist.length != 0 || fullstatus?.incidents && fullstatus?.incidents?.length != 0) {
          //console.log("1")
          if(fullstatus.incidents.length != 0) {
            //console.log(fullstatus.incidents)
            bot.user?.setActivity(`${fullstatus.incidents[0].name} | ${fullstatus.incidents[0].impact}`, { type: "WATCHING" })
            if(fullstatus.incidents[0].impact === "none") {
              bot.user?.setStatus('online');
            } else if(fullstatus.incidents[0].impact === "minor") {
              bot.user?.setStatus('idle');
            } else {
              bot.user?.setStatus('dnd');
            }
          } else if(errorlist.find(e => e.status === "major_outage")) {
            //console.log(errorlist.find(e => e.status === "major_outage"))
          }

        } else {
          */
        if (num === activities_list.length) {
          num = 0;
        }
        bot
          .user!.setActivity(activities_list[num], { type: "WATCHING" })
          .then(() => {
            num = num + 1;
          });
        // }
      }, 5000);

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

interface Component {
  id: string;
  name: string;
  status:
    | "operational"
    | "degraded_performance"
    | "partial_outage"
    | "major_outage"
    | "under_maintenance";
  created_at: string;
  updated_at: string;
  position: number;
  description: null | string;
  showcase: boolean;
  start_date: string;
  group_id: string;
  page_id: string;
  group: boolean;
  only_show_if_degraded: boolean;
}

async function sendPingToStatusPage(
  ping: string | number | null
): Promise<boolean> {
  if (!ping) {
    return false;
  }
  var http = require("https");

  // The following 4 are the actual values that pertain to your account and this specific metric.
  var apiKey = process.env.STATUSPAGE_KEY;
  var pageId = "mpp8x8t3hc6r";
  var metricId = "lx451242vscb";
  var apiBase = "https://api.statuspage.io/v1";

  var url =
    apiBase + "/pages/" + pageId + "/metrics/" + metricId + "/data.json";
  var authHeader = { Authorization: "OAuth " + apiKey };
  var options = { method: "POST", headers: authHeader };

  // Need at least 1 data point for every 5 minutes.
  // Submit random data for the whole day.
  var epochInSeconds = Math.floor(Date.now() / 1000);

  var currentTimestamp = epochInSeconds;

  var data = {
    timestamp: currentTimestamp,
    value: Number(ping),
  };

  var request = http.request(
    url,
    options,
    function (res: {
      statusMessage: string;
      on: (
        arg0: string,
        arg1: { (): void; (): void; (error: any): void }
      ) => void;
    }) {
      if (res.statusMessage === "Unauthorized") {
        const genericError =
          "Error encountered. Please ensure that your page code and authorization key are correct.";
        return console.error(genericError);
      }
      res.on("data", function () {
        //console.log("Ping sent: " + ping);
      });

      res.on("error", () => {
        console.log("err");
      });
    }
  );

  request.end(JSON.stringify({ data: data }));

  return true;
}
