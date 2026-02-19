// ==========================================
//  Z-GEN X (PAI EDITION) - V7.1 (FIXED & FULL)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder,
    ChannelType, PermissionFlagsBits
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V7.1 is Online for Zimon! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// เก็บสัญชาติแยกตาม User
const userNation = new Map();

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V7.1 พร้อมดูแลซีม่อนแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // --- หน้าแผงควบคุมหลัก ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('💋 Z-GEN X : ULTIMATE GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับค่ะ ซีม่อน**\n' +
                'ปายจัดหน้าเมนูใหม่ให้สวยงามตามสั่งเลยค่ะ\n\n' +
                '🌍 **ขั้นตอนการใช้งาน**\n' +
                '1. เลือกสัญชาติที่ชอบ (หรือเลือก Anime)\n' +
                '2. กดปุ่มโหมดที่ต้องการ (น่ารัก/สยิว)\n' +
                '3. พิมพ์ชื่อตัวละครและจำนวนที่ต้องการ\n\n' +
                '📖 *กดปุ่มรายชื่อเพื่อดูตัวละครแนะนำได้นะคะ*'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('nation_select')
            .setPlaceholder('🌍 เลือกสัญชาติที่ต้องการ (Anime/คนจริง)...')
            .addOptions(
                { label: '🌸 Anime (การ์ตูน)', value: 'anime', emoji: '🎨' },
                { label: '🇹🇭 Thai (สาวไทย)', value: 'thai', emoji: '🇹🇭' },
                { label: '🇯🇵 Japanese (สาวญี่ปุ่น)', value: 'japanese', emoji: '🇯🇵' },
                { label: '🇰🇷 Korean (สาวเกาหลี)', value: 'korean', emoji: '🇰🇷' },
                { label: '🇬🇧 English (สายฝอ)', value: 'english', emoji: '🇬🇧' }
            );

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gen_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('gen_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อตัวละคร').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu), btnRow] });
    }

    // --- บันทึกสัญชาติ ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'nation_select') {
        userNation.set(interaction.user.id, interaction.values[0]);
        await interaction.reply({ content: `✅ เลือกสัญชาติ **${interaction.values[0]}** เรียบร้อยค่ะ!`, ephemeral: true });
    }

    // --- สร้างห้องรายชื่อ ---
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        const channel = await interaction.guild.channels.create({
            name: 'character-guide',
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
            ],
        });
        const listEmbed = new EmbedBuilder().setTitle('📖 รายชื่อแนะนำ').setColor('#00FFFF').addFields(
            { name: '🏴‍☠️ One Piece', value: 'Luffy, Zoro, Nami, Robin, Hancock' },
            { name: '⚔️ Demon Slayer', value: 'Tanjiro, Nezuko, Shinobu, Mitsuri' },
            { name: '🐉 Dragon Ball', value: 'Goku, Vegeta, Bulma, Android_18' }
        );
        await channel.send({ embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้อง <#${channel.id}> ให้แล้วค่ะ! (ลบใน 5 นาที)`);
        setTimeout(() => channel.delete().catch(() => {}), 300000);
    }

    // --- เปิด Modal ---
    if (interaction.isButton() && (interaction.customId === 'gen_sfw' || interaction.customId === 'gen_nsfw')) {
        const isNSFW = interaction.customId === 'gen_nsfw';
        const modal = new ModalBuilder().setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw').setTitle(isNSFW ? '🔞 ค้นหาแบบสยิว' : '✨ ค้นหาแบบน่ารัก');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('ชื่อตัวละคร/สไตล์ (ไทย/อังกฤษ)').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // --- ค้นหาและส่งรูป (DM + Download) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId.includes('nsfw');
        const rawName = interaction.fields.getTextInputValue('name');
        let amount = parseInt(interaction.fields.getTextInputValue('num')) || 1;
        if (amount > 5) amount = 5;

        try {
            const nation = userNation.get(interaction.user.id) || 'anime';
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            let apiUrl = '';
            if (nation === 'anime') {
                apiUrl = isNSFW 
                    ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                    : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;
            } else {
                apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${nation}+${isNSFW ? 'nude' : 'cosplay'}+${finalTag}`;
            }

            const res = await axios.get(apiUrl);
            const posts = res.data;

            if (!posts || posts.length === 0) return interaction.editReply(`😿 หาไม่เจอเลยค่ะซีม่อน ลองเปลี่ยนคำค้นหาน้า`);

            for (let i = 0; i < posts.length; i++) {
                const img = posts[i].file_url || posts[i].sample_url;
                if (!img) continue;

                const embed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`✨ [${nation.toUpperCase()}] รูปที่ ${i+1}: ${rawName}`)
                    .setImage(img)
                    .setFooter({ text: 'Z-Gen X V7.1 | บันทึกรูปได้เลยนะคะซีม่อน' });

                const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('📥 ดาวน์โหลดไฟล์ .png').setStyle(ButtonStyle.Link).setURL(img));
                await interaction.user.send({ embeds: [embed], components: [btn] }).catch(() => {});
            }
            await interaction.editReply(`✅ ส่งของดีเข้า DM เรียบร้อยแล้วค่ะซีม่อน!`);
        } catch (e) { await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${e.message}`); }
    }
});

client.login(TOKEN);
