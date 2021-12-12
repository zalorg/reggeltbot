import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction } from "discord.js";
import * as fs from 'fs';

export default class Shop {
    commands: string[];
    constructor(_client: Client, _interaction: CommandInteraction) {
		this.commands = fs.readdirSync('./dist/commands/shop').filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));
    }

    public async run(interaction: CommandInteraction) {
        return await this.onCommandInteraction(interaction);
    }

    private async onCommandInteraction(interaction: CommandInteraction) {
        const commandName = interaction.options.getSubcommand(true);
        console.log(commandName);
        console.log(this.commands);
        if(this.commands.find(command => command === command)) {
            const command = require(`./shop/${commandName}`);
            const commandInstance = new command.default(interaction);
            return await commandInstance.run(interaction);
        }
        return interaction.reply({
            content: 'Command not found!',
            ephemeral: true
        });
    }
}

const commands: Array<(arg0: SlashCommandSubcommandBuilder) => SlashCommandSubcommandBuilder> = [];
const commandFiles = fs.readdirSync('./dist/commands/shop').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./shop/${file.split('.')[0]}`);
    if(!command.ignore) commands.push(command.data);
}

export const data = new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Shop")

for(const command of commands) {
    data.addSubcommand(command);
}