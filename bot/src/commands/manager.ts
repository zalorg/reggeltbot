import { Client, CommandInteraction } from 'discord.js';
import * as fs from 'fs';

export default class Manager {
    private client: Client;
    public commands: string[] = []
    constructor(client: Client) {
        this.client = client;
        this.commands = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));
        client.on('interactionCreate', (interaction) => {
            if(interaction.isCommand()) this.onCommandInteraction(interaction);
        });
    }

    private async onCommandInteraction(interaction: CommandInteraction) {
        if(this.commands.find(command => command === interaction.commandName)) {
            const command = require(`./${interaction.commandName}`);
            const commandInstance = new command.default(this.client, interaction);
            return await commandInstance.run(interaction);
        }
        return interaction.reply({
            content: 'Command not found!',
            ephemeral: true
        });
    }

}

export const ignore = true;