// ==========================================
//  Z-GEN X (PAI EDITION) - V12.1 (ULTIMATE FULL SYSTEM)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits,
    StringSelectMenuBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');

// 🔒 ดึงค่าจาก Environment Variables
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

// 🌐 Web Server
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V12.1 is Online! 🔥'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X (Admin Only)')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

const userPreferences = {};

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V12.1 พร้อมลุยทุกระบบแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

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
    "💋 เก็บไว้ดูตอนดึกๆ นะคะ ระวังน้ำหมดตัวน้าาา~",
    "🎥 อูยยย... ขยับดุ๊กดิ๊กขนาดนี้ ทนไหวหรอคะคนเก่ง? 💦" 
];

function getRandomMessage(type) {
    const list = type === 'nsfw' ? nsfwMessages : sfwMessages;
    return list[Math.floor(Math.random() * list.length)];
}

client.on('interactionCreate', async interaction => {
    
    // 1. เรียก Panel
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '🚫 เฉพาะแอดมินเท่านั้นที่เรียกแผงควบคุมได้ค่ะ!', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : ULTIMATE GALLERY')
            .setDescription(
                '**ยินดีต้อนรับสมาชิกทุกท่านค่ะ** 🌹\n' +
                'คลังแสงที่ครบเครื่องที่สุดของน้องปายมาแล้ว!\n\n' +
                '1️⃣ **เลือกแนวที่ชอบ** ในเมนูด้านล่าง\n' +
                '2️⃣ **กดปุ่ม** สีเขียว (น่ารัก) หรือ สีแดง (18+)\n' +
                '3️⃣ **รับของดี** แบบกลุ่มจัดเต็มใน DM ได้เลย!'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'บริการความสุขโดยน้องปาย 💋' });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gender_select')
            .setPlaceholder('🔻 เลือกแนวที่อยากดู (กดเลยจ้า)')
            .addOptions(
                { label: 'สาวน้อย (Waifu)', description: 'สาวสวย นมโต หีฟิต', value: 'waifu', emoji: '🚺' },
                { label: 'สาวดุ้น (Trap)', description: 'น่ารักเหมือนผู้หญิง แต่มีดุ้น!', value: 'trap', emoji: '🍆' },
                { label: 'เลสเบี้ยน (Yuri)', description: 'หญิงรักหญิง นัวเนียสุดฟิน', value: 'neko', emoji: '✂️' },
                { label: 'ภาพขยับได้ (GIF 18+)', description: 'ดุ๊กดิ๊กถึงใจ ถอดหมดเปลือก!', value: 'gif', emoji: '🎥' }
            );

        // ✅ ปายเอาปุ่ม open_list กลับมาใส่ตรงนี้แล้วค่ะ!
        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥'),
            new ButtonBuilder().setCustomId('open_list').setLabel('รายชื่อ (แนะนำ)').setStyle(ButtonStyle.Secondary).setEmoji('📖')
        );

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu), btnRow] });
    }

    // 2. จำค่าการเลือก
    if (interaction.isStringSelectMenu() && interaction.customId === 'gender_select') {
        const selected = interaction.values[0];
        userPreferences[interaction.user.id] = selected; 
        
        let label = 'สาวน้อย';
        if (selected === 'trap') label = 'สาวดุ้น';
        if (selected === 'neko') label = 'เลสเบี้ยน';
        if (selected === 'gif') label = 'ภาพขยับได้ (GIF)';

        await interaction.reply({ content: `✅ เลือกดู **${label}** แล้วค่ะ! กดปุ่มสีแดง/เขียวต่อได้เลย`, ephemeral: true });
    }

    // 3. ปุ่มดูรายชื่อ (✅ เอาระบบสร้างห้องชั่วคราวกลับมาแล้ว)
    if (interaction.isButton() && interaction.customId === 'open_list') {
        await interaction.deferReply({ ephemeral: true });
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

    // 4. เปิด Modal ใส่จำนวน
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 สุ่มแบบ 18+' : '✨ สุ่มแบบปกติ');

        const numInput = new TextInputBuilder().setCustomId('amount').setLabel('จำนวนรูป/GIF (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // 5. ส่งรูป + ข้อความ (ระบบ DM แบบกลุ่มที่ซีม่อนต้องการ)
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        let amount = parseInt(interaction.fields.getTextInputValue('amount')) || 1;
        if (amount > 5) amount = 5;

        let selection = userPreferences[interaction.user.id] || 'waifu';
        let apiCategory = 'waifu'; 
        
        if (selection === 'waifu') apiCategory = 'waifu';
        else if (selection === 'trap') apiCategory = 'trap';
        else if (selection === 'neko') apiCategory = isNSFW ? 'neko' : 'kiss';
        else if (selection === 'gif') apiCategory = isNSFW ? 'blowjob' : 'dance'; 

        const type = isNSFW ? 'nsfw' : 'sfw';
        const finalCategory = (!isNSFW && apiCategory === 'trap') ? 'waifu' : apiCategory;
        const url = `https://api.waifu.pics/${type}/${finalCategory}`;
        
        let embedsToSend = [];

        try {
            for (let i = 0; i < amount; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    const spicyText = getRandomMessage(type);
                    // ใช้ Embeds จัดกลุ่มรูปให้กดลิงก์ไม่ได้
                    const embed = new EmbedBuilder()
                        .setDescription(spicyText)
                        .setImage(imgUrl)
                        .setColor(isNSFW ? '#FF0000' : '#00FF00');
                    
                    embedsToSend.push(embed);
                }
            }

            if (embedsToSend.length > 0) {
                await interaction.user.send({ embeds: embedsToSend }).catch(e => { throw e });
                
                let label = 'สาวน้อย';
                if (selection === 'trap') label = 'สาวดุ้น';
                if (selection === 'neko') label = 'เลสเบี้ยน';
                if (selection === 'gif') label = 'ภาพขยับได้ (GIF)';
                
                await interaction.editReply(`✅ ส่ง **${label}** จำนวน **${embedsToSend.length}** รูป เข้า DM แบบกลุ่มเรียบร้อยแล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ดึงรูปไม่ได้ค่ะ ลองใหม่อีกครั้งน้า`);
            }

        } catch (error) {
            console.error(error);
            if (error.code === 50007) {
                await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! (กรุณาเปิดรับข้อความจากคนแปลกหน้าใน Server ด้วยน้า)`);
            } else {
                await interaction.editReply(`😭 ระบบขัดข้อง: ${error.message}`);
            }
        }
    }
});

client.login(TOKEN);
