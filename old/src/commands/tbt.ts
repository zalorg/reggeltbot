import { Message } from "discord.js";
const { Translate } = require("@google-cloud/translate").v2;

const translate = new Translate();

console.log("tbt loaded");

module.exports = {
  name: "tbt",
  async execute(message: Message, args: string[]) {
    console.log(args);

    let full: string[] = [];

    for await (const arg of args) {
      const [response] = await translate.translate(arg, "hu");
      const array = Array.isArray(response) ? response : [response];

      for await (const translation of array) {
        console.log(`Translation: ${translation}`);
        //await message.reply(translation || "empty");
        full.push(translation);
      }
    }

    await message.reply(full.join(' ') || "empty");

  },
};
