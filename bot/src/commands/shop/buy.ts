import { SlashCommandSubcommandBuilder } from "@discordjs/builders";


export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("buy")
    .setDescription("Buy reggeltemote")
