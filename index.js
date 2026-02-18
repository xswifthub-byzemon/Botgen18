// ==========================================
//  Z-GEN X (PAI EDITION) - V5.0 (DM UNLOCKED)
// ==========================================

const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Pai is Ready for Zimon! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V5.0 พร้อมส่งรูปเข้า DM แล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('💋 Z-GEN X : DM DIRECT SERVICE')
            .setDescription('**ยินดีต้อนรับค่ะซีม่อน**\nปายปรับระบบใหม่ส่งตรงเข้า DM แบบที่บอทคนอื่นทำได้แล้วน้า!\nเลือกโหมดด้านล่างได้เลยค่ะ')
            .setColor('#FF0099');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gen_sfw').setLabel('✨ SFW (ปกติ)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('gen_nsfw').setLabel('🔞 NSFW (18+)').setStyle(ButtonStyle.Danger).setEmoji('🔥')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.isButton()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId === 'gen_nsfw';
        const type = isNSFW ? 'nsfw' : 'sfw';
        
        // รายชื่อหมวดหมู่ (เลือกมาเฉพาะที่เด็ดๆ)
        const category = isNSFW ? 'waifu' : 'waifu'; 
        const url = `https://api.waifu.pics/${type}/${category}`;

        try {
            // ดึงรูป 5 รูปตามที่ซีม่อนเคยสั่งไว้
            let successCount = 0;
            for (let i = 0; i < 5; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    // ส่งแบบข้อความ Link ดิบๆ เพื่อให้ Discord Preview รูปเอง (วิธีนี้ผ่านง่ายที่สุด)
                    await interaction.user.send({ 
                        content: `✨ **รูปที่ ${i+1}** ของซีม่อนมาแล้วค่ะ!\n${imgUrl}` 
                    }).catch(e => console.log("DM Error", e));
                    successCount++;
                }
            }

            if (successCount > 0) {
                await interaction.editReply(`✅ ปายส่งรูป ${isNSFW ? '18+' : 'ปกติ'} จำนวน ${successCount} รูปเข้า DM เรียบร้อยแล้วค่ะซีม่อน!`);
            } else {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ ซีม่อนเปิดรับ DM หรือยังน้า?`);
            }
        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 API มีปัญหานิดหน่อย ลองใหม่อีกครั้งนะคะ`);
        }
    }
});

client.login(TOKEN);
