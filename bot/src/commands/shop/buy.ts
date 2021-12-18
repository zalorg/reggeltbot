import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { firestore } from "firebase-admin";

export default class EmoteBuyCommand {    
    private db = firestore();
    
    public async run(interaction: CommandInteraction): Promise<void> {
        const userref = this.db.collection("dcusers").doc(interaction.user.id);
        const emoteref = userref.collection("inventory").doc("emotes");
        const emotedoc = await emoteref.get() as firestore.DocumentSnapshot<{have: Array<string>}>;

        return await interaction.reply({
            content: 'Its working :)',
            ephemeral: true,
        });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("buy")
    .setDescription("Buy reggeltemote")
