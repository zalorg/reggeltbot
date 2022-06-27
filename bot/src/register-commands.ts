import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Place your client and guild ids here
// const clientId = '749253143958913094';
// const guildId = '738169002085449748';



export default async function registerCommands(clientId: string, guildId?: string) {
	try {
		const commands: any[] = [];
		const commandFiles = fs.readdirSync('./dist/commands').filter(file => file.endsWith('.js'));
		for (const file of commandFiles) {
			const command = require(`./commands/${file.split('.')[0]}`);
			if(!command.ignore) commands.push(command.data);
		}
		console.log('Started refreshing application (/) commands.');
        const rest = new REST({ version: '9' }).setToken(await fetchBotToken());

		await rest.put(
			guildId ? Routes.applicationGuildCommands(clientId, guildId) : Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
}

async function fetchBotToken(): Promise<string> {
	const secretName = "projects/606259039951/secrets/reggeltbot-beta-token/versions/latest";
	const [accessResponse] = await new SecretManagerServiceClient().accessSecretVersion({
		name: secretName,
	});

	const responsePayload = accessResponse!.payload!.data!.toString();
	return responsePayload;
}