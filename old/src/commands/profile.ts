import * as Discord from "discord.js";
import * as admin from "firebase-admin";
import * as qdb from "quick.db";

const db = admin.firestore();
const coinName: string = qdb.get("config.coinName") || "Coins";

module.exports = {
  name: "profile",
  async execute(bot: Discord.Client, args: string[], message: Discord.Message) {
    console.log("p2");

    if (message.mentions.members?.first()) {
      const member = message.mentions.members?.first();
      if (!member)
        return message.reply("Error! User not found!").then((m) => {
          setTimeout(() => {
            m.delete().catch((e) => console.warn);
          }, 5000);
        });
      return send(bot, args, message, member);
    } else {
      const member = message.member;
      if (!member)
        return message.reply("Error! User not found!").then((m) => {
          setTimeout(() => {
            m.delete().catch((e) => console.warn);
          }, 5000);
        });

      return send(bot, args, message, member);
    }
  },
};

async function send(
  bot: Discord.Client,
  args: string[],
  message: Discord.Message,
  member: Discord.GuildMember
) {
  const ref = db.collection("dcusers").doc(member?.user.id);
  const invenref = ref.collection("inventory");
  const emotedoc = await invenref.doc("emotes").get();
  const doc = await ref.get();

  const userquery = db.collection("users").where("dcid", "==", member?.user.id);
  const userdocs = await userquery.get();
  const userdoc = userdocs.docs[0];

  const coinemote = bot.emojis.cache.get(qdb.get("config.coinEmote"));

  let coinEmote = coinemote || "💲";

  let embed = new Discord.MessageEmbed()
    .setTitle(`${member.displayName || member.user.tag}'s profile`)
    .addField(`Reggeltcount`, `${doc.data()?.reggeltcount || "0"}`)
    .addField(
      `${coinName.charAt(0).toUpperCase()}${coinName.slice(1)}s`,
      `${doc.data()?.coins || "0"} ${coinEmote}`
    )
    .setColor(qdb.get("config.embedcolor") || member.displayColor)
    .setFooter(
      `${message.author.tag} • Reggeltbot profile (Beta)`,
      message.author.avatarURL({ dynamic: true }) || undefined
    )
    .setTimestamp(Date.now());

  if (userdoc?.exists) {
    const user = await admin.auth().getUser(userdoc.id);

    let av =
      user?.photoURL ||
      member?.user?.avatarURL({ dynamic: true }) ||
      member.user.displayAvatarURL({ dynamic: true }) ||
      bot.user?.avatarURL({ dynamic: true });
    embed.setThumbnail(av!);
  } else {
    let av =
      member?.user?.avatarURL({ dynamic: true }) ||
      member.user.displayAvatarURL({ dynamic: true }) ||
      bot.user?.avatarURL({ dynamic: true });
    embed.setThumbnail(av!);
  }

  if (emotedoc.exists) {
    let e: string[] = emotedoc.data()?.have;

    console.log(e.join("  "));

    embed.addField(`Emotes`, `${e.join("  ")} \n`);

    e = [];
  }

  if (doc.data()?.badges && doc.data()?.badges.length > 0) {
    let ba: string[] = [];

    console.log(doc.data()?.badges);

    doc.data()?.badges.forEach(async (b: string) => {
      switch (b) {
        case "verified":
          ba.push("<:greenTick:809931766642245663>");
          break;
        case "premium":
          ba.push("<:premium:812821285197447178>");
          break;
        case "tester":
          ba.push("<:test:812821214019190795>");
          break;
      }
    });

    embed.setDescription(`${ba.join("   ")}`);
    ba = [];
  }

  message.channel.send(embed);
}
