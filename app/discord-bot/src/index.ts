import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
import axios from 'axios';
import { HealthResponse, WingsResponse, ServerInfo, User } from './types';

dotenv.config();

const token = process.env.DISCORD_TOKEN;
const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001'; // 포트 수정

if (!token) {
  console.error('⚠️  No DISCORD_TOKEN found in environment variables.');
  process.exit(1);
}

const api = axios.create({
  baseURL: backendUrl,
  timeout: 5000,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const command = message.content.toLowerCase().trim();

  if (command === '!ping') {
    message.reply('Pong!');
  }

  if (command === '!health') {
    try {
      const response = await api.get('/db-health');
      const health = response.data as HealthResponse;
      message.reply(`DB Health: ${health.connected ? '✅ Connected' : '❌ Disconnected'} (${health.dbType})`);
    } catch (error) {
      message.reply('❌ Backend API에 연결할 수 없습니다.');
    }
  }

  if (command === '!wings') {
    try {
      const response = await api.get('/ping-wings');
      const wingsData = response.data as WingsResponse;
      if (wingsData.error) {
        message.reply(`❌ Wings 연결 실패: ${wingsData.error}`);
      } else {
        message.reply('✅ Wings 서비스가 정상 작동 중입니다.');
      }
    } catch (error) {
      message.reply('❌ Backend API에 연결할 수 없습니다.');
    }
  }

  if (command.startsWith('!server ')) {
    const serverId = command.split(' ')[1];
    if (!serverId) {
      message.reply('사용법: !server <서버ID>');
      return;
    }

    try {
      const response = await api.get(`/wings/servers/${serverId}`);
      const server = response.data as ServerInfo;
      message.reply(`서버 정보: ${server.name || serverId} - 상태: ${server.status || 'unknown'}`);
    } catch (error) {
      message.reply(`❌ 서버 ${serverId} 정보를 가져올 수 없습니다.`);
    }
  }

  if (command.startsWith('!start ')) {
    const serverId = command.split(' ')[1];
    if (!serverId) {
      message.reply('사용법: !start <서버ID>');
      return;
    }

    try {
      const response = await api.post(`/wings/servers/${serverId}/start`);
      message.reply(`✅ 서버 ${serverId} 시작 요청을 보냈습니다.`);
    } catch (error) {
      message.reply(`❌ 서버 ${serverId} 시작에 실패했습니다.`);
    }
  }

  if (command.startsWith('!stop ')) {
    const serverId = command.split(' ')[1];
    if (!serverId) {
      message.reply('사용법: !stop <서버ID>');
      return;
    }

    try {
      const response = await api.post(`/wings/servers/${serverId}/stop`);
      message.reply(`✅ 서버 ${serverId} 정지 요청을 보냈습니다.`);
    } catch (error) {
      message.reply(`❌ 서버 ${serverId} 정지에 실패했습니다.`);
    }
  }

  if (command === '!users') {
    try {
      const response = await api.get('/users');
      const users = response.data as User[];
      message.reply(`등록된 사용자 수: ${users.length}명`);
    } catch (error) {
      message.reply('❌ 사용자 정보를 가져올 수 없습니다.');
    }
  }
});

client.login(token);
