import { Client, Guild, Message, MessageEmbed, PartialMessage } from "discord.js";
import { firestore } from "firebase-admin";
import { get as getFromCache, set as setInCache } from "quick.db";

export default class ReggeltEvent {
    private readonly db = firestore();
    private client: Client;
    constructor (client: Client) {
        this.client = client;
        client.on('messageCreate',  (message) => {
            console.log('asd')
            if(message.channel.type !== "GUILD_TEXT") return;
            if(message.channel.name === 'reggelt') {
                return this.onNewReggeltMessage(message);
            }
        });

        client.on('messageUpdate',  (oldMessage, newMessage) => {
            if(oldMessage.channel.type !== "GUILD_TEXT") return;
            if(oldMessage.channel.name === 'reggelt') {
                return this.onUpdatedReggeltMessage(oldMessage, newMessage);
            }
        })

        client.on('messageDelete',  (message) => {
            if(message.channel.type !== "GUILD_TEXT") return;
            if(message.channel.name === 'reggelt') {
                return this.onDeleteReggeltMessage(message);
            }
        })
    
    }

    public async onNewReggeltMessage (message: Message): Promise<any> {
        const user = await this.getUserInfo(message.author.id) as any;
        if(!user) {
            const errorEmbed = new MessageEmbed()
                .setTitle('Error')
                .setDescription('An unknown error occured. Please try again later.')
                .setColor('#ff0000');
            return message.reply({
                embeds: [errorEmbed]
            })
        }
    }

    public async onUpdatedReggeltMessage (oldMessage: Message | PartialMessage, newMessage: Message | PartialMessage) {
        
    }

    public async onDeleteReggeltMessage (message: Message | PartialMessage) {
    
    }

    private async getUserInfo (userId: string, force: boolean = false) {
        if(!force) {
            const user = await getFromCache(`dcuser.${userId}`);
            if(user) {
                if(user.lastUpdatedCache > Date.now() - 1000 * 60 * 5) {
                    return user;
                }
            }
        }
    }

    private async fetchUserInfo (userId: string) {
        const user = await this.db.collection('dcusers').doc(userId).get();
        if(user.exists) {
            const data = user.data();
            if(data) {
                if(data.schemaVersion !== 1) {
                    await this.updateUserSchema(userId);
                }
                setInCache(`dcuser.${userId}`, {...data, lastUpdatedCache: Date.now()});
                return data;
            }
        }
    }

    private async updateUserSchema (userId: string) {}

}