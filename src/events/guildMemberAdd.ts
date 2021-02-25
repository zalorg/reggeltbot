import { Client } from 'discord.js';
import * as admin from 'firebase-admin';

module.exports = {
    name: 'guildMemberAdd',
    async execute(bot: Client) {
        bot.on('guildMemberAdd', async member => {
            const ref = admin.firestore().doc(`dcusers/${member.id}`);
            const doc = await ref.get();

            if(doc.exists) {
                ref.set({
                    
                })
            }
        });
    }
}