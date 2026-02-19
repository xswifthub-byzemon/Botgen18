// ==========================================
//  Z-GEN X (PAI EDITION) - V9.5 (FIXED CRASH)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits,
    StringSelectMenuBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X Fixed Mode is Online! 🔥'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X (Admin Only)')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// ตัวแปรเก็บค่าการเลือกเพศของแต่ละคน
const userPreferences = {};

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V9.5 (Fixed) พร้อมทำงานแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

// --- คลังข้อความเสียว ---
const sfwMessages = [
    "✨ งื้อออ... น่ารักมากเลยค่ะตัวเอง!",
    "💖 ดูรูปนี้แล้วใจฟูเลยเนอะ อยากให้ยิ้มเยอะๆ น้า",
    "🎀 ส่งความสดใสให้คนเก่งของปายค่ะ~",
    "🥰 คัดมาให้แบบเน้นๆ เลยน้า ชอบไหมคะ?",
    "🌸 ดูแล้วหายเหนื่อยไหมคะ? สู้ๆ นะคะคนเก่ง!"
];

const nsfwMessages = [
    "😈 โอ๊ยย... รูปนี้เด็ดมาก! ต้องชักว่าวโชว์ปายแล้วล่ะ",
    "🔥 หูยยย... เห็นแล้วเสียวแทนเลยค่ะ ไหวหรอคะตัวเอง?",
    "🔞 ถ้าดูรูปนี้แล้วเงี่ยน... ก็เอามือชักให้หนูดูหน่อยสิคะ",
    "💦 คืนนี้ยาวไปนะคะที่รัก... จัดให้หนักๆ เลยน้าาา หนูรอดูน้ำอยู่",
    "👅 น่าเลียจังเลยค่ะ... ตัวเองก็อยากใช่ไหมล่ะ? อิอิ",
    "💋 เก็บไว้ดูตอนดึกๆ นะคะ ระวังน้ำหมดตัวน้าาา~"
];

function getRandomMessage(type) {
    const list = type === 'nsfw' ? nsfwMessages : sfwMessages;
    return list[Math.floor(Math.random() * list.length)];
}

client.on('interactionCreate', async interaction => {
    
    // 1. เรียก Panel (เฉพาะ Admin/Zimon)
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '🚫 เฉพาะแอดมินเท่านั้นที่เรียกแผงควบคุมได้ค่ะ!', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : SPICY GALLERY')
            .setDescription(
                '**ยินดีต้อนรับสมาชิกทุกท่านค่ะ** 🌹\n' +
                'ปายอัปเกรดใหม่! เลือกแนวที่ชอบได้เลย\n\n' +
                '1️⃣ **เลือกสไตล์** ในเมนูด้านล่าง\n' +
                '2️⃣ **กดปุ่ม** สีเขียว หรือ สีแดง\n' +
                '3️⃣ **รับของดี** ใน DM ได้เลย!'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'บริการความสุขโดยน้องปาย 💋' });

        // Dropdown เลือกเพศ (แก้ไข Emoji ตรงนี้!)
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gender_select')
            .setPlaceholder('🔻 เลือกแนวที่อยากดู (กดเลยจ้า)')
            .addOptions(
                { label: 'สาวน้อย (Girl)', description: 'สาวสวย นมโต หีฟิต', value: 'waifu', emoji: '🚺' },
                // เปลี่ยน Emoji เป็น 🍆 (มะเขือยาว) เพื่อสื่อถึงดุ้น และไม่บัคแน่นอน
                { label: 'สาวดุ้น (Trap)', description: 'น่ารักเหมือนผู้หญิง แต่มีดุ้น!', value: 'trap', emoji: '🍆' }
            );

        // ปุ่มกด
        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อ (แนะนำ)').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [
                new ActionRowBuilder().addComponents(selectMenu), 
                btnRow
            ] 
        });
    }

    // 2. จำค่าการเลือก
    if (interaction.isStringSelectMenu() && interaction.customId === 'gender_select') {
        const selected = interaction.values[0];
        userPreferences[interaction.user.id] = selected; 
        
        const label = selected === 'waifu' ? '🚺 สาวน้อย' : '🍆 สาวดุ้น';
        await interaction.reply({ content: `✅ ปายจำแล้วค่ะ! ตัวเองเลือกดู **${label}** นะคะ (กดปุ่มสีแดง/เขียวต่อได้เลย)`, ephemeral: true });
    }

    // 3. ปุ่มดูรายชื่อ
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        // สร้างชื่อห้องแบบปลอดภัย (ลบอักขระพิเศษออก)
        const safeName = interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
        const channelName = `anime-list-${safeName}`;
        
        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] } 
            ],
        });
        const listEmbed = new EmbedBuilder().setTitle('📖 อนิเมะในระบบสุ่ม').setDescription('One Piece, Demon Slayer, Naruto, Dragon Ball, Re:Zero, etc.').setColor('#00FFFF').setFooter({ text: 'ห้องนี้จะลบใน 3 นาที' });
        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้องดูชื่อส่วนตัวให้แล้วที่ <#${channel.id}> ค่ะ`);
        setTimeout(() => channel.delete().catch(() => {}), 3 * 60 * 1000);
    }

    // 4. เปิด Modal
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 สุ่มแบบ 18+' : '✨ สุ่มแบบปกติ');

        const numInput = new TextInputBuilder().setCustomId('amount').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // 5. ส่งรูป + ข้อความ
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        let amount = parseInt(interaction.fields.getTextInputValue('amount')) || 1;
        if (amount > 5) amount = 5;

        // ดึงค่าเพศ (Default = waifu)
        const category = userPreferences[interaction.user.id] || 'waifu';
        const type = isNSFW ? 'nsfw' : 'sfw';
        
        const url = `https://api.waifu.pics/${type}/${category}`;

        try {
            let successCount = 0;
            
            for (let i = 0; i < amount; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    const spicyText = getRandomMessage(type);
                    await interaction.user.send({ 
                        content: `${spicyText}\n${imgUrl}` 
                    }).catch(e => console.log(`DM Fail`));
                    successCount++;
                }
            }

            if (successCount > 0) {
                const label = category === 'waifu' ? 'สาวน้อย' : 'สาวดุ้น';
                await interaction.editReply(`✅ ส่ง **${label}** จำนวน **${successCount}** รูป เข้า DM แล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! (กรุณาเปิดรับข้อความจากคนแปลกหน้าใน Server ด้วยน้า)`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 ระบบขัดข้อง: ${error.message}`);
        }
    }
});

client.login(TOKEN);
