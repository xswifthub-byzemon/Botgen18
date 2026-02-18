// ==========================================
//  Z-GEN X (PAI EDITION) FOR ZIMON - Fixed
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

// --- 1. ดึงค่าจาก Railway Variables (ห้ามแก้ตรงนี้) ---
const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

// ตรวจสอบว่าใส่ค่าครบไหม ถ้าไม่ครบจะแจ้งเตือนใน Log
if (!TOKEN || !CLIENT_ID || !OWNER_ID) {
    console.error("❌ Error: ซีม่อนลืมใส่ Variables ใน Railway ค่ะ! (ต้องใส่ TOKEN, CLIENT_ID, OWNER_ID)");
    process.exit(1); 
}

// --- 2. ระบบกันหลับ (Keep Alive) ---
const app = express();
app.get('/', (req, res) => res.send('Z-Gen X System is Online for Zimon! 💖'));
app.listen(process.env.PORT || 3000, () => console.log('✅ Web Server Ready!'));

// --- 3. สร้างตัวบอท ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel]
});

// --- 4. ลงทะเบียนคำสั่ง Slash Command ---
const commands = [
    new SlashCommandBuilder()
        .setName('pai_secret') 
        .setDescription('เปิดแผงควบคุม Z-Gen X ลับเฉพาะซีม่อน')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// --- 5. เริ่มทำงาน ---
client.once('ready', async () => {
    console.log(`✨ น้องปายพร้อมทำงานแล้วค่ะ! ล็อกอินในชื่อ: ${client.user.tag}`);
    
    try {
        console.log('⏳ กำลังลงทะเบียนคำสั่ง...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('✅ ลงทะเบียนคำสั่งเรียบร้อย! ใช้ /pai_secret ได้เลย');
    } catch (error) {
        console.error('❌ ลงทะเบียนคำสั่งพลาด:', error);
    }
});

// --- 6. จัดการคำสั่งและปุ่ม ---
client.on('interactionCreate', async interaction => {
    
    // --- คำสั่ง /pai_secret ---
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pai_secret') {
            
            // เช็ค ID ซีม่อน (ถ้าไม่ใช่ซีม่อน ห้ามใช้!)
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ 
                    content: '🚫 ขอโทษนะคะ! ระบบนี้ล็อคไว้ให้ **ซีม่อน** คนเดียวค่ะ!', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('💋 Z-GEN X CONTROL PANEL')
                .setDescription('**ยินดีต้อนรับค่ะซีม่อน...**\nเลือกโหมดที่ต้องการด้านล่างได้เลย\n(ระบบจะส่งรูปเข้า DM ส่วนตัวนะคะ)')
                .setColor('#FF0099') 
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'Service by น้องปาย' });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('mode_select')
                .setPlaceholder('🔻 เลือกโหมดความบันเทิง...')
                .addOptions(
                    {
                        label: '✨ Anime Gallery (ทั่วไป)',
                        description: 'ค้นหารูปอนิเมะน่ารักๆ สดใสๆ',
                        value: 'rating:general',
                        emoji: '🎀'
                    },
                    {
                        label: '🔞 Secret Zone (18+)',
                        description: 'ค้นหารูปเด็ดๆ... แบบที่ซีม่อนชอบ',
                        value: 'rating:explicit',
                        emoji: '🔥'
                    },
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }

    // --- ตอนเลือกเมนู ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'mode_select') {
            const selectedMode = interaction.values[0];
            let label = '';
            let btnStyle = ButtonStyle.Primary;
            let btnId = '';

            if (selectedMode === 'rating:general') {
                label = '🚀 เริ่มค้นหารูปน่ารักๆ';
                btnStyle = ButtonStyle.Success;
                btnId = 'btn_open_modal_sfw';
            } else {
                label = '😈 เริ่มค้นหา... (โซนลับ)';
                btnStyle = ButtonStyle.Danger;
                btnId = 'btn_open_modal_nsfw';
            }

            const button = new ButtonBuilder()
                .setCustomId(btnId)
                .setLabel(label)
                .setStyle(btnStyle);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.update({ 
                content: `✅ โหมดที่เลือก: **${selectedMode === 'rating:general' ? 'ปกติ' : '18+'}**\nกดปุ่มด้านล่างเพื่อใส่ชื่อตัวละครเลยค่ะ!`, 
                components: [row] 
            });
        }
    }

    // --- ตอนกดปุ่มเปิด Modal ---
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('btn_open_modal')) {
            const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_gen_${mode}`)
                .setTitle(mode === 'nsfw' ? '😈 ค้นหาแบบ 18+' : '✨ ค้นหาแบบปกติ');

            const genderInput = new TextInputBuilder()
                .setCustomId('input_gender')
                .setLabel("เพศ (เช่น หญิง, ชาย)")
                .setPlaceholder("หญิง")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const nameInput = new TextInputBuilder()
                .setCustomId('input_name')
                .setLabel("ชื่อตัวละคร (ภาษาอังกฤษเท่านั้น)")
                .setPlaceholder("เช่น Nami, Rem, Zero Two")
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

    // --- ตอนส่งข้อมูล (ค้นหารูป) ---
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_gen')) {
            await interaction.deferReply({ ephemeral: true }); 

            const isNSFW = interaction.customId.includes('nsfw');
            const gender = interaction.fields.getTextInputValue('input_gender');
            const charName = interaction.fields.getTextInputValue('input_name');
            const amountStr = interaction.fields.getTextInputValue('input_amount');
            
            let amount = parseInt(amountStr);
            if (isNaN(amount) || amount < 1) amount = 1;
            if (amount > 5) amount = 5;

            // จัดรูปแบบชื่อและ Tag
            const formattedName = charName.trim().toLowerCase().replace(/ /g, '_');
            const ratingTag = isNSFW ? 'rating:explicit' : 'rating:general';
            
            // API ฟรี (Gelbooru)
            const apiUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${formattedName}+${ratingTag}`;

            try {
                const response = await axios.get(apiUrl);
                const posts = response.data.post; 

                if (!posts || posts.length === 0) {
                    await interaction.editReply(`😿 ปายหาตัวละคร **"${charName}"** ในโหมดนี้ไม่เจอเลยค่ะ\n(ลองเช็คตัวสะกดภาษาอังกฤษ หรือตัวนี้อาจจะไม่มีรูป 18+ ก็ได้น้า)`);
                    return;
                }

                let successCount = 0;
                for (const post of posts) {
                    const imageUrl = post.file_url;
                    
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setColor(isNSFW ? '#FF0000' : '#00FF00')
                            .setTitle(`รูปน้อง ${charName} มาแล้ว! ${isNSFW ? '🔞' : '✨'}`)
                            .setDescription(`โหมด: ${isNSFW ? '18+ (Secret)' : 'ปกติ'}\nเพศ: ${gender || 'ไม่ระบุ'}`)
                            .setImage(imageUrl)
                            .setFooter({ text: `Z-Gen X System | By น้องปาย` });

                        await interaction.user.send({ embeds: [dmEmbed] });
                        successCount++;
                    } catch (err) {
                        console.error("DM Error:", err);
                    }
                }

                if (successCount > 0) {
                    await interaction.editReply(`✅ ส่งรูป **${charName}** จำนวน **${successCount}** รูป ไปที่ DM เรียบร้อยค่ะซีม่อน! ไปเช็คของดีได้เลย~ 😘`);
                } else {
                    await interaction.editReply(`❌ ส่ง DM ไม่ไปค่ะ! ซีม่อนต้องเปิดรับ DM จากคนแปลกหน้า (Server Privacy) ก่อนนะคะ`);
                }

            } catch (error) {
                console.error("API Error:", error);
                await interaction.editReply(`😭 ระบบค้นหารูปมีปัญหาชั่วคราว (API Error) ลองใหม่ทีหลังนะคะ`);
            }
        }
    }
});

client.login(TOKEN);
