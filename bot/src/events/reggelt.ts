import {
  Client,
  Guild,
  Message,
  MessageEmbed,
  PartialMessage,
  User,
} from 'discord.js';
import { firestore } from "firebase-admin";
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
          return this.onUpdatedReggeltMessage(oldMessage, newMessage as Message);
        }
      }
      if (oldMessage.channel.name === "reggelt") {
        return this.onUpdatedReggeltMessage(oldMessage, newMessage as Message);
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
    const user = await this.getUserInfo(message.author);
    if (!user) {
      const errorEmbed = new MessageEmbed()
        .setTitle("Error")
        .setDescription("An unknown error occured. Please try again later.")
        .setColor("#ff0000");
      return await message.reply({
        embeds: [errorEmbed],
      }).then(async (msg) => {
        await msg.delete();
        return await message.delete();
      });
    }
    if (!message.content.toLowerCase().includes('reggelt')) {
      
      return await this.updateUserReggeltCount(message.author, message, message.guild!, false, true).then(async (_res) => {

        return await message.delete()
          .then(async () => {
            return await message.author.send(`Ide csak reggelt lehet írni! (${message.guild!.name})`)
            .catch(async (err) => {
              console.error(err);
              return await message.reply('I cannot send a direct message to you!').catch();
            })
          })
          .catch(async () => {
            return await message.channel.send('Error! I cannot delete the message! Check the permissions!').catch()
          })

      })
    }
    return await this.updateUserReggeltCount(message.author, message, message.guild!, false, false)
      .then(async () => {
        return await message.react(user.reggeltEmote || "☕").catch(async () => {
          try {
            return await message.react("☕");
          } catch {
            console.debug("cant react");
          }
        });
      })
  }

  public async onUpdatedReggeltMessage(
    oldMessage: any,
    newMessage: Message | PartialMessage,
    test = false
  ) { }

  public async onDeleteReggeltMessage(
    message: Message | PartialMessage,
    test = false
  ) { }

  private async getUserInfo(dcuser: User, force: boolean = false) {
    if (!force) {
      const userFromServer = await getUserProfile(dcuser, undefined, true);
      return userFromServer;
    }
  }

  private async updateUserReggeltCount(dcuser: User, message: Message, guild: Guild, test = false, subtract = false) {
    const userProfileRef = this.db.collection("users").doc(dcuser.id);
    // const userProfile = await getUserProfile(dcuser, false, true);
    const userGuildRef = userProfileRef.collection("guilds").doc(guild.id);
    //const userGuild = await userGuildRef.get();
    await userGuildRef.set({
      reggeltCount: firestore.FieldValue.increment(subtract ? -1 : 1),
    }, { merge: true });

    await userProfileRef.set({
      reggeltCount: firestore.FieldValue.increment(subtract ? -1 : 1),
      reggeltCoins: firestore.FieldValue.increment(subtract ? -1 : 1),
      lastUpdatedCache: Date.now(),
    }, { merge: true });

  }

  private async isOnServerCooldown(dcuser: User, guild: Guild) {
    const userGuildRef = this.db.collection("users").doc(dcuser.id).collection("guilds").doc(guild.id);
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
