import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, ReactionEmoji, User } from "discord.js";
import { firestore } from "firebase-admin";
import { getUserProfile } from "../../helpers/users";


export default class EmoteBuyCommand {
    private db = firestore();

    public async run(interaction: CommandInteraction): Promise<any> {

        const user = await getUserProfile(interaction.user);
        const shopembed = new MessageEmbed()
            .setTitle("Shop")
            .setDescription("Please react with the emote you want to buy")
            .addField("Custom emotes", "100$", true)
            .addField("Default emotes", "10$", true)
            .addField("Current balance", `${user.reggeltCoins || 0}$`, true)
            .setColor("#0099ff")
            .setFooter("@ reggeltbot beta")
            .setTimestamp();
        

        const userref = this.db.collection("users").doc(interaction.user.id);
        const emotedoc = await userref.get() as firestore.DocumentSnapshot<any>;
        console.log(emotedoc.data()!.reggeltCoins);

         interaction.channel?.send({ embeds: [shopembed] }).then(async (msg) => {
             //custom emote = 100
             //default discord emote = 10
            
             //@ts-expect-error
             const filter = (reaction, user) => {
                 return user.id === interaction.user.id;
             }
             msg.awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] }).then(c => {
                 const react = c.first();
                 if(react?.emoji.id) msg.react(`<:${react.emoji.name}:${react.emoji.id}>`);
                 if(react?.emoji.id) {
                     if(user.reggeltCoins >= 100) {
                         emotedoc.ref.update({
                             reggeltCoins: firestore.FieldValue.increment(-100),
                             emotes: firestore.FieldValue.arrayUnion(`<:${react.emoji.name}:${react.emoji.id}>`)
                         });
                         interaction.editReply(`you bought the following emote: ${react!.emoji}`);
                         if(msg.deletable) return msg.delete().catch();
                     } else {
                         interaction.editReply("you dont have enough reggelt coins");
                         if(msg.deletable) return msg.delete().catch();
                     }
                 } else {
                     if(user.reggeltCoins >= 10) {
                         emotedoc.ref.update({
                             reggeltCoins: firestore.FieldValue.increment(-10),
                             emotes: firestore.FieldValue.arrayUnion(`${react!.emoji.name}`)
                         });
                         interaction.editReply(`you bought the following emote: ${react!.emoji}`);
                         if(msg.deletable) return msg.delete().catch();
                     } else {
                         interaction.editReply("you dont have enough reggelt coins");
                         if(msg.deletable) return msg.delete().catch();
                     }
                 }
             });
         });
        return await interaction.deferReply();
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) =>
    subcommandGroup
        .setName("buy")
        .setDescription("Buy reggeltemote")
