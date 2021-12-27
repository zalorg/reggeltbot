import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";

export default class EmoteBuyCommand {    
    private db = firestore();
    
    public async run(interaction: CommandInteraction): Promise<any> {
        // const userref = this.db.collection("dcusers").doc(interaction.user.id);
        // const emoteref = userref.collection("inventory").doc("emotes");
        // const emotedoc = await emoteref.get() as firestore.DocumentSnapshot<{have: Array<string>}>;
        return await interaction.reply({
            content: 'The emote shop is currently disabled.',
            ephemeral: true,
        });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("buy")
    .setDescription("Buy reggeltemote")
