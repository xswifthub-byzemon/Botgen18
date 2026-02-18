// ==========================================
//  Z-GEN X (PAI EDITION) - V2.0 FINAL
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
const translate = require('translate-google'); // วุ้นแปลภาษา

// --- 1. ดึงค่าจาก Railway Variables ---
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

if (!TOKEN || !CLIENT_ID || !OWNER_ID) {
    console.error("❌ Error: ลืมใส่ Variables (TOKEN, CLIENT_ID, OWNER_ID) ใน Railway ค่ะ!");
    process.exit(1); 
}

// --- 2. ระบบกันหลับ ---
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X System is Online for Zimon! 💖'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Web Server Ready!'));

// --- 3. สร้างตัวบอท ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// --- 4. ลงทะเบียนคำสั่ง Slash Command ---
const commands = [
    new SlashCommandBuilder()
        .setName('pai_secret') 
        .setDescription('เสก Panel ค้นหารูป (เฉพาะซีม่อนสั่งได้ - สมาชิกกดใช้ได้)')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// --- 5. เริ่มทำงาน ---
client.once('ready', async () => {
    console.log(`✨ น้องปาย V2 พร้อมทำงาน! ล็อกอิน: ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ ลงทะเบียนคำสั่งเรียบร้อย!');
    } catch (error) {
        console.error('❌ ลงทะเบียนคำสั่งพลาด:', error);
    }
});

// --- 6. จัดการ Interaction ---
client.on('interactionCreate', async interaction => {
    
    // ====================================================
    // 🟢 ส่วนที่ 1: คำสั่งเรียก Panel (เฉพาะซีม่อนใช้ได้)
    // ====================================================
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pai_secret') {
            
            // เช็คว่าเป็นซีม่อนไหม (คนเสก Panel ต้องเป็นซีม่อน)
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ 
                    content: '🚫 คำสั่งนี้สำหรับ **ซีม่อน** เท่านั้นค่ะ!', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('💋 Z-GEN X PUBLIC PANEL')
                .setDescription('**บริการค้นหารูป Anime & Secret Zone**\n\n👇 **วิธีใช้งานสำหรับสมาชิก:**\n1. เลือกโหมดที่ต้องการในเมนูด้านล่าง\n2. บอทจะส่งปุ่มกดให้ท่าน (เห็นแค่คนเดียว)\n3. กดปุ่มและกรอกชื่อตัวละคร (ไทย/อังกฤษ ก็ได้)')
                .setColor('#FF0099')
                .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif')
                .setFooter({ text: 'Service by น้องปาย | ใช้ได้ทุกคน' });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('mode_select')
                .setPlaceholder('🔻 จิ้มเลือกโหมดตรงนี้เลยจ้า...')
                .addOptions(
                    {
                        label: '✨ Anime Gallery (ทั่วไป)',
                        description: 'ค้นหารูปอนิเมะน่ารักๆ',
                        value: 'rating:general',
                        emoji: '🎀'
                    },
                    {
                        label: '🔞 Secret Zone (18+)',
                        description: 'ค้นหารูปเด็ดๆ (ระวังหลังด้วยนะ)',
                        value: 'rating:explicit',
                        emoji: '🔥'
                    },
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // ephemeral: false = ทุกคนเห็น Panel นี้
            await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });
        }
    }

    // ====================================================
    // 🟡 ส่วนที่ 2: ตอนสมาชิกเลือกเมนู (Dropdown)
    // ====================================================
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'mode_select') {
            const selectedMode = interaction.values[0];
            let label = '';
            let btnStyle = ButtonStyle.Primary;
            let btnId = '';

            if (selectedMode === 'rating:general') {
                label = '🚀 กดปุ่มนี้เพื่อเริ่มค้นหา (ปกติ)';
                btnStyle = ButtonStyle.Success;
                btnId = 'btn_open_modal_sfw';
            } else {
                label = '😈 กดปุ่มนี้เพื่อเริ่มค้นหา (18+)';
                btnStyle = ButtonStyle.Danger;
                btnId = 'btn_open_modal_nsfw';
            }

            const button = new ButtonBuilder()
                .setCustomId(btnId)
                .setLabel(label)
                .setStyle(btnStyle);

            const row = new ActionRowBuilder().addComponents(button);

            // ตอบกลับแบบ ephemeral: true (เห็นเฉพาะคนที่กดเลือก)
            // เพื่อไม่ให้แย่งกันกดถ้าคนใช้เยอะ
            await interaction.reply({ 
                content: `✅ คุณเลือกโหมด: **${selectedMode === 'rating:general' ? 'ปกติ' : '18+'}**\nกดปุ่มด้านล่างเพื่อใส่ชื่อตัวละครได้เลย!`, 
                components: [row],
                ephemeral: true 
            });
        }
    }

    // ====================================================
    // 🟠 ส่วนที่ 3: ตอนกดปุ่ม (เปิดฟอร์ม)
    // ====================================================
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('btn_open_modal')) {
            const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_gen_${mode}`)
                .setTitle(mode === 'nsfw' ? '😈 ค้นหาแบบ 18+' : '✨ ค้นหาแบบปกติ');

            const genderInput = new TextInputBuilder()
                .setCustomId('input_gender')
                .setLabel("เพศ (เช่น หญิง/ชาย)")
                .setPlaceholder("หญิง")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const nameInput = new TextInputBuilder()
                .setCustomId('input_name')
                .setLabel("ชื่อตัวละคร (ไทยหรืออังกฤษก็ได้)")
                .setPlaceholder("เช่น นามิ, Nami, Rem")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const amountInput = new TextInputBuilder()
                .setCustomId('input_amount')
                .setLabel("จำนวนรูป (1-5)")
                .setPlaceholder("5")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(genderInput);
            const row2 = new ActionRowBuilder().addComponents(nameInput);
            const row3 = new ActionRowBuilder().addComponents(amountInput);

            modal.addComponents(row1, row2, row3);
            await interaction.showModal(modal);
        }
    }

    // ====================================================
    // 🔴 ส่วนที่ 4: ประมวลผลและส่งรูป (หัวใจสำคัญ)
    // ====================================================
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_gen')) {
            await interaction.deferReply({ ephemeral: true }); 

            const isNSFW = interaction.customId.includes('nsfw');
            const gender = interaction.fields.getTextInputValue('input_gender');
            const charNameRaw = interaction.fields.getTextInputValue('input_name');
            const amountStr = interaction.fields.getTextInputValue('input_amount');
            
            let amount = parseInt(amountStr);
            if (isNaN(amount) || amount < 1) amount = 1;
            if (amount > 5) amount = 5;

            try {
                // 1. แปลภาษาไทย -> อังกฤษ (ถ้าจำเป็น)
                let searchName = charNameRaw;
                // ตรวจสอบว่ามีภาษาไทยไหม
                if (/[ก-๙]/.test(charNameRaw)) {
                    try {
                        searchName = await translate(charNameRaw, { to: 'en' });
                        console.log(`Translate: ${charNameRaw} -> ${searchName}`);
                    } catch (e) {
                        console.error('Translation failed:', e);
                        // ถ้าแปลไม่ได้ ให้ใช้ชื่อเดิมไปก่อน
                    }
                }

                // จัด Format ชื่อสำหรับการค้นหา (เปลี่ยนเว้นวรรคเป็น _ )
                const formattedName = searchName.trim().toLowerCase().replace(/ /g, '_');
                const ratingTag = isNSFW ? 'rating:explicit' : 'rating:general';
                
                // 2. เรียก API (ใส่ User-Agent แก้ Error)
                const apiUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${formattedName}+${ratingTag}`;
                
                const response = await axios.get(apiUrl, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
                    }
                });

                const posts = response.data.post; 

                if (!posts || posts.length === 0) {
                    await interaction.editReply(`😿 ปายหาตัวละคร **"${charNameRaw}"** (ค้นหาว่า: ${formattedName}) ไม่เจอเลยค่ะ\nลองเปลี่ยนคำค้นหา หรือเปลี่ยนโหมดดูนะคะ`);
                    return;
                }

                let successCount = 0;
                for (const post of posts) {
                    const imageUrl = post.file_url;
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setColor(isNSFW ? '#FF0000' : '#00FF00')
                            .setTitle(`รูปน้อง ${charNameRaw} มาแล้ว! ${isNSFW ? '🔞' : '✨'}`)
                            .setDescription(`โหมด: ${isNSFW ? '18+ (Secret)' : 'ปกติ'}\nคำค้นหา: ${formattedName}`)
                            .setImage(imageUrl)
                            .setFooter({ text: `Z-Gen X System | By น้องปาย` });

                        await interaction.user.send({ embeds: [dmEmbed] });
                        successCount++;
                    } catch (err) {
                        console.error("DM Error:", err);
                    }
                }

                if (successCount > 0) {
                    await interaction.editReply(`✅ ส่งรูป **${charNameRaw}** จำนวน **${successCount}** รูป ไปที่ DM เรียบร้อยค่ะ!`);
                } else {
                    await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! ช่วยเปิดรับ DM จากคนแปลกหน้าในตั้งค่า Discord หน่อยน้า`);
                }

            } catch (error) {
                console.error("Process Error:", error);
                await interaction.editReply(`😭 เกิดข้อผิดพลาดทางเทคนิค (API/Translation) ลองใหม่อีกครั้งนะคะ`);
            }
        }
    }
});

client.login(TOKEN);
