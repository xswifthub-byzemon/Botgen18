// ==========================================
//  Z-GEN X (PAI EDITION) - V3.2 (Spoiler Fix)
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
    SlashCommandBuilder,
    AttachmentBuilder // เพิ่มตัวช่วยส่งไฟล์แนบ
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google'); 

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V3.2 Online! 💖'));
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
        console.log(`✨ น้องปาย V3.2 พร้อมเสิร์ฟความสยิวแบบสปอยล์แล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        const embed = new EmbedBuilder().setTitle('💋 Z-GEN X : SPOILER MODE').setDescription('เลือกโหมดที่ต้องการได้เลยค่ะ รอบนี้มาแบบเบลอๆ ต้องกดดูเอาเองน้า~').setColor('#FF0099');
        const menu = new StringSelectMenuBuilder().setCustomId('mode_select').setPlaceholder('🔻 เลือกโหมด...').addOptions(
            { label: '✨ รูปปกติ (Safebooru)', value: 'sfw', emoji: '🎀' },
            { label: '🔞 รูป 18+ (Rule34 - Spoiler)', value: 'nsfw', emoji: '🔥' }
        );
        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'mode_select') {
        const isNSFW = interaction.values[0] === 'nsfw';
        const btn = new ButtonBuilder().setCustomId(isNSFW ? 'btn_nsfw' : 'btn_sfw').setLabel(isNSFW ? '😈 ค้นหา 18+ (Spoiler)' : '🚀 ค้นหารูปปกติ').setStyle(isNSFW ? ButtonStyle.Danger : ButtonStyle.Success);
        await interaction.reply({ content: `✅ เลือกโหมด **${isNSFW ? '18+' : 'ปกติ'}** แล้วค่ะ!`, components: [new ActionRowBuilder().addComponents(btn)], ephemeral: true });
    }

    if (interaction.isButton()) {
        const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
        const modal = new ModalBuilder().setCustomId(`modal_${mode}`).setTitle('🔍 ค้นหาตัวละคร');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('ชื่อตัวละคร').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId.includes('modal_nsfw');
        const rawName = interaction.fields.getTextInputValue('name');
        let amount = parseInt(interaction.fields.getTextInputValue('num')) || 1;
        if (amount > 5) amount = 5;

        try {
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            const url = isNSFW 
                ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            const res = await axios.get(url);
            const posts = res.data;

            if (!posts || posts.length === 0) return interaction.editReply(`😿 ไม่เจอน้อง **"${rawName}"** เลยค่ะ`);

            let count = 0;
            for (const p of posts) {
                const imgUrl = p.file_url || p.sample_url;
                if (!imgUrl) continue;

                const fullUrl = imgUrl.startsWith('http') ? imgUrl : `https:${imgUrl}`;
                
                // --- ส่วนที่แก้ไข: ส่งแบบ Spoiler ---
                const attachment = new AttachmentBuilder(fullUrl, { name: `SPOILER_${finalTag}_${count}.png` });

                const embed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`น้อง ${rawName} มาแล้วค่ะซีม่อน! ${isNSFW ? '🔞' : '✨'}`)
                    .setFooter({ text: `Z-Gen X | กดที่รูปเพื่อเปิดดูน้า~` });

                await interaction.user.send({ embeds: [embed], files: [attachment] }).catch(err => console.log("DM Fail:", err));
                count++;
            }

            await interaction.editReply(count > 0 ? `✅ ส่งรูป **${rawName}** ไปแบบสปอยล์ใน DM แล้วค่ะ!` : `❌ ส่งไม่ได้ค่ะ! เช็คตั้งค่า DM น้า`);

        } catch (err) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${err.message}`);
        }
    }
});

client.login(TOKEN);
