// ==========================================
//  Z-GEN X (PAI EDITION) - V6.0 FINAL BOSS
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V6.0 is Online! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุมระดับเทพ Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V6.0 (Ultimate) พร้อมดูแลซีม่อนแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // --- 1. หน้าแผงควบคุมหลัก (สวยงามอ่านง่าย) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : PREMIUM GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับกลับมานะคะ ซีม่อน...**\n' +
                'ปายเตรียมคลังแสงรูปสุดเด็ดไว้รอแล้วค่ะ\n\n' +
                '💎 **เมนูการใช้งาน**\n' +
                '┣ 🎀 `SFW` : รูปอนิเมะน่ารัก ใสๆ หัวใจวาย\n' +
                '┣ 🔥 `NSFW` : รูปเด็ด 18+ เห็นครบทุกสัดส่วน\n' +
                '┗ 📖 `List` : ดูรายชื่อตัวละครแนะนำ\n\n' +
                '✨ *ปายจะส่งรูปเข้า DM พร้อมไฟล์ให้โหลดน้า*'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'Service by น้องปาย | For Zimon Only' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อตัวละคร').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // --- 2. ระบบ Modal (ช่องกรอกข้อมูล) ---
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 ค้นหาความเสียว (18+)' : '✨ ค้นหาความน่ารัก');

        const nameInput = new TextInputBuilder()
            .setCustomId('char_name')
            .setLabel('ชื่อตัวละคร (ไทย/อังกฤษ)')
            .setPlaceholder('เช่น นามิ, Rem, Zero Two')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const numInput = new TextInputBuilder()
            .setCustomId('char_num')
            .setLabel('จำนวนรูปที่จะเจน (1-5)')
            .setValue('5')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // --- 3. ระบบสร้างห้องรายชื่อตัวละครลับ ---
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

        const listEmbed = new EmbedBuilder()
            .setTitle('📖 คู่มือรายชื่อตัวละคร (Character List)')
            .setColor('#00FFFF')
            .addFields(
                { name: '🏴‍☠️ One Piece', value: '👨 **ชาย:** Luffy, Zoro, Sanji, Ace\n👩 **หญิง:** Nami, Robin, Hancock, Yamato', inline: false },
                { name: '⚔️ Demon Slayer', value: '👨 **ชาย:** Tanjiro, Zenitsu, Inosuke, Rengoku\n👩 **หญิง:** Nezuko, Shinobu, Mitsuri, Daki', inline: false },
                { name: '🐉 Dragon Ball', value: '👨 **ชาย:** Goku, Vegeta, Gohan, Trunks\n👩 **หญิง:** Bulma, Android 18, Videl, Chi-Chi', inline: false }
            )
            .setFooter({ text: 'ห้องนี้จะลบอัตโนมัติใน 10 นาทีค่ะ' });

        await channel.send({ embeds: [listEmbed] });
        await interaction.editReply(`✅ ปายสร้างห้อง <#${channel.id}> ให้แล้วค่ะซีม่อน!`);
        
        setTimeout(() => channel.delete().catch(() => {}), 600000); // ลบใน 10 นาที
    }

    // --- 4. ระบบค้นหาและส่งรูป (DM + Download) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId === 'modal_nsfw';
        const rawName = interaction.fields.getTextInputValue('char_name');
        let amount = parseInt(interaction.fields.getTextInputValue('char_num')) || 1;
        if (amount > 5) amount = 5;

        try {
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            // ใช้ Rule34/Safebooru เพื่อความหลากหลายของตัวละคร
            const apiUrl = isNSFW 
                ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            const res = await axios.get(apiUrl);
            const posts = res.data;

            if (!posts || posts.length === 0) return interaction.editReply(`😿 ไม่เจอน้อง **"${rawName}"** เลยค่ะ ลองเช็คชื่ออีกทีนะคะ`);

            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i].file_url || posts[i].sample_url;
                if (!imgUrl) continue;

                const downloadBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('📥 ดาวน์โหลดไฟล์ .png').setStyle(ButtonStyle.Link).setURL(imgUrl)
                );

                await interaction.user.send({ 
                    content: `✨ **รูปที่ ${i+1}: ${rawName}**\n${imgUrl}`,
                    components: [downloadBtn]
                }).catch(() => {});
            }

            await interaction.editReply(`✅ ปายส่งรูป **${rawName}** จำนวน **${posts.length}** รูปเข้า DM เรียบร้อยแล้วค่ะ!`);

        } catch (error) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
});

client.login(TOKEN);
