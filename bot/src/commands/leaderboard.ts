import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";
export default class CountCommand {
    private readonly db = firestore();
    private ammount = 10;

    public async run(interaction: CommandInteraction) {
        const ammountarg = interaction.options.getInteger('ammount', false)
        console.log(ammountarg);
        if(ammountarg) {
            if (ammountarg > 25) {
                return await interaction.reply({
                    content: 'The maximum ammount is 25',
                    ephemeral: true
                });
            }
            if (ammountarg < 1) {
                return await interaction.reply({
                    content: 'The minimum ammount is 1',
                    ephemeral: true
                });
            }
        }
        
        this.ammount = ammountarg || 10;

        await interaction.deferReply();
        const query = this.db.collection('users').where('reggeltCount', '>', 1).orderBy('reggeltCount', 'desc').limit(this.ammount);
        const snapshot = await query.get();
        const users = snapshot.docs.map(doc => doc.data());
        const embed = new MessageEmbed()
            .setTitle(`Top ${this.ammount} users with the most reggelt`)
            .setColor('#ffca5c')
            .setFooter('Reggeltbot leaderboard')
            .setURL(`https://reggeltbot.com/leaderboard?m=${this.ammount}`)
            .setTimestamp();
        for (let i = 0; i < users.length; i++) {
            embed.addField(users[i].username, users[i].reggeltCount.toString());
        }
        return await interaction.editReply({ embeds: [embed] });
    }
}

export const data = new SlashCommandBuilder()
.setName('leaderboard')
.setDescription('Get the current leaderboard')
.addIntegerOption(option => option.setName('ammount').setDescription('You can specify the ammount of users on the leaderboard up to 25').setRequired(false))
.toJSON();
