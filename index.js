// ==========================================
//  Z-GEN X (PAI EDITION) - V12.0 (ULTIMATE GROUP DM)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');

// 🔒 ดึงค่าจาก Environment Variables (Railway)
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

// 🌐 Web Server (สำหรับปลุกบอท 24/7)
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V12.0 is Online! 🔥'));
app.listen(process.env.PORT || 3000);

// 🤖 ตั้งค่า Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// 📝 คำสั่ง Slash Command
const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X (Admin Only)')
].map(command => command.toJSON());

// ⚙️ ลงทะเบียนคำสั่ง
const rest = new REST({ version: '10' }).setToken(TOKEN);
client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V12.0 พร้อมส่งออกแบบกลุ่มแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

// 💾 ตัวแปรเก็บค่าการเลือกของแต่ละคน
const userPreferences = {};

// --- คลังข้อความเสียว (Random Text) ---
const sfwMessages = [
    "✨ งื้อออ... น่ารักมากเลยค่ะตัวเอง!",
    "💖 ดูรูปนี้แล้วใจฟูเลยเนอะ อยากให้ยิ้มเยอะๆ น้า",
    "🎀 ส่งความสดใสให้คนเก่งของปายค่ะ~",
    "🥰 คัดมาให้แบบเน้นๆ เลยน้า ชอบไหมคะ?"
];

const nsfwMessages = [
    "😈 โอ๊ยย... รูปนี้เด็ดมาก! ต้องชักว่าวโชว์ปายแล้วล่ะ",
    "🔥 หูยยย... เห็นแล้วเสียวแทนเลยค่ะ ไหวหรอคะตัวเอง?",
    "🔞 ถ้าดูแล้วเงี่ยน... ก็เอามือชักให้หนูดูหน่อยสิคะ",
    "💦 คืนนี้ยาวไปนะคะที่รัก... หนูรอดูน้ำอยู่",
    "💋 เก็บไว้ดูตอนดึกๆ นะคะ ระวังน้ำหมดตัวน้าาา~"
];

function getRandomMessage(type) {
    const list = type === 'nsfw' ? nsfwMessages : sfwMessages;
    return list[Math.floor(Math.random() * list.length)];
}

// ==========================================
//  ⚡ MAIN INTERACTION LOGIC
// ==========================================
client.on('interactionCreate', async interaction => {
    
    // 1. เรียก Panel (เฉพาะ Admin)
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: '🚫 เฉพาะแอดมินเท่านั้นที่เรียกแผงควบคุมได้ค่ะ!', ephemeral: true });
        }
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : ULTIMATE GALLERY')
            .setDescription('**ยินดีต้อนรับสมาชิกทุกท่านค่ะ** 🌹\nคลังแสงที่ครบเครื่องที่สุดของน้องปายมาแล้ว!\n\n1️⃣ **เลือกแนวที่ชอบ** ในเมนูด้านล่าง\n2️⃣ **กดปุ่ม** สีเขียว (น่ารัก) หรือ สีแดง (18+)\n3️⃣ **รับของดี** แบบจัดเต็มใน DM!')
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
            .setFooter({ text: 'บริการความสุขโดยน้องปาย 💋 V12.0' });

        // Dropdown เลือกแนว
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('gender_select')
            .setPlaceholder('🔻 เลือกแนวที่อยากดู (กดเลยจ้า)')
            .addOptions(
                { label: 'สาวน้อย (Waifu)', description: 'สาวสวย นมโต หีฟิต', value: 'waifu', emoji: '🚺' },
                { label: 'สาวดุ้น (Trap)', description: 'น่ารักเหมือนผู้หญิง แต่มีดุ้น!', value: 'trap', emoji: '🍆' },
                { label: 'ภาพขยับได้ (GIF 18+)', description: 'ดุ๊กดิ๊กถึงใจ ถอดหมดเปลือก!', value: 'gif', emoji: '🎥' }
            );

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('open_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥')
        );

        await interaction.reply({ embeds: [embed], components: [new ActionRowBuilder().addComponents(selectMenu), btnRow] });
    }

    // 2. จำค่าการเลือก
    if (interaction.isStringSelectMenu() && interaction.customId === 'gender_select') {
        const selected = interaction.values[0];
        userPreferences[interaction.user.id] = selected; 
        let label = selected === 'trap' ? 'สาวดุ้น' : (selected === 'gif' ? 'ภาพขยับได้ (GIF)' : 'สาวน้อย');
        await interaction.reply({ content: `✅ เลือกดู **${label}** แล้วค่ะ! กดปุ่มสีแดง/เขียวต่อได้เลย`, ephemeral: true });
    }

    // 3. เปิด Modal ใส่จำนวน
    if (interaction.isButton() && (interaction.customId === 'open_sfw' || interaction.customId === 'open_nsfw')) {
        const isNSFW = interaction.customId === 'open_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 สุ่มแบบ 18+' : '✨ สุ่มแบบปกติ');

        const numInput = new TextInputBuilder().setCustomId('amount').setLabel('จำนวนรูป/GIF (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(numInput));
        await interaction.showModal(modal);
    }

    // 4. ส่งรูป + ข้อความ (แบบกลุ่ม Embed)
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        
        const isNSFW = interaction.customId === 'modal_nsfw';
        let amount = parseInt(interaction.fields.getTextInputValue('amount')) || 1;
        if (amount > 5) amount = 5;

        let selection = userPreferences[interaction.user.id] || 'waifu';
        let apiCategory = selection;
        const type = isNSFW ? 'nsfw' : 'sfw';

        // ปรับ Category ตามโหมด (API Logic)
        if (selection === 'gif') apiCategory = isNSFW ? 'blowjob' : 'dance';
        if (!isNSFW && selection === 'trap') apiCategory = 'waifu';

        const url = `https://api.waifu.pics/${type}/${apiCategory}`;
        let embedsToSend = [];

        try {
            // วนลูปดึงรูปและสร้าง Embed
            for (let i = 0; i < amount; i++) {
                const res = await axios.get(url);
                const imgUrl = res.data.url;

                if (imgUrl) {
                    const spicyText = getRandomMessage(type);
                    // สร้าง Embed แบบไม่มี Title/URL เพื่อไม่ให้กดลิงก์ได้
                    const embed = new EmbedBuilder()
                        .setDescription(spicyText) // ใส่ข้อความใน Description
                        .setImage(imgUrl) // ใส่รูปใน Image
                        .setColor(isNSFW ? '#FF0000' : '#00FF00'); // สีแดง (18+) หรือ เขียว (น่ารัก)
                    
                    embedsToSend.push(embed);
                }
            }

            // ส่ง Embeds ทั้งหมดเข้า DM ทีเดียว (สูงสุด 10 Embeds ต่อข้อความ)
            if (embedsToSend.length > 0) {
                await interaction.user.send({ embeds: embedsToSend });
                await interaction.editReply(`✅ ส่งรูปจำนวน **${embedsToSend.length}** รูป เข้า DM แบบกลุ่มเรียบร้อยแล้วค่ะ!`);
            } else {
                await interaction.editReply(`❌ ไม่สามารถดึงรูปภาพจาก API ได้ค่ะ ลองใหม่อีกครั้งนะคะ`);
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
