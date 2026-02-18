// ==========================================
//  Z-GEN X (PAI EDITION) - V3.1 (Ultimate 18+ Fix)
// ==========================================

const { 
    Client, 
    GatewayIntentBits, 
    Partials, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    EmbedBuilder,
    REST,
    Routes,
    SlashCommandBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google'); 

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

if (!TOKEN || !CLIENT_ID || !OWNER_ID) {
    console.error("❌ Error: Missing Variables!");
    process.exit(1); 
}

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V3.1 is Online! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder()
        .setName('pai_secret') 
        .setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V3.1 พร้อมเสิร์ฟแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // 🟢 เรียก Panel
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pai_secret') {
            if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('💋 Z-GEN X : SECRET GALLERY')
                .setDescription('**ยินดีต้อนรับกลับมาค่ะซีม่อน**\nเลือกโหมดที่ต้องการได้เลย ปายเตรียมรูปเด็ดๆ ไว้เพียบ!')
                .setColor('#FF0099')
                .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

            const menu = new StringSelectMenuBuilder()
                .setCustomId('mode_select')
                .setPlaceholder('🔻 เลือกโหมดความสยิว...')
                .addOptions(
                    { label: '✨ รูปปกติ (Safebooru)', value: 'sfw', emoji: '🎀' },
                    { label: '🔞 รูป 18+ (Rule34)', value: 'nsfw', emoji: '🔥' }
                );

            await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
        }
    }

    // 🟡 เลือกโหมด
    if (interaction.isStringSelectMenu() && interaction.customId === 'mode_select') {
        const isNSFW = interaction.values[0] === 'nsfw';
        const btn = new ButtonBuilder()
            .setCustomId(isNSFW ? 'btn_nsfw' : 'btn_sfw')
            .setLabel(isNSFW ? '😈 เริ่มค้นหาความสยิว (18+)' : '🚀 เริ่มค้นหาความน่ารัก')
            .setStyle(isNSFW ? ButtonStyle.Danger : ButtonStyle.Success);

        await interaction.reply({ content: `✅ เลือกโหมด **${isNSFW ? '18+' : 'ปกติ'}** แล้วค่ะ!`, components: [new ActionRowBuilder().addComponents(btn)], ephemeral: true });
    }

    // 🟠 เปิด Modal
    if (interaction.isButton()) {
        const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
        const modal = new ModalBuilder().setCustomId(`modal_${mode}`).setTitle('🔍 ค้นหาตัวละคร');
        
        const nameInput = new TextInputBuilder().setCustomId('name').setLabel('ชื่อตัวละคร (ไทย/อังกฤษ)').setStyle(TextInputStyle.Short).setRequired(true);
        const numInput = new TextInputBuilder().setCustomId('num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // 🔴 ประมวลผลรูปภาพ (FIXED)
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId.includes('nsfw');
        const rawName = interaction.fields.getTextInputValue('name');
        let amount = parseInt(interaction.fields.getTextInputValue('num')) || 1;
        if (amount > 5) amount = 5;

        try {
            // 1. แปลภาษา
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) {
                searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            }
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            // 2. เลือก API
            const url = isNSFW 
                ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            const res = await axios.get(url);
            const posts = res.data;

            if (!posts || posts.length === 0) {
                return interaction.editReply(`😿 ปายหา **"${rawName}"** ไม่เจอเลยค่ะซีม่อน ลองใช้ชื่ออังกฤษดูน้า`);
            }

            let count = 0;
            for (const p of posts) {
                // ดึง Link รูปแบบฉลาด (เช็คหลาย Field กันพลาด)
                const img = p.file_url || p.sample_url || p.preview_url;
                if (!img) continue;

                const embed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`น้อง ${rawName} มาแล้วค่ะซีม่อน! ${isNSFW ? '🔞' : '✨'}`)
                    .setImage(img.startsWith('http') ? img : `https:${img}`) // ป้องกันลิ้งค์ไม่มีโปรโตคอล
                    .setFooter({ text: `Z-Gen X | Source: ${isNSFW ? 'Rule34' : 'Safebooru'}` });

                await interaction.user.send({ embeds: [embed] }).catch(() => {});
                count++;
            }

            await interaction.editReply(count > 0 ? `✅ ส่งรูป **${rawName}** จำนวน **${count}** รูป ไปที่ DM แล้วค่ะ!` : `❌ เจอรูปแต่ส่ง DM ไม่ไปค่ะ!`);

        } catch (err) {
            console.error(err);
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${err.message}`);
        }
    }
});

client.login(TOKEN);
