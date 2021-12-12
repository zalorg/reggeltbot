import { Client, Guild } from "discord.js";
import * as admin from "firebase-admin";
const db = admin.firestore();

module.exports = {
  name: "guildAdd",
  async execute(bot: Client) {
    bot.on("guildCreate", async (guild) => {
      const ref = db
        .collection("bots")
        .doc("reggeltbot")
        .collection("config")
        .doc(guild.id);
      const doc = await ref.get();
      const guildlang = guild.preferredLocale || "en";
      console.log(guildlang);

      if (!doc.exists) {
        ref.set({
          cd: 6,
          premium: false,
          testing: false,
          verified: false,
        });

        if (guildlang === "en") {
          setguildlang("en-US", guild);
        } else if (guildlang === "hu") {
          setguildlang("hu-HU", guild);
        } else if (guildlang === "de") {
          setguildlang("de-DE", guild);
        } else {
          setguildlang("en-US", guild);
        }
      }
    });
  },
};

async function setguildlang(lang: string, guild: Guild) {
  const ref = db
    .collection("bots")
    .doc("reggeltbot")
    .collection("config")
    .doc(guild.id);
  //const doc = await ref.get();

  ref.update({
    lang: lang,
    reggeltlang: lang,
    saylang: lang,
  });
}
