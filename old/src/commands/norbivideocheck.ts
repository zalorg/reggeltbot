import * as Discord from "discord.js";
import * as admin from "firebase-admin";

const db = admin.firestore();

module.exports = {
  name: "norbivideocheck",
  async execute(
    bot: Discord.Client,
    message: Discord.Message,
    args: Array<string>
  ) {
    if (message.guild && message.channel.id === "820402807454433282") {
      sendissue(bot, message, args, message.channel.id);
    } else if (message.guild && message.channel.id === "749255750018400266") {
      sendissue(bot, message, args, message.channel.id);
    }
  },
};

async function sendissue(
  bot: Discord.Client,
  message: Discord.Message,
  args: Array<string>,
  channel: string
) {
  console.log(args);

  if (message.channel.isText()) {
    const msgch: any = message.channel;
    const collector = new Discord.MessageCollector(
      msgch,
      (m) => m.author.id === message.author.id,
      { time: 60000 }
    );
    let array: any[] = [];
    message.reply("Video: ");

    collector.on("collect", (msg) => {
      if (!array[0]) {
        array.push(`${msg.content}`);
        message.reply("Idő: ");
      } else if (!array[1]) {
        array.push(`${msg.content}`);
        message.reply("Probléma: ");
      } else if (!array[2]) {
        array.push(`${msg.content}`);

        db.collection("waik")
          .doc("norbi")
          .collection("videocheck")
          .add({
            video: array[0],
            time: array[1],
            issue: array[2],
            status: "new",
            author: message.author.id,
          })
          .then((d) => {
            message.reply(`Probléma elküldve! (id: ${d.id})`);
          });

        collector.stop();
        array = [];
      }
    });
  }
}

///waik/norbi/videocheck/template
