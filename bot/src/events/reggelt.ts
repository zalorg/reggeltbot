import {
  Client,
  Guild,
  Message,
  MessageEmbed,
  PartialMessage,
  User,
} from "discord.js";
import { firestore } from "firebase-admin";
import { get as getFromCache, set as setInCache } from "quick.db";
import { getUserProfile } from "../helpers/users";

export default class ReggeltEvent {
  private readonly db = firestore();
  private client: Client;
  constructor(client: Client) {
    this.client = client;
    client.on("messageCreate", (message) => {
      if (message.channel.type !== "GUILD_TEXT") return;
      if (message.author.bot) return;
      if (client.user?.username.toLowerCase().includes("test")) {
        if (message.channel.name === "reggelt-test") {
          return this.onNewReggeltMessage(message);
        }
      }
      if (message.channel.name === "reggelt") {
        return this.onNewReggeltMessage(message);
      }
    });

    client.on("messageUpdate", (oldMessage, newMessage) => {
      console.log(oldMessage.content);
      console.log(newMessage.content);
      if (oldMessage.channel.type !== "GUILD_TEXT") return;
      if (oldMessage.author?.bot) return;
      if (client.user?.username.toLowerCase().includes("test")) {
        if (oldMessage.channel.name === "reggelt-test") {
          return this.onUpdatedReggeltMessage(oldMessage, newMessage);
        }
      }
      if (oldMessage.channel.name === "reggelt") {
        return this.onUpdatedReggeltMessage(oldMessage, newMessage);
      }
    });

    client.on("messageDelete", (message) => {
      console.log(message.content);
      if (message.channel.type !== "GUILD_TEXT") return;
      if (message.author?.bot) return;
      if (client.user?.username.toLowerCase().includes("test")) {
        if (message.channel.name === "reggelt-test") {
          return this.onDeleteReggeltMessage(message);
        }
      }
      if (message.channel.name === "reggelt") {
        return this.onDeleteReggeltMessage(message);
      }
    });
  }

  public async onNewReggeltMessage(
    message: Message,
    test = false
  ): Promise<any> {
    const user = (await this.getUserInfo(message.author)) as any;
    if (!user) {
      const errorEmbed = new MessageEmbed()
        .setTitle("Error")
        .setDescription("An unknown error occured. Please try again later.")
        .setColor("#ff0000");
      return message.reply({
        embeds: [errorEmbed],
      });
    }
    console.log(user);
    return await message.react(user.reggeltemote).catch(async () => {
      console.debug("cant react");
      try {
            return await message.react("☕");
        } catch {
            console.debug("cant react");
        }
    });
  }

  public async onUpdatedReggeltMessage(
    oldMessage: Message | PartialMessage,
    newMessage: Message | PartialMessage,
    test = false
  ) {}

  public async onDeleteReggeltMessage(
    message: Message | PartialMessage,
    test = false
  ) {}

  private async getUserInfo(dcuser: User, force: boolean = false) {
    if (!force) {
      const user = await getFromCache(`dcuser.${dcuser.id}`);
      if (user) {
        if (user.lastUpdatedCache > Date.now() - 1000 * 60 * 5) {
          return user;
        }
      }
      const userFromServer = await getUserProfile(dcuser);
      return userFromServer;
    }
  }

  private async updateUserReggeltCount(dcuser: User, message: Message, guild: Guild, test = false, subtract = false) {
    const userProfileRef = this.db.collection("bots/reggeltbot/users").doc(dcuser.id);
    const userProfile = await getUserProfile(dcuser, false, true);
    const userGuildRef = userProfileRef.collection("guilds").doc(guild.id);
    const userGuild = await userGuildRef.get();
    if (!userGuild.exists) {
      await userGuildRef.set({
        reggeltCount: firestore.FieldValue.increment(subtract ? -1 : 1),
      }, { merge: true });
    }
    let reggeltCount = userGuild.data()?.reggeltCount || 0;
    if (subtract) {
      reggeltCount--;
    } else {
      reggeltCount++;
    }
    await userGuildRef.set({... {reggeltCount: reggeltCount}}, { merge: true });
    await userProfileRef.set({
      lastUpdatedCache: Date.now(),
    });

  }

  private async isOnServerCooldown(dcuser: User, guild: Guild) {
    const userGuildRef = this.db.collection("bots/reggeltbot/users").doc(dcuser.id).collection("guilds").doc(guild.id);
    const userGuild = await userGuildRef.get();
    if (!userGuild.exists) {
      return false;
    }
    const userGuildData = userGuild.data();
    if (userGuildData?.lastReggelt < Date.now() - 1000 * 60 * 60 * 6) {
      return false;
    }
    return true;

  }

}
