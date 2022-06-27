import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { firestore } from "firebase-admin";

export default class EmoteSetCommand {  
    private db = firestore();
    
    public async run(interaction: CommandInteraction): Promise<void> {
        //get emote list from firebase
        await interaction.deferReply();
        const userref = this.db.collection("users").doc(interaction.user.id);
        const emotedoc = await userref.get() as firestore.DocumentSnapshot<any>;
        const emotes: string[] = emotedoc.data().emotes;



        const shopembed = new MessageEmbed()
            .setTitle("Shop")
            .setDescription("React with the emote you want to select")
            .addField('Current emotes', `${emotes}`)
        interaction.channel!.send({ embeds: [shopembed] }).then(async (msg) => {
            //@ts-expect-error
            const filter = (reaction, user) => {
                return user.id === interaction.user.id;
            }
            
            
            msg.awaitReactions({ filter, max: 1, time: 60000, errors: ["time"] }).then(c => {
                const react = c.first();
                if(react!.emoji.id) {
                    if(emotes.includes(`<:${react?.emoji.name!}:${react?.emoji.id}>`)) {
                        interaction.editReply(`You selected <:${react?.emoji.name!}:${react?.emoji.id}>`);
                        if(msg.deletable) msg.delete().catch();
                        emotedoc.ref.update({
                            reggeltEmote: `<:${react?.emoji.name!}:${react?.emoji.id}>`,
                        });
                    } else {
                        interaction.editReply("You don't have that emote");
                        if(msg.deletable) msg.delete().catch();
                    }
                } else {
                    if(emotes.includes(react?.emoji.name!)) {
                        interaction.editReply(`You selected ${react?.emoji.name}`);
                        if(msg.deletable) msg.delete().catch();
                        emotedoc.ref.update({
                            reggeltEmote: `${react!.emoji.name}`,
                        });
                    } else {
                        interaction.editReply("You don't have that emote");
                        if(msg.deletable) msg.delete().catch();
                    }
                }
                
            });
        })
    }
}

export const data = (subcommandGroup: SlashCommandSubcommandBuilder) => 
    subcommandGroup
    .setName("set")
    .setDescription("Set reggeltemote")
