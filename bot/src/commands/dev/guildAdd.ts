import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";
import onGuildAdded from '../../events/onGuildAdded';

export default class EmoteSetCommand {  
    private db = firestore();
    private onGuildAdded;

    constructor(interaction: CommandInteraction) {
        this.onGuildAdded = new onGuildAdded(interaction.client)
    }

    public async run(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await this.onGuildAdded.initGuild(interaction.guild!)
        return interaction.editReply({ content: 'OK' });
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("guildadd")
    .setDescription("Run onGuildAddEventFunction")
