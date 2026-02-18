// ==========================================
//  Z-GEN X (PAI EDITION) - V4.1 (Photo Fix)
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
app.get('/', (req, res) => res.send('Z-Gen X V4.1 Photo Fix is Ready! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V4.1 พร้อมแก้ตัวแล้วค่ะซีม่อน!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('💋 Z-GEN X : PRIVATE ROOM V4.1')
            .setDescription('**ระบบส่งรูปเข้าห้องลับส่วนตัว**\nเลือกโหมดที่ต้องการได้เลยค่ะ รอบนี้ปายจูนมาใหม่รูปขึ้นชัวร์!')
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
            .setLabel(isNSFW ? '😈 เจนรูป 18+ (ห้องลับ)' : '🚀 เจนรูปปกติ (ห้องลับ)')
            .setStyle(isNSFW ? ButtonStyle.Danger : ButtonStyle.Success);
        await interaction.reply({ content: `✅ โหมด **${isNSFW ? '18+' : 'ปกติ'}** พร้อมแล้ว! กดปุ่มเพื่อใส่ชื่อได้เลยค่ะ`, components: [new ActionRowBuilder().addComponents(btn)], ephemeral: true });
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

            if (!posts || posts.length === 0 || posts === "") {
                return interaction.editReply(`😿 ไม่เจอน้อง **"${rawName}"** เลยค่ะซีม่อน`);
            }

            // สร้างห้องส่วนตัว
            const privateChannel = await interaction.guild.channels.create({
                name: `secret-${interaction.user.username}`,
                type: ChannelType.GuildText,
                nsfw: true,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
                    { id: client.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles] }
                ],
            });

            await interaction.editReply(`✅ เตรียมรูปเสร็จแล้ว! เข้าไปดูที่ห้อง <#${privateChannel.id}> ได้เลยค่ะ`);

            await privateChannel.send({ 
                content: `💖 **ห้องลับของซีม่อนมาแล้ววว!** 💖\nปายหารูป **"${rawName}"** มาให้แล้วนะคะ\n⌛ ห้องนี้จะหายไปใน 5 นาที อย่าลืมเซฟน้าาา!` 
            });

            // ส่งรูปทีละรูปด้วยระบบ Embed แบบใหม่
            for (const p of posts) {
                const imgUrl = p.file_url || p.sample_url || p.preview_url;
                if (!imgUrl) continue;

                const finalImg = imgUrl.startsWith('http') ? imgUrl : `https:${imgUrl}`;
                
                const photoEmbed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`✨ น้อง ${rawName} (${finalTag})`)
                    .setImage(finalImg)
                    .setURL(finalImg); // ใส่ลิงก์เผื่อรูปไม่โหลดในบางเครื่อง

                await privateChannel.send({ embeds: [photoEmbed] }).catch(e => console.log("Send Image Fail", e));
            }

            // ตั้งเวลาลบห้อง
            setTimeout(async () => {
                try { await privateChannel.delete(); } catch (e) {}
            }, 5 * 60 * 1000);

        } catch (err) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${err.message}`);
        }
    }
});

client.login(TOKEN);
