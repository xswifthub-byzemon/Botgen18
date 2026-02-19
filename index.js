// ==========================================
//  Z-GEN X (PAI EDITION) - V6.0 (ANIME CLASSIC)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google');

// --- ตั้งค่า Variables ---
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

// --- ระบบกันหลับ ---
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X Anime System is Online! 💖'));
app.listen(process.env.PORT || 3000);

// --- สร้างบอท ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปายพร้อมทำงานในโหมด Anime Classic แล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // ====================================================
    // 🟢 1. เรียก Panel หลัก (สวยงาม เรียบง่าย)
    // ====================================================
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : ANIME GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับกลับมาค่ะ ซีม่อน**\n' +
                'ปายเตรียมพร้อมสำหรับคำสั่งเจนรูปอนิเมะแล้วค่ะ\n\n' +
                '✨ **วิธีใช้งาน**\n' +
                '1. เลือกโหมด **น่ารัก** หรือ **สยิว (18+)**\n' +
                '2. ใส่ชื่อตัวละครที่ชอบ (ไทย/อังกฤษ)\n' +
                '3. รอรับรูปใน DM ได้เลย!'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'Service by น้องปาย | For Zimon Only' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อตัวละครแนะนำ').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // ====================================================
    // 🟡 2. ปุ่มกด (เปิด Modal / สร้างห้องรายชื่อ)
    // ====================================================
    
    // --- ปุ่มดูรายชื่อตัวละคร ---
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        
        // สร้างห้องส่วนตัว
        const channel = await interaction.guild.channels.create({
            name: `character-list-${interaction.user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // คนอื่นไม่เห็น
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }, // ซีม่อนเห็น
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel] }      // บอทเห็น
            ],
        });

        const listEmbed = new EmbedBuilder()
            .setTitle('📖 โพยรายชื่อตัวละครเด็ดๆ (Character Guide)')
            .setColor('#00FFFF')
            .setDescription('ก๊อปชื่อไปใส่ในช่องค้นหาได้เลยค่ะซีม่อน!')
            .addFields(
                { name: '🏴‍☠️ One Piece', value: 'Nami, Nico Robin, Boa Hancock, Yamato, Uta', inline: false },
                { name: '⚔️ Demon Slayer', value: 'Nezuko Kamado, Shinobu Kocho, Mitsuri Kanroji, Daki', inline: false },
                { name: '🐉 Dragon Ball', value: 'Android 18, Bulma, Chi-Chi, Videl', inline: false },
                { name: '🔮 Other Hits', value: 'Rem, Zero Two, Yor Forger, Makima, Marin Kitagawa', inline: false }
            )
            .setFooter({ text: 'ห้องนี้จะถูกลบใน 5 นาทีนะคะ' });

        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ ปายสร้างห้องรายชื่อให้แล้วที่ <#${channel.id}> ค่ะ!`);
        
        // ลบห้องอัตโนมัติ
        setTimeout(() => channel.delete().catch(() => {}), 5 * 60 * 1000);
    }

    // --- ปุ่มเปิดฟอร์มค้นหา (Modal) ---
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 ค้นหาแบบ 18+' : '✨ ค้นหาแบบน่ารัก');

        const nameInput = new TextInputBuilder()
            .setCustomId('char_name')
            .setLabel('ชื่อตัวละคร (ไทย/อังกฤษ)')
            .setPlaceholder('เช่น Nami, Rem')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const numInput = new TextInputBuilder()
            .setCustomId('char_num')
            .setLabel('จำนวนรูป (1-5)')
            .setValue('5')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // ====================================================
    // 🔴 3. ประมวลผลและส่งรูปเข้า DM
    // ====================================================
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        const rawName = interaction.fields.getTextInputValue('char_name');
        let amount = parseInt(interaction.fields.getTextInputValue('char_num')) || 1;
        if (amount > 5) amount = 5;

        try {
            // 1. แปลภาษา (ถ้ามีภาษาไทย)
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) {
                searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            }
            // จัด Format ชื่อ (เปลี่ยนเว้นวรรคเป็น _ และตัวเล็กหมด)
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            // 2. เลือก API (Rule34 หรือ Safebooru)
            // ใช้ User-Agent เพื่อกันโดนบล็อก
            const apiBase = isNSFW ? 'https://api.rule34.xxx' : 'https://safebooru.org';
            const apiUrl = `${apiBase}/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            const res = await axios.get(apiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            const posts = res.data;

            // เช็คว่าเจอรูปไหม
            if (!posts || posts.length === 0) {
                return interaction.editReply(`😿 ปายหา **"${rawName}"** (${finalTag}) ไม่เจอเลยค่ะซีม่อน ลองเช็คชื่อภาษาอังกฤษดูน้า`);
            }

            // 3. ส่งรูปเข้า DM
            let sentCount = 0;
            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i].file_url || posts[i].sample_url;
                if (!imgUrl) continue;

                // สร้างปุ่มโหลด
                const downloadBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('📥 ดาวน์โหลด Original .png')
                        .setStyle(ButtonStyle.Link)
                        .setURL(imgUrl)
                );

                const embed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`✨ รูปที่ ${i+1}: ${rawName} (${isNSFW ? '18+' : 'SFW'})`)
                    .setImage(imgUrl)
                    .setFooter({ text: 'Z-Gen X System | By น้องปาย' });

                await interaction.user.send({ embeds: [embed], components: [downloadBtn] }).catch(err => console.log('DM Fail'));
                sentCount++;
            }

            if (sentCount > 0) {
                await interaction.editReply(`✅ ส่งรูปน้อง **${rawName}** จำนวน **${sentCount}** รูป เข้า DM เรียบร้อยแล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ เจอรูปนะแต่ส่ง DM ไม่ไป! ช่วยเปิด DM ให้คนแปลกหน้าทักได้หน่อยน้า`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 เกิดข้อผิดพลาดทางเทคนิค: ${error.message}`);
        }
    }
});

client.login(TOKEN);
