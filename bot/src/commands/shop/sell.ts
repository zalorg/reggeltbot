import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default class EmoteSellCommand {    
    public async run(interaction: CommandInteraction): Promise<void> {
        return await interaction.reply({
            content: 'Its working :)',
            ephemeral: true,
        });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
subcommandGroup
.setName("sell")
.setDescription("Sell reggeltemote")
