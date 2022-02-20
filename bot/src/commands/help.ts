import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";
import * as fs from "fs";

export default class CountCommand {
    interaction! : CommandInteraction; 
    private db = firestore();
    constructor(interaction: CommandInteraction) {
        this.interaction = interaction;
        this.run = this.run.bind(this);
    }
    public async run(interaction: CommandInteraction): Promise<any> {
        const embed = new MessageEmbed()
        .setTitle(`${interaction.client.user?.username} help`)
        await interaction.deferReply();
        const commandfiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js')).map(file => file.replace('.js', ''));
        // TODO: Add auto help import

        for (const command of commandfiles) {
            if ((require(`./${command}`) as any).ignore) continue;
            const commandInstance = (require(`./${command}`) as any).data;
            const commandName = commandInstance.name;
            const commandDescription = commandInstance.description;
            embed.addField(`${commandName}`, `${commandDescription}`);
        }

        embed.addField('\u200b', '\u200b')
        .addField('Bot ping', `${interaction.client.ws.ping}ms`, true)
        .addField('Uptime', `${interaction.client.uptime}`, true)
        .addField('Started at', `<t:${interaction.client.readyTimestamp}:T>`, true)

        return await interaction.editReply({
            embeds: [embed]
        });
    }
}

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Bot info panel')
    .toJSON();