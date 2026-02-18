// ==========================================
//  Z-GEN X (PAI EDITION) - V3.0 (Rule34 Fix)
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
    SlashCommandBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google'); 

// --- 1. ดึงค่าจาก Railway Variables ---
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

if (!TOKEN || !CLIENT_ID || !OWNER_ID) {
    console.error("❌ Error: ลืมใส่ Variables ใน Railway ค่ะ!");
    process.exit(1); 
}

// --- 2. ระบบกันหลับ ---
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X System (Rule34 Mode) is Online! 💖'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Web Server Ready!'));

// --- 3. สร้างตัวบอท ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// --- 4. ลงทะเบียนคำสั่ง ---
const commands = [
    new SlashCommandBuilder()
        .setName('pai_secret') 
        .setDescription('เสก Panel ค้นหารูป (เฉพาะซีม่อนสั่งเสก - สมาชิกทุกคนใช้ได้)')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// --- 5. เริ่มทำงาน ---
client.once('ready', async () => {
    console.log(`✨ น้องปาย V3 (Rule34) พร้อมลุย! ล็อกอิน: ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ ลงทะเบียนคำสั่งเรียบร้อย!');
    } catch (error) {
        console.error('❌ ลงทะเบียนคำสั่งพลาด:', error);
    }
});

// --- 6. Interaction Handler ---
client.on('interactionCreate', async interaction => {
    
    // 🟢 เรียก Panel
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pai_secret') {
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('💋 Z-GEN X : ULTIMATE GALLERY')
                .setDescription('**คลังแสงรูป Anime & Secret Zone**\n\n👇 **วิธีใช้งาน:**\n1. เลือกโหมดในเมนู (ปกติ / 18+)\n2. กดปุ่มแล้วพิมพ์ชื่อตัวละคร (ไทย/อังกฤษ)\n3. บอทจะส่งรูปเข้า DM ส่วนตัว')
                .setColor('#FF0099')
                .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
                .setFooter({ text: 'Powered by Rule34 & Safebooru | By น้องปาย' });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('mode_select')
                .setPlaceholder('🔻 เลือกโหมดความบันเทิง...')
                .addOptions(
                    {
                        label: '✨ Anime (รูปปกติ)',
                        description: 'รูปน่ารักๆ ใสๆ จาก Safebooru',
                        value: 'source:safebooru',
                        emoji: '🎀'
                    },
                    {
                        label: '🔞 Secret (18+)',
                        description: 'รูปเด็ดๆ จัดเต็มจาก Rule34',
                        value: 'source:rule34',
                        emoji: '🔥'
                    },
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
        }
    }

    // 🟡 เลือกเมนู
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'mode_select') {
            const selectedMode = interaction.values[0];
            let label, btnStyle, btnId;

            if (selectedMode === 'source:safebooru') {
                label = '🚀 เริ่มค้นหารูปปกติ';
                btnStyle = ButtonStyle.Success;
                btnId = 'btn_open_modal_sfw';
            } else {
                label = '😈 เริ่มค้นหา 18+';
                btnStyle = ButtonStyle.Danger;
                btnId = 'btn_open_modal_nsfw';
            }

            const button = new ButtonBuilder().setCustomId(btnId).setLabel(label).setStyle(btnStyle);
            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({ 
                content: `✅ เลือกโหมดเรียบร้อย! กดปุ่มด้านล่างเพื่อใส่ชื่อตัวละครเลยค่ะ`, 
                components: [row],
                ephemeral: true 
            });
        }
    }

    // 🟠 เปิด Modal
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('btn_open_modal')) {
            const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
            const modal = new ModalBuilder()
                .setCustomId(`modal_gen_${mode}`)
                .setTitle(mode === 'nsfw' ? '😈 ค้นหา 18+ (Rule34)' : '✨ ค้นหาปกติ (Safebooru)');

            const nameInput = new TextInputBuilder()
                .setCustomId('input_name')
                .setLabel("ชื่อตัวละคร (ไทย/อังกฤษ)")
                .setPlaceholder("เช่น นามิ, Nami")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const amountInput = new TextInputBuilder()
                .setCustomId('input_amount')
                .setLabel("จำนวนรูป (1-5)")
                .setPlaceholder("5")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(nameInput), new ActionRowBuilder().addComponents(amountInput));
            await interaction.showModal(modal);
        }
    }

    // 🔴 ประมวลผล (เปลี่ยน API ใหม่)
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_gen')) {
            await interaction.deferReply({ ephemeral: true }); 

            const isNSFW = interaction.customId.includes('nsfw');
            const charNameRaw = interaction.fields.getTextInputValue('input_name');
            let amount = parseInt(interaction.fields.getTextInputValue('input_amount'));
            if (isNaN(amount) || amount < 1) amount = 1;
            if (amount > 5) amount = 5;

            try {
                // 1. แปลภาษา
                let searchName = charNameRaw;
                if (/[ก-๙]/.test(charNameRaw)) {
                    try {
                        searchName = await translate(charNameRaw, { to: 'en' });
                    } catch (e) { console.error('Translate error, using raw name'); }
                }

                // 2. ตั้งค่า API ใหม่ (Rule34 / Safebooru)
                const formattedName = searchName.trim().toLowerCase().replace(/ /g, '_');
                let apiUrl = '';

                if (isNSFW) {
                    // ใช้ Rule34 สำหรับ 18+ (ใช้ง่ายกว่า Gelbooru)
                    apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${formattedName}`;
                } else {
                    // ใช้ Safebooru สำหรับรูปปกติ
                    apiUrl = `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${formattedName}`;
                }
                
                console.log(`Fetching: ${apiUrl}`); // Log ดู URL

                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
                    }
                });

                // ตรวจสอบข้อมูล (บางเว็บส่งเป็น Array ตรงๆ บางเว็บซ้อนใน key)
                let posts = response.data;
                // ถ้า Safebooru/Rule34 ไม่เจอ จะคืนค่าว่าง หรือ array ว่าง
                if (!posts || posts.length === 0) {
                     await interaction.editReply(`😿 ปายหา **"${charNameRaw}"** (${formattedName}) ไม่เจอในโหมดนี้ค่ะ\n(ลองเปลี่ยนชื่อภาษาอังกฤษดู หรือตัวละครนี้อาจจะไม่มีรูปค่ะ)`);
                     return;
                }

                let successCount = 0;
                for (const post of posts) {
                    // Rule34/Safebooru field name คือ 'file_url' หรือ 'sample_url'
                    // บางที API ส่ง directory มา ต้องประกอบ Link เอง
                    let imageUrl = post.file_url;
                    
                    // แก้ไข Link สำหรับ Rule34/Safebooru (บางทีมันไม่ส่ง http มา)
                    if (!imageUrl.startsWith('http')) {
                        // fallback image logic (ซับซ้อนไป ตัดออก เอาที่ API ให้มาตรงๆ ก่อน)
                        // ส่วนใหญ่ API json=1 จะให้ file_url เต็มมาแล้ว
                    }

                    if (imageUrl) {
                        try {
                            const dmEmbed = new EmbedBuilder()
                                .setColor(isNSFW ? '#FF0000' : '#00FF00')
                                .setTitle(`รูปน้อง ${charNameRaw} มาแล้ว! ${isNSFW ? '🔞' : '✨'}`)
                                .setImage(imageUrl)
                                .setFooter({ text: `Source: ${isNSFW ? 'Rule34' : 'Safebooru'} | By น้องปาย` });

                            await interaction.user.send({ embeds: [dmEmbed] });
                            successCount++;
                        } catch (err) {
                            console.error("DM Error:", err);
                        }
                    }
                }

                if (successCount > 0) {
                    await interaction.editReply(`✅ ส่งรูป **${charNameRaw}** จำนวน **${successCount}** รูป ไปที่ DM แล้วค่ะ!`);
                } else {
                    await interaction.editReply(`❌ บอทเจอรูปนะ แต่ส่ง DM ไม่ได้! (ช่วยเปิด DM ให้คนแปลกหน้าทักได้หน่อยน้า)`);
                }

            } catch (error) {
                console.error("Critical Error:", error);
                await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message} (ลองค้นหาด้วยชื่อภาษาอังกฤษดูอีกทีนะคะ)`);
            }
        }
    }
});

client.login(TOKEN);
