// ==========================================
//  Z-GEN X (PAI EDITION) - V4.0 (Private Channel)
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
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google'); 

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V4.0 Private Channel is Ready! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V4.0 ระบบห้องลับพร้อมทำงานแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('💋 Z-GEN X : PRIVATE ROOM SYSTEM')
            .setDescription('**ยินดีต้อนรับค่ะซีม่อน**\nระบบจะสร้างห้องส่วนตัว (NSFW) เพื่อส่งรูปให้ท่านโดยเฉพาะ\n\n⚠️ **คำเตือน:** ห้องจะถูกลบอัตโนมัติภายใน 5 นาที!')
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const menu = new StringSelectMenuBuilder().setCustomId('mode_select').setPlaceholder('🔻 เลือกโหมด...').addOptions(
            { label: '✨ รูปปกติ (Safebooru)', value: 'sfw', emoji: '🎀' },
            { label: '🔞 รูป 18+ (Rule34)', value: 'nsfw', emoji: '🔥' }
        );
        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
    }

    if (interaction.isStringSelectMenu() && interaction.customId === 'mode_select') {
        const isNSFW = interaction.values[0] === 'nsfw';
        const btn = new ButtonBuilder()
            .setCustomId(isNSFW ? 'btn_nsfw' : 'btn_sfw')
            .setLabel(isNSFW ? '😈 เจนรูป 18+ (ในห้องลับ)' : '🚀 เจนรูปปกติ (ในห้องลับ)')
            .setStyle(isNSFW ? ButtonStyle.Danger : ButtonStyle.Success);
        await interaction.reply({ content: `✅ เลือกโหมด **${isNSFW ? '18+' : 'ปกติ'}** แล้วค่ะ!`, components: [new ActionRowBuilder().addComponents(btn)], ephemeral: true });
    }

    if (interaction.isButton()) {
        const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
        const modal = new ModalBuilder().setCustomId(`modal_${mode}`).setTitle('🔍 ค้นหาตัวละคร');
        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('name').setLabel('ชื่อตัวละคร (ไทย/อังกฤษ)').setStyle(TextInputStyle.Short).setRequired(true)),
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

            // --- ส่วนสำคัญ: สร้างห้องส่วนตัวแบบ NSFW ---
            const channelName = `secret-${interaction.user.username}`;
            const privateChannel = await interaction.guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                nsfw: true, // เปิดโหมด NSFW
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // ปิดไม่ให้ทุกคนเห็น
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }, // ให้เฉพาะคนกดเห็น
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] } // ให้บอทเห็น
                ],
            });

            await interaction.editReply(`✅ สร้างห้องลับเรียบร้อยค่ะ! ไปที่ห้อง <#${privateChannel.id}> ได้เลย~`);

            const introEmbed = new EmbedBuilder()
                .setColor('#FF0099')
                .setTitle(`💖 ห้องลับของ ${interaction.user.username} 💖`)
                .setDescription(`ปายหารูป **"${rawName}"** มาให้แล้วค่ะ!\n⌛ **ห้องนี้จะถูกลบอัตโนมัติภายใน 5 นาที**\nอย่าลืมบันทึกรูปไว้ในเครื่องนะคะนะคะซีม่อน~`)
                .setFooter({ text: 'Z-Gen X Private System' });

            await privateChannel.send({ content: `<@${interaction.user.id}>`, embeds: [introEmbed] });

            for (const p of posts) {
                const img = p.file_url || p.sample_url;
                if (!img) continue;
                const embed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setImage(img.startsWith('http') ? img : `https:${img}`);
                await privateChannel.send({ embeds: [embed] });
            }

            // --- ตั้งเวลาลบห้อง 5 นาที ---
            setTimeout(async () => {
                try {
                    await privateChannel.delete('หมดเวลาการใช้งานห้องลับ');
                } catch (e) { console.log('ลบห้องไม่สำเร็จ หรือห้องโดนลบไปแล้ว'); }
            }, 5 * 60 * 1000); // 5 นาที

        } catch (err) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${err.message}`);
        }
    }
});

client.login(TOKEN);
