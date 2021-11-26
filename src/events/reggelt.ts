import * as admin from "firebase-admin";
import fs = require("fs");
import { Message, User } from "discord.js";
import { Langtypes, Guildconfig } from "../types";
import * as qdb from "quick.db";
import * as updateUser from '../updateuser';

module.exports = {
  name: "reggelt",
  async execute(message: Message) {
    const db = admin.firestore();

    const guildconfig: Guildconfig = qdb.get(`guild.${message.guild?.id}`);

    const guildlang = guildconfig?.lang || "en-US";

    const lang: Langtypes = JSON.parse(
      fs.readFileSync(`./lang/${guildlang}.json`, "utf8")
    );

    const data = JSON.parse(
      fs.readFileSync("./cache/global-bans.json", "utf8")
    );
    if (data.bans.find((element: any) => element === message.author.id)) {
      message.delete();
      message.author.send(lang.root.bans.reggeltGlobal);
      return;
    }
    
    if(message.content.includes('--ignore')) {
      const botref = db.collection('bots').doc('reggeltbot')
      const botdoc = await botref.get();
      if(message.author.id === botdoc.data()?.ownerid) {
        return;
      }
    }

        
    if (
      message.content.toLowerCase().includes(lang.events.reggelt.keyWord) ||
      message.content.toLowerCase().includes("reggelt")
    ) {
      const ref = db.collection("dcusers").doc(message.author.id);
      const doc = await ref.get();

      const cdref = db
        .collection("dcusers")
        .doc(message.author.id)
        .collection("cooldowns")
        .doc(message.guild!.id);
      const cddoc = await cdref.get();

      const guildcd = guildconfig.cd;

      let rawcd = guildcd;

      const cdval = rawcd * 3600;

      const now = Math.floor(Date.now() / 1000);
      const cd = now + cdval;

      // on cooldown
      if (await checkcd(message)) {
        await message.delete();
        const nextTime = cddoc.data()!.reggeltcount;
        let cdmsg = lang.events.reggelt.onCooldown.replace(
          "%!CD%!",
          hhmmss(nextTime - now, lang)
        );
        await message.author.send(cdmsg);
      } else {
        if (
          !process.env.PROD &&
          rawcd <= 6 /*&& userdoc.data()!.reggeltcountcd < Date.now()*/
        ) {
          // update
          await reggeltupdateall();
          await updateUser.update(message);
          await reggeltupdatefs(message);
        }
        // cd update
        await cdref
          .set(
            {
              reggeltcount: cd,
            },
            { merge: true }
          )
          .then(async (d) => {
            // Reaction add here
            await react(doc.data()?.reggeltemote, message);
          });
      }
    } else {
      if (!message.deletable) {
        message.channel.send(lang.events.reggelt.noPerms).catch(async (err) => {
          await (await message.guild!.fetchOwner()).send(lang.events.reggelt.noSend);
          console.error(err);
        });
      } else {
        await message.delete();
        let nReggelt: string = lang.events.reggelt.notReggelt;
        let replyMSG = nReggelt
          .replace("%!GUILD%!", `${message.guild!.name}`)
          .replace("**%!KEYWORD%**", `**${lang.events.reggelt.keyWord}**`);
        await message.author.send(replyMSG).catch(function(error: string) {
          message.reply("Error: " + error);
          console.error("Error:", error);
        });
      }

      await reggeltupdatefs(message, true);
    }
  },
};

async function checkcd(message: Message): Promise<boolean> {
  const db = admin.firestore();
  const user = message.author;
  const uref = db.collection("dcusers").doc(user.id);
  const cdref = uref.collection("cooldowns").doc(message.guild!.id);
  const cddoc = await cdref.get();
  const now = Math.floor(Date.now() / 1000);

  if (!cddoc.exists) {
    return false;
  }

  if (cddoc.data()?.reggeltcount && cddoc.data()?.reggeltcount > now) {
    return true;
  }

  return false;
}

async function react(reaction: string, message: Message) {
  if (reaction) {
    await message.react(reaction).catch((e) => {
      console.debug("cant react");
      message.react("☕").catch((e) => {
        console.debug("cant react");
      });
    });
  } else if (message.author.id === "183302720030113792") {
    message.react("🍵").catch((e) => {
      console.debug("cant react");
      message.react("☕").catch((e) => {
        console.debug("cant react");
      });
    });
  } else {
    message.react("☕").catch((e) => {
      console.debug("cant react");
      message.react("☕").catch((e) => {
        console.debug("cant react");
      });
    });
  }
}

async function reggeltupdateall() {
  let db = admin.firestore();
  const incrementCount = qdb.get("config.incrementCount");
  await db
    .collection("bots")
    .doc("reggeltbot-count-all")
    .set(
      {
        reggeltcount: admin.firestore.FieldValue.increment(incrementCount),
      },
      { merge: true }
    );
}

async function reggeltupdatefs(message: Message, decreased = false) {
  const incrementCount = qdb.get("config.incrementCount");
  const decreaseCount = qdb.get("config.decreaseCount");
  updateUser.update(message, decreased ? decreaseCount : incrementCount)
}

async function checkGlobalCooldown(user: User): Promise<boolean> {
  const userRef = admin.firestore().collection("dcusers").doc(user.id);
  const userdoc = await userRef.get();
  if (!userdoc.data()?.cooldown) {
    return false;
  }
  const now = new Date(Date.now()).getDate();
  if (userdoc.data()?.cooldown < now) {
    return false;
  }
  return true;
}

async function setCooldown(user: User) {
  const id = user.id;
  const endDate = new Date(Date.now() + (1000 * 60 * 60 * 6));
  console.log(endDate);
  const userRef = admin.firestore().collection("dcusers").doc(id);
  // const userdoc = await userRef.get();
  /*
  return await userRef.set({
    cooldown: endDate,
  }, { merge: true }).then(() => {
    return;
  });
  */
}

function hhmmss(time: number, lang: Langtypes): string {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  let str =
    `${hours} ${hours == 1 ? lang.time.hour : lang.time.hours} ` +
    `${minutes} ${minutes == 1 ? lang.time.minute : lang.time.minutes} ` +
    `${seconds} ${seconds == 1 ? lang.time.second : lang.time.seconds}`;

  return str;
}
