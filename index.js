// ==========================================
//  Z-GEN X (PAI EDITION) - V6.2 (RAW LINK MODE)
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
app.get('/', (req, res) => res.send('Z-Gen X Raw Mode Online'));
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
        console.log(`✨ น้องปาย V6.2 พร้อมส่งลิ้งค์ดิบให้ซีม่อนแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // 1. หน้า Panel หลัก
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : ANIME SEARCH')
            .setDescription(
                '**ยินดีต้อนรับค่ะ ซีม่อน** 🌹\n' +
                'ปายปรับโหมดส่งเป็น "ลิ้งค์ตรง" เพื่อให้ DM เด้ง 100% แล้วค่ะ!\n\n' +
                '1. เลือกโหมด (น่ารัก/สยิว)\n' +
                '2. ใส่ชื่อตัวละคร + จำนวน\n' +
                '3. รูปจะเด้งใน DM ทันที'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('ดูชื่อตัวละคร').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // 2. สร้างห้องรายชื่อ
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        
        const channel = await interaction.guild.channels.create({
            name: `character-list`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }
            ],
        });

        const listEmbed = new EmbedBuilder()
            .setTitle('📖 ตัวละครแนะนำ')
            .setDescription('**One Piece:** Nami, Robin, Hancock, Yamato\n**Demon Slayer:** Nezuko, Shinobu, Mitsuri\n**Other:** Rem, Zero Two, Makima')
            .setColor('#00FFFF')
            .setFooter({ text: 'ห้องจะลบใน 3 นาที' });

        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้องรายชื่อแล้วที่ <#${channel.id}> ค่ะ`);
        setTimeout(() => channel.delete().catch(() => {}), 3 * 60 * 1000);
    }

    // 3. เปิด Modal
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 ค้นหา 18+' : '✨ ค้นหาปกติ');

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('char_name').setLabel('ชื่อตัวละคร').setPlaceholder('เช่น Nami').setStyle(TextInputStyle.Short).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('char_num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true))
        );
        await interaction.showModal(modal);
    }

    // 4. ส่งรูป (แก้เป็นส่งแบบ Plain Text Link)
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId === 'modal_nsfw';
        const rawName = interaction.fields.getTextInputValue('char_name');
        let amount = parseInt(interaction.fields.getTextInputValue('char_num')) || 1;
        if (amount > 5) amount = 5;

        try {
            // แปลภาษา
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            // ใช้ API เดิม (Rule34/Safebooru)
            const apiBase = isNSFW ? 'https://api.rule34.xxx' : 'https://safebooru.org';
            const apiUrl = `${apiBase}/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            // ใส่ User-Agent แก้ 401 Error
            const res = await axios.get(apiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            const posts = res.data;

            if (!posts || posts.length === 0) {
                return interaction.editReply(`😿 ปายหา **"${rawName}"** ไม่เจอเลยค่ะ (ลองพิมพ์ชื่ออังกฤษดูน้า เช่น Nami)`);
            }

            let sentCount = 0;
            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i].file_url || posts[i].sample_url;
                if (!imgUrl) continue;

                // --- KEY FIX: ส่งแค่ลิ้งค์เพียวๆ ---
                // Discord จะเปลี่ยนลิ้งค์เป็นรูปให้เอง และไม่ค่อยบล็อกวิธีนี้
                await interaction.user.send({ 
                    content: `**${i+1}. ${rawName}**\n${imgUrl}` 
                }).catch(e => console.log('DM Fail'));
                
                sentCount++;
            }

            if (sentCount > 0) {
                await interaction.editReply(`✅ ส่งลิ้งค์รูป **${rawName}** จำนวน **${sentCount}** รูปเข้า DM แล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! (ช่วยเปิด DM ในตั้งค่า Privacy & Safety -> "Allow direct messages from server members" ด้วยนะคะ)`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
});

client.login(TOKEN);
