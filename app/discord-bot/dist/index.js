"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const token = process.env.DISCORD_TOKEN;
if (!token) {
    console.error('⚠️  No DISCORD_TOKEN found in environment variables.');
    process.exit(1);
}
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
client.once(discord_js_1.Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user?.tag}`);
});
client.on(discord_js_1.Events.MessageCreate, (message) => {
    if (message.author.bot)
        return;
    if (message.content === '!ping') {
        message.reply('Pong!');
    }
});
client.login(token);
