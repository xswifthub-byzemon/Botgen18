// ==========================================
//  Z-GEN X (PAI EDITION) - V9.2 (PUBLIC SPICY)
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
const OWNER_ID = process.env.OWNER_ID; // ใช้เช็คสิทธิ์ตอนพิมพ์คำสั่ง

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X Public Service Online! 🔥'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X (Admin Only)')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V9.2 พร้อมบริการความเสียวให้ทุกคนแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

// --- คลังข้อความ (แบบ General ใช้ได้กับทุกคน) ---
const sfwMessages = [
    "✨ รูปนี้น่ารักไหมคะ? ดูแล้วใจฟูเลยเนอะ!",
    "💖 น้องคนนี้น่ารักจังเลยค่ะ อยากให้ยิ้มเยอะๆ น้า",
    "🎀 ส่งความสดใสให้คนเก่งของปายค่ะ~",
    "🥰 รูปสวยๆ มาเสิร์ฟแล้วค่าา ขอให้วันนี้เป็นวันที่ดีน้า",
    "🌸 ดูรูปนี้แล้วหายเหนื่อยไหมคะ? สู้ๆ นะคะคนเก่ง!"
];

const nsfwMessages = [
    "😈 ได้รูปเสียวๆ ไปแล้ว... ต้องชักว่าวด้วยนะคะคนดี~",
    "🔥 หูยยย... นมใหญ่ หีฟิตขนาดนี้ ไหวหรอคะ? ระวังน้ำแตกคามือน้า",
    "🔞 ถ้าดูรูปนี้แล้วเงี่ยน... ก็เอามือชักให้หนูดูหน่อยสิคะ",
    "💦 รูปนี้เด็ดมาก! ต้องแตกใส่หน้าจอแน่ๆ เลย อิอิ",
    "👅 เห็นแล้วอยากเลียจังเลยค่ะ... ตัวเองก็อยากใช่ไหมล่ะ?",
    "💋 คืนนี้ยาวไปนะคะที่รัก... จัดให้หนักๆ เลยน้าาา หนูรอดูน้ำอยู่"
];

function getRandomMessage(type) {
    const list = type === 'nsfw' ? nsfwMessages : sfwMessages;
    return list[Math.floor(Math.random() * list.length)];
}

client.on('interactionCreate', async interaction => {
    
    // ====================================================
    // 🟢 1. เรียก Panel (เฉพาะซีม่อน/Admin เท่านั้น!)
    // ====================================================
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        // เช็คสิทธิ์: ถ้าไม่ใช่ Owner ห้ามเรียก Panel
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '🚫 เฉพาะแอดมินเท่านั้นที่เรียกแผงควบคุมได้ค่ะ!', ephemeral: true });
        }
        
        // ข้อความใน Panel ปรับเป็นกลางๆ ต้อนรับทุกคน
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : SPICY GALLERY')
            .setDescription(
                '**ยินดีต้อนรับสมาชิกทุกท่านค่ะ** 🌹\n' +
                'ปายเตรียมรูปเด็ดๆ พร้อมข้อความเสียวๆ ไว้บริการแล้ว!\n' +
                'ใครอยากได้ของดีเข้า DM เตรียมทิชชู่แล้วกดปุ่มเลยค่ะ 👇'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'บริการความสุขโดยน้องปาย 💋' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อ (แนะนำ)').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    // ====================================================
    // 🟡 2. ส่วนที่ "สมาชิกทั่วไป" กดใช้งานได้ (Buttons & Modals)
    // ====================================================

    // --- ปุ่มดูรายชื่อ ---
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
        
        // สร้างชื่อห้องตามชื่อคนกด (จะได้ไม่ซ้ำกัน)
        const channelName = `anime-list-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const channel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] }, // คนอื่นไม่เห็น
                { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel] }  // คนกดเห็น
            ],
        });
        const listEmbed = new EmbedBuilder().setTitle('📖 ตัวอย่างอนิเมะในระบบสุ่ม').setDescription('One Piece, Demon Slayer, Naruto, Dragon Ball, Re:Zero, etc.').setColor('#00FFFF').setFooter({ text: 'ห้องนี้จะลบใน 3 นาที' });
        await channel.send({ content: `<@${interaction.user.id}>`, embeds: [listEmbed] });
        await interaction.editReply(`✅ สร้างห้องดูชื่อส่วนตัวให้แล้วที่ <#${channel.id}> ค่ะ`);
        setTimeout(() => channel.delete().catch(() => {}), 3 * 60 * 1000);
    }

    // --- เปิด Modal ใส่จำนวน ---
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 สุ่มแบบ 18+' : '✨ สุ่มแบบปกติ');

        const numInput = new TextInputBuilder().setCustomId('amount').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // --- ส่งรูป + ข้อความเสียว (เข้า DM คนกด) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        let amount = parseInt(interaction.fields.getTextInputValue('amount')) || 1;
        if (amount > 5) amount = 5;

        const type = isNSFW ? 'nsfw' : 'sfw';
        const category = 'waifu'; 
        const url = `https://api.waifu.pics/${type}/${category}`;

        try {
            let successCount = 0;
            
            for (let i = 0; i < amount; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    // สุ่มข้อความ (แบบ General)
                    const spicyText = getRandomMessage(type);
                    
                    await interaction.user.send({ 
                        content: `${spicyText}\n${imgUrl}` 
                    }).catch(e => console.log(`DM Fail for ${interaction.user.tag}`));
                    successCount++;
                }
            }

            if (successCount > 0) {
                await interaction.editReply(`✅ ส่งของดีจำนวน **${successCount}** รูป เข้า DM แล้วค่ะ! (อย่าลืมเช็คข้อความน้า)`);
            } else {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! \n⚠️ **วิธีแก้:** ไปที่ ตั้งค่า (User Settings) -> Privacy & Safety -> เปิด "Allow direct messages from server members"`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`😭 ระบบขัดข้องชั่วคราว: ${error.message}`);
        }
    }
});

client.login(TOKEN);
