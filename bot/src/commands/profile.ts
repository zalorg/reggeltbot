import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";
import { User } from "../helpers/users";
import { UserDoc } from "../types/user";
export default class CountCommand {
    interaction! : CommandInteraction; 
    private db = firestore();
    public async run(interaction: CommandInteraction): Promise<void> {
        this.interaction = interaction;
        const userref = this.db.collection('users').doc(this.uid)
        const user = await userref.get() as firestore.DocumentSnapshot<User>;
        if(!user.exists) return await interaction.reply({
            content: `Unknown error`,
            ephemeral: true,
        });
        await interaction.deferReply()
        const embed = new MessageEmbed()
            .setColor(0x0099ff)
            .setTitle(`${this.name}'s profile`)
            .setFooter(`${interaction.user.tag} • Reggeltbot profile (Beta)`, interaction.user.avatarURL({ dynamic: true }) || undefined)
            .setTimestamp(Date.now());

        if(user.data() && user.data()?.reggeltCount) embed.addField('Reggeltcount', `${user.data()!.reggeltCount}`);
        if(user.data()?.badges && user.data()!.badges!.length > 0) {
            let ba: string[] = [];
            user.data()?.badges!.forEach(async (b: string) => {
                switch (b) {
                  case "verified":
                    ba.push("<:greenTick:809931766642245663>");
                    break;
                  case "premium":
                    ba.push("<:premium:812821285197447178>");
                    break;
                  case "tester":
                    ba.push("<:test:812821214019190795>");
                    break;
                }
              });
            embed.setDescription(`${ba.join("   ")}`);
        }
        if(user.data()?.reggeltCoins) embed.addField('Coins', `${user.data()!.reggeltCoins}`);

        const emotes = await userref.collection('inventory').doc('emotes').get() as firestore.DocumentSnapshot<{ have: string[] }>;
        // .setDescription(`**example** members`);
        if(emotes.exists && emotes.data()?.have) {
            let emote: string[] = [];
            emotes.data()?.have.forEach((e: string) => {
                emote.push(e);
            });
            embed.addField("Emotes" ,`${emote.join("   ")}`);
        }
        if(this.avatar) embed.setThumbnail(this.avatar);
        interaction.editReply({
            embeds: [embed]
        });
    }

    private get name(): string {
        return this.interaction.options.getUser('user')?.username || this.interaction.user.username;
    }

    private get uid(): string {
        return this.interaction.options.getUser('user')?.id || this.interaction.user.id;
    }

    private get avatar(): string | null {
        return this.interaction.options.getUser('user')?.avatarURL({ dynamic: true }) || this.interaction.user.avatarURL({ dynamic: true });
    }
}

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Get the user profile')
    .addUserOption(option => option.setRequired(false).setName('user').setDescription('The user to get the profile of'))
    .toJSON();
