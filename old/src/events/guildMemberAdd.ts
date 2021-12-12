import { Client } from "discord.js";
import * as admin from "firebase-admin";
//import { Storage } from '@google-cloud/storage';
//import * as fs from 'fs';
//import * as axiosb from 'axios'
//const axios = axiosb.default;
//import Path = require('path');

module.exports = {
  name: "guildMemberAdd",
  async execute(bot: Client) {
    bot.on("guildMemberAdd", async (member) => {
      const ref = admin.firestore().doc(`dcusers/${member.id}`);
      const doc = await ref.get();

      if (doc.exists) {
        ref
          .set(
            {
              pp: member.user.avatarURL(),
              tag: member.user.tag,
              username: member.user.username,
              discriminator: member.user.discriminator,
            },
            {
              merge: true,
            }
          )
          .catch((err) => {
            throw err;
          });

        ref
          .collection("guilds")
          .doc(member.guild.id)
          .set({
            allpermissions: member.permissions.toArray(),
            color: member.displayColor,
            colorHEX: member.displayHexColor,
            icon: member.guild.iconURL(),
            nick: member.nickname,
            owner: member.guild.ownerID,
            permissions: {
              ADMINISTRATOR: member.hasPermission("ADMINISTRATOR"),
              MANAGE_CHANNELS: member.hasPermission("MANAGE_CHANNELS"),
              MANAGE_GUILD: member.hasPermission("MANAGE_GUILD"),
              MANAGE_MESSAGES: member.hasPermission("MANAGE_MESSAGES"),
            },
            joinedTimestamp: member.joinedTimestamp,
            joinedAt: member.joinedAt,
          });
      } else {
        ref
          .collection("guilds")
          .doc(member.guild.id)
          .set({
            allpermissions: member.permissions.toArray(),
            color: member.displayColor,
            colorHEX: member.displayHexColor,
            icon: member.guild.iconURL(),
            nick: member.nickname,
            owner: member.guild.ownerID,
            permissions: {
              ADMINISTRATOR: member.hasPermission("ADMINISTRATOR"),
              MANAGE_CHANNELS: member.hasPermission("MANAGE_CHANNELS"),
              MANAGE_GUILD: member.hasPermission("MANAGE_GUILD"),
              MANAGE_MESSAGES: member.hasPermission("MANAGE_MESSAGES"),
            },
            joinedTimestamp: member.joinedTimestamp,
            joinedAt: member.joinedAt,
          });
      }
    });
  },
};
