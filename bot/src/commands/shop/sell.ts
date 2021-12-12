import { SlashCommandSubcommandBuilder } from "@discordjs/builders";


export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
subcommandGroup
.setName("sell")
.setDescription("Sell reggeltemote")
