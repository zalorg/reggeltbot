import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from 'discord.js';
export default class CountCommand {    
    public async run(interaction: CommandInteraction): Promise<void> {
        interaction.reply({
            content: 'This option is deprecated. Please use `/profile` instead.',
            ephemeral: true,
        });
    }
}

export const data = new SlashCommandBuilder()
    .setName('count')
    .setDescription('Get the reggelt count (deprecated)')
    .toJSON();
