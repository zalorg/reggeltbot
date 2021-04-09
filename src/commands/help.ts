//import * as admin from 'firebase-admin';
import ms = require("ms");
import fs = require("fs");
import { Message, Client, MessageEmbed } from "discord.js";
import { Guildconfig, Langtypes } from "../types";
import * as qdb from "quick.db";

module.exports = {
  name: "help",
  execute(message: Message, bot: Client) {
    //console.log('asd')

    //message.channel.startTyping()

    const prefix = qdb.get("config.prefix");

    const langcode = qdb.get("config.langs");

    const guildconfig: Guildconfig = qdb.get(`guild.${message.guild?.id}`);

    console.log(guildconfig);

    const guildlang = guildconfig.lang || "en-US";

    const langfull: Langtypes = JSON.parse(
      fs.readFileSync(`./lang/${guildlang}.json`, "utf8")
    );

    const lang = langfull.commands.help;

    const reggeltconfig = langfull.events.reggelt;

    const rawbadges: Array<string> = [];

    if (guildconfig.verified) {
      rawbadges.push("<:greenTick:809931766642245663>");
    }

    if (guildconfig.premium) {
      rawbadges.push("<:premium:812821285197447178>");
    }

    if (guildconfig.testing) {
      rawbadges.push("<:test:812821214019190795>");
    }

    const badges = rawbadges.join(" ");

    const alllang = langcode.join(", ");

    const embed = new MessageEmbed()
      .setTitle(lang.title)
      .setDescription(`${badges}`)
      .setColor(qdb.get("config.embedcolor"))
      .addField(
        lang.f1.replace("%!PREFIX%!", prefix),
        lang.f11
          .replace("%!DCID%!", message.author.id)
          .replace("%!CHANNEL%!", reggeltconfig.channel)
      )
      .addField(lang.f2.replace("%!PREFIX%!", prefix), lang.f21)
      .addField(
        lang.setlang1.replace("%!PREFIX%!", prefix),
        lang.setlang2.replace("%!ALLLANG%!", alllang)
      )
      .addField(
        lang.f3.replace("%!CHANNEL%!", reggeltconfig.channel),
        lang.f31.replace("%!CHANNEL%!", reggeltconfig.channel)
      )
      .addField(lang.f4, lang.f41)
      .addField(lang.f5, lang.f51)
      .addField("\u200B", "\u200B");

    if (guildconfig.lang != "en-US") {
      embed
        .addField(
          `${prefix} setlang [OPTION] [LANG]`,
          `Options: say, reggelt, full | Lang: Your laungage code.  For example: (${alllang})`
        )
        .addField("\u200B", "\u200B");
    }

    embed
      .addField(lang.ping, `${bot.ws.ping}ms`)
      .addField(lang.uptime, `${ms(bot.uptime || 0)}`)
      .setThumbnail(bot.user!.avatarURL()!)
      .setFooter(
        `${message.author.tag} • Reggeltbot help`,
        message.author.avatarURL({ dynamic: true }) || undefined
      )
      .setTimestamp(Date.now());

    message.channel.send(embed);
  },
};
