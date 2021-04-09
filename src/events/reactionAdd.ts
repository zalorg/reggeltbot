//import * as admin from 'firebase-admin';
import * as Discord from "discord.js";

module.exports = {
  name: "rAdd",
  execute(bot: Discord.Client) {
    bot.on("messageReactionAdd", async (react, user) => {
      console.log(react);
    });
  },
};
