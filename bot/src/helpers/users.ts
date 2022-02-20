import { MessageEmbed, User as DcUser } from "discord.js"
import { firestore } from "firebase-admin";
import { set as setCache, get as getCache } from 'quick.db';

export async function createUserProfile(user: DcUser): Promise<User> {
    const db = firestore();
    const newUser: User = {
        username: user.username,
        id: user.id,
        discriminator: user.discriminator,
        avatar: user.avatarURL({ format: "webp", dynamic: true }),
        dcCreatedAt: user.createdAt,
        dcUpdatedAt: user.createdAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        reggeltCount: 0,
        reggeltCoins: 0,
        reggeltEmote: null
    }

    return await db.collection('bots/reggeltbot/users').doc(user.id).set(newUser).then(async () => {
        setCache(`user.${user.id}`, newUser);
        const embed = new MessageEmbed()
            .setTitle('Profile Created')
            .setDescription(`Your profile has been created!`)
            .setColor('#00ff00')
            .setThumbnail(user.avatarURL({ format: "webp", dynamic: true }) || user.defaultAvatarURL)
            .setFooter(`${user.username}#${user.discriminator}`)
            .setTimestamp();
        await user.send({
            embeds: [embed]
        });

        return newUser;
    }).catch(err => {
        console.log(err);
        throw new Error('Unknown error!');
    });

}

export async function getUserProfile(user: DcUser, force = false, createIfNew = false): Promise<User> {
    const db = firestore();
    const cached = getCache(`user.${user.id}`);
    if (cached && !force) return cached;

    return await db.collection('bots/reggeltbot/users').doc(user.id).get().then(doc => {
        if (!doc.exists) {
            if (createIfNew) {
                return createUserProfile(user);
            }
            throw new Error('User not found!');
        } else {
            const data = doc.data() as User;
            setCache(`user.${user.id}`, data);
            return data;
        }
    }).catch(err => {
        console.log(err);
        throw new Error('Unknown error!');
    });
}

export interface User {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastMessage?: Date;
    lastMessageId?: string;
    dcCreatedAt: Date;
    dcUpdatedAt: Date;
    reggeltCount: number;
    reggeltEmote: string | null;
    reggeltCoins: number;
    badges?: string[];
    userId?: string;
}