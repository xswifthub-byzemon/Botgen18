// ==========================================
//  Z-GEN X (PAI EDITION) - V8.0 (WAIFU RANDOM)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits
} = require('discord.js');
const axios = require('axios');
const express = require('express');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X Waifu Random is Online! 💖'));
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
        console.log(`✨ น้องปาย V8.0 (Waifu Random) พร้อมสุ่มของดีแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // --- 1. หน้า Panel หลัก ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : RANDOM GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับค่ะ ซีม่อน**\n' +
                'ปายกลับมาใช้ระบบ "สุ่มรูป" ด้วย API เดิมที่ส่ง DM ได้ชัวร์ๆ แล้วค่ะ!\n\n' +
                '✨ **วิธีใช้**\n' +
                '1. กดปุ่มเลือกโหมด (น่ารัก/สยิว)\n' +
                '2. ใส่จำนวนรูปที่ต้องการ (1-5)\n' +
                '3. รอรับรูปใน DM ทันที (ไม่ต้องพิมพ์ชื่อ)'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'Service by น้องปาย' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('สุ่มน่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สุ่มสยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('ดูรายชื่อ (แนะนำ)').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // --- 2. ปุ่มดูรายชื่อ (กดเล่นๆ) ---
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        const channel = await interaction.guild.channels.create({
            name: `anime-list`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }
            ],
        });
        const listEmbed = new EmbedBuilder()
            .setTitle('📖 ตัวอย่างอนิเมะที่มีในระบบสุ่ม')
            .setDescription('**ระบบจะสุ่มจากเรื่องดังๆ เหล่านี้ให้เองค่ะ:**\nOne Piece, Demon Slayer, Naruto, Dragon Ball, Re:Zero, Chainsaw Man และอีกเพียบ!')
            .setColor('#00FFFF')
            .setFooter({ text: 'ห้องนี้จะลบใน 3 นาที' });
        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้องดูชื่อแล้วที่ <#${channel.id}> ค่ะ`);
        setTimeout(() => channel.delete().catch(() => {}), 3 * 60 * 1000);
    }

    // --- 3. เปิด Modal (ใส่จำนวนอย่างเดียว) ---
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 สุ่มแบบ 18+' : '✨ สุ่มแบบปกติ');

        // ใส่แค่ช่องจำนวนตามที่ซีม่อนสั่ง
        const numInput = new TextInputBuilder()
            .setCustomId('amount')
            .setLabel('จำนวนรูปที่ต้องการ (1-5)')
            .setValue('5')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // --- 4. ประมวลผลและส่ง DM (ใช้ waifu.pics) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        let amount = parseInt(interaction.fields.getTextInputValue('amount')) || 1;
        if (amount > 5) amount = 5;

        // API ของ Waifu.pics (ตัวที่เคยส่งได้)
        const type = isNSFW ? 'nsfw' : 'sfw';
        const category = 'waifu'; // หมวดหมู่มาตรฐาน
        const url = `https://api.waifu.pics/${type}/${category}`;

        try {
            let successCount = 0;
            
            // วนลูปตามจำนวนที่ขอ
            for (let i = 0; i < amount; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    // ส่งแบบ Link ตรงๆ (Discord ไม่บล็อกแน่นอน)
                    await interaction.user.send({ 
                        content: `**${isNSFW ? '🔥' : '🎀'} รูปที่ ${i+1}**\n${imgUrl}` 
                    }).catch(e => console.log('DM Fail'));
                    successCount++;
                }
            }

            if (successCount > 0) {
                await interaction.editReply(`✅ สุ่มสาวๆ จำนวน **${successCount}** รูป ส่งเข้า DM เรียบร้อยแล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! (เช็คการตั้งค่า Privacy ของ Discord ด้วยน้า)`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
});

client.login(TOKEN);
