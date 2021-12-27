import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default class EmoteSellCommand {    
    public async run(interaction: CommandInteraction): Promise<any> {
        return await interaction.reply({
            content: 'The emote shop is currently disabled.',
            ephemeral: true,
        });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
subcommandGroup
.setName("sell")
.setDescription("Sell reggeltemote")
