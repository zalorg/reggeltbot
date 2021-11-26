import fs = require("fs");
import * as admin from "firebase-admin";
import * as Discord from "discord.js";
import { Message } from "discord.js";
import * as qdb from "quick.db";
module.exports = {
  name: "setlang",
  async execute(message: Message, args: any[]) {
    if (!args[0]) {
      message.reply("Please send a language code");
    } else {
      const langs: any = JSON.parse(
        fs.readFileSync("./cache/guilds.json", "utf8")
      ).langs;

      if (!langs.find((e: any) => e === args[1])) {
        message.reply(
          "Error: cannot find language! Here a list of all language:"
        );
        let embed = new Discord.MessageEmbed()
          .setTitle("All avelible language")
          .setColor(qdb.get("config.embedcolor"));

        langs.forEach((e: string) => {
          embed.addField("Code", e);
        });

        return message.channel.send({embeds: [embed]});
      } else {
        const ref = admin
          .firestore()
          .collection("bots")
          .doc("reggeltbot")
          .collection("config")
          .doc(message.guild!.id);
        const doc = await ref.get();

        if (
          message.member?.permissions.has("MANAGE_MESSAGES") ||
          message.author.id === "423925286350880779"
        ) {
          if (doc.exists) {
            if (args[0] === "full") {
              ref
                .update({
                  lang: args[1],
                  reggeltlang: args[1],
                  saylang: args[1],
                })
                .then((r) => {
                  message.channel.send(
                    `Guild language changed to: ${args[1]}!`
                  );
                })
                .catch((e) => {
                  message.reply("Error updateing guild language!");
                  throw e;
                });
            } else if (args[0] === "say" || args[0] === "tts") {
              ref
                .update({
                  saylang: args[1],
                })
                .then((r) => {
                  message.channel.send(
                    `Guild language changed to: ${args[1]}!`
                  );
                })
                .catch((e) => {
                  message.reply("Error updateing guild language!");
                  throw e;
                });
            } else if (args[0] === "reggelt") {
              ref
                .update({
                  saylang: args[1],
                })
                .then((r) => {
                  message.channel.send(
                    `Guild language changed to: ${args[1]}!`
                  );
                })
                .catch((e) => {
                  message.reply("Error updateing guild language!");
                  throw e;
                });
            }
          } else {
            ref
              .set({
                lang: args[1],
                reggeltlang: args[1],
                saylang: args[1],
                cd: 6,
                premium: false,
                disabled: false,
                testing: false,
                verified: false,
              })
              .then((r) => {
                message.channel.send(`Guild language set to: ${args[1]}!`);
              })
              .catch((e) => {
                message.reply("Error updateing guild language!");
                throw e;
              });
          }
        } else {
          message.reply("You are not authorized to change the bot language!");
        }
      }
    }

    return;
  },
};
