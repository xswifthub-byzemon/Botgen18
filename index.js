// ==========================================
//  Z-GEN X (PAI EDITION) - V6.1 (DM FIX)
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
app.get('/', (req, res) => res.send('Z-Gen X V6.1 Fixed is Online! 💖'));
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
        console.log(`✨ น้องปาย V6.1 พร้อมส่งรูปเข้า DM แล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // 1. หน้า Panel หลัก
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : ANIME GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับค่ะ ซีม่อน**\n' +
                'ปายแก้ระบบส่ง DM ให้แล้วนะคะ รอบนี้ส่งได้ชัวร์!\n\n' +
                '✨ **วิธีใช้**\n' +
                '1. เลือกโหมด (น่ารัก/สยิว)\n' +
                '2. ใส่ชื่อตัวละคร + จำนวน\n' +
                '3. รอรับของใน DM ได้เลย!'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อตัวละคร').setStyle(ButtonStyle.Secondary).setEmoji('📖')
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
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] },
                { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel] } 
            ],
        });

        const listEmbed = new EmbedBuilder()
            .setTitle('📖 รายชื่อตัวละครแนะนำ')
            .setColor('#00FFFF')
            .addFields(
                { name: '🔥 One Piece', value: 'Nami, Robin, Hancock, Yamato', inline: false },
                { name: '👹 Demon Slayer', value: 'Nezuko, Shinobu, Mitsuri, Daki', inline: false },
                { name: '🔮 Other Hits', value: 'Rem, Zero Two, Makima, Yor Forger', inline: false }
            )
            .setFooter({ text: 'ห้องนี้จะลบใน 5 นาทีค่ะ' });

        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้องรายชื่อแล้วที่ <#${channel.id}> ค่ะ`);
        setTimeout(() => channel.delete().catch(() => {}), 5 * 60 * 1000);
    }

    // 3. เปิด Modal ใส่ชื่อ
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

    // 4. ส่งรูปเข้า DM (จุดที่แก้!)
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

            const apiBase = isNSFW ? 'https://api.rule34.xxx' : 'https://safebooru.org';
            const apiUrl = `${apiBase}/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;

            const res = await axios.get(apiUrl);
            const posts = res.data;

            if (!posts || posts.length === 0) return interaction.editReply(`😿 ไม่เจอน้อง **"${rawName}"** เลยค่ะ ลองเช็คชื่ออีกทีน้า`);

            let sentCount = 0;
            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i].file_url || posts[i].sample_url;
                if (!imgUrl) continue;

                // สร้างปุ่มโหลด
                const downloadBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('📥 โหลดรูปชัดๆ').setStyle(ButtonStyle.Link).setURL(imgUrl)
                );

                // --- KEY FIX: ส่งเป็น content (Link) แทน Embed เพื่อไม่ให้โดนบล็อก ---
                await interaction.user.send({ 
                    content: `✨ **รูปที่ ${i+1}: ${rawName}**\n${imgUrl}`, 
                    components: [downloadBtn] 
                }).catch(() => console.log('DM Blocked'));
                
                sentCount++;
            }

            if (sentCount > 0) {
                await interaction.editReply(`✅ ส่งรูป **${rawName}** จำนวน **${sentCount}** รูปเข้า DM แล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ส่งไม่ไปค่ะ! (กรุณาเปิด DM ให้คนแปลกหน้าทักได้ในตั้งค่า Discord ด้วยนะคะ)`);
            }

        } catch (error) {
            await interaction.editReply(`😭 Error: ${error.message}`);
        }
    }
});

client.login(TOKEN);
