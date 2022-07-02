import { Client, Guild } from "discord.js";
import { firestore } from "firebase-admin";

export default class ReggeltEvent {
    private readonly db = firestore();
    private client: Client;
    constructor(client: Client) {
      this.client = client;
      client.on('guildCreate', async (guild) => {
        console.log(guild.toJSON())
        this.run(guild)
      })
    }

    private async run(guild: Guild) {
      const guildRef = this.db.collection('guilds').doc(guild.id);
      const guildDoc = await guildRef.get();
      if(!guildDoc.exists) {
        this.initGuild(guild)
      }
    }

    public async initGuild(guild: Guild) {
      const guildRef = this.db.collection('guilds').doc(guild.id);
      //console.log(guild.toJSON());
      await guildRef.set(guild.toJSON() as any, { merge: true });
      //fs.writeFileSync(`./guild-${guild.id}.json`, JSON.stringify(guild.toJSON()))
      await this.exportGuildRoles(guild);
      await this.exportGuildEmotes(guild);
      await this.exportGuildChannels(guild);
      return;
    }

    private async exportGuildRoles(guild: Guild) {
      const roleIDs = await guild.roles.fetch();
      //console.log(roleIDs);
      const rolecoll = this.db.collection(`guilds/${guild.id}/roles`)
      
      for await (const role of roleIDs.values()) {
        //const role = await guild.roles.fetch(roleID)
        await rolecoll.doc(role.id).set(role.toJSON() as any, { merge: true });
      }
    }

    private async exportGuildEmotes(guild: Guild) {
      const emoteIDs = await guild.emojis.fetch();
      //console.log(roleIDs);
      const emotecoll = this.db.collection(`guilds/${guild.id}/emojis`)
      
      for await (const role of emoteIDs.values()) {
        //const role = await guild.roles.fetch(roleID)
        await emotecoll.doc(role.id).set(role.toJSON() as any, { merge: true });
      }
    }

    private async exportGuildChannels(guild: Guild) {
      const channelIDs = await guild.channels.fetch();
      //console.log(roleIDs);
      const channelcoll = this.db.collection(`guilds/${guild.id}/channels`)
      
      for await (const c of channelIDs.values()) {
        //const role = await guild.roles.fetch(roleID)
        await channelcoll.doc(c.id).set(c.toJSON() as any, { merge: true });
      }
    }
}

export interface GuildData {

}