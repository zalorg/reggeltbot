import { Client, Intents } from 'discord.js';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import registerCommands from './register-commands';
import InteractionManager from './commands/manager';
import * as admin from 'firebase-admin';

export default class Bot {
    private client: Client;
    private token?: string;
    private secretManagerClient = new SecretManagerServiceClient();

    constructor(token? :string) {
        if(token) this.token = token;
        this.client = new Client({
            intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES],
        });
        new InteractionManager(this.client);
        admin.initializeApp();
    }

    public async start() {
        if(!this.token) this.token = await this.fetchBotToken();
        await this.client.login(this.token);
        console.info(`Logged in as ${this.client.user!.tag}`);
        await registerCommands(this.client.user?.id!, "738169002085449748")
    }

    public async fetchBotToken(): Promise<string> {
        const secretName = "projects/512279358183/secrets/reggeltbot-test-token/versions/latest";
        const [accessResponse] = await this.secretManagerClient.accessSecretVersion({
            name: secretName,
        });

        const responsePayload = accessResponse!.payload!.data!.toString();
        return responsePayload;
    }

    public destroy() {
        this.client.destroy();
    }

}

const bot = new Bot();
bot.start();
