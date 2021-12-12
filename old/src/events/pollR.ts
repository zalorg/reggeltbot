import {} from "discord.js";

module.exports = {
  name: "pollR",
  async execute(bot: any) {
    bot.on("messageReactionAdd", async (r: any, u: any) => {
      console.log(r);
    });
  },
};
