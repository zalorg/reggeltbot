import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export default class EmoteSetCommand {    
    public async run(interaction: CommandInteraction): Promise<void> {
        return await interaction.reply({
            content: 'The emote shop is currently disabled.',
            ephemeral: true,
        });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("set")
    .setDescription("Set reggeltemote")
