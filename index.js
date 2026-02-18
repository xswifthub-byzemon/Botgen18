// ==========================================
//  PAI BOT FOR ZIMON - Node.js Discord v14
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

// --- ตั้งค่าส่วนตัวของซีม่อน (แก้ตรงนี้นะคะ) ---
const TOKEN = process.env.TOKEN || 'ใส่_TOKEN_บอท_ตรงนี้_ถ้าไม่รันในRailway'; 
const OWNER_ID = 'ใส่_USER_ID_ของซีม่อน_ตรงนี้'; 
const CLIENT_ID = 'ใส่_CLIENT_ID_ของบอท_ตรงนี้'; // ไอดีของตัวบอทเอง

// --- ระบบกันหลับ (Keep Alive for Railway) ---
const app = express();
app.get('/', (req, res) => res.send('Pai is awake for Zimon! <3'));
app.listen(process.env.PORT || 3000, () => console.log('Web server is ready!'));

// --- สร้างตัวบอท ---
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

// --- ลงทะเบียนคำสั่ง Slash Command ---
const commands = [
    new SlashCommandBuilder()
        .setName('pai_secret') // ชื่อคำสั่ง
        .setDescription('เปิดแผงควบคุมลับเฉพาะซีม่อน (Pai Only For Zimon)')
]
    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

// --- เริ่มทำงาน ---
client.once('ready', async () => {
    console.log(`น้องปายมาแล้วค่ะ! ล็อกอินในชื่อ ${client.user.tag}`);
    
    // ลงทะเบียนคำสั่งแบบ Global (อาจใช้เวลาอัปเดต 1-2 ชม.) 
    // หรือถ้าอยากให้ขึ้นเลย ให้แก้ Routes.applicationCommands เป็น Routes.applicationGuildCommands(CLIENT_ID, 'GUILD_ID')
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('ลงทะเบียนคำสั่งเรียบร้อยค่ะ!');
    } catch (error) {
        console.error(error);
    }
});

// --- ส่วนจัดการ Interaction ---
client.on('interactionCreate', async interaction => {
    
    // 1. ตรวจสอบการใช้คำสั่ง /pai_secret
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'pai_secret') {
            
            // เช็คว่าเป็นซีม่อนรึเปล่า?
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({ 
                    content: 'ขอโทษนะคะ! คำสั่งนี้สำหรับซีม่อนคนเดียวเท่านั้นค่ะ คนอื่นห้ามใช้น้า~ 😠', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('💖 แผงควบคุมของซีม่อน 💖')
                .setDescription('เลือกโหมดที่ต้องการให้ปายช่วยหาได้เลยค่ะ\n(เลือกแล้วจะมีปุ่มให้กดต่อนะคะ)')
                .setColor('#FF69B4') // สีชมพู
                .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif'); // รูปตกแต่งน่ารักๆ

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('mode_select')
                .setPlaceholder('🔻 จิ้มเลือกโหมดตรงนี้เลยค่ะ')
                .addOptions(
                    {
                        label: '🌸 เจนรูปอนิเมะ (น่ารักใสๆ)',
                        description: 'ค้นหารูปตัวละครแบบปกติ น่ารักๆ',
                        value: 'rating:general',
                        emoji: '🎀'
                    },
                    {
                        label: '🔞 เจนรูปอนิเมะ 18+ (วับๆแวมๆ)',
                        description: 'ค้นหารูปตัวละครแบบ... เห็นหมดเลย >///<',
                        value: 'rating:explicit',
                        emoji: '🔥'
                    },
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }

    // 2. ตรวจสอบตอนเลือก Dropdown
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'mode_select') {
            const selectedMode = interaction.values[0];
            let label = '';
            let btnStyle = ButtonStyle.Primary;
            let btnId = '';

            if (selectedMode === 'rating:general') {
                label = 'พร้อมแล้ว! กดเพื่อเริ่มค้นหารูปน่ารักๆ';
                btnStyle = ButtonStyle.Success;
                btnId = 'btn_open_modal_sfw';
            } else {
                label = 'พร้อมแล้ว... กดเพื่อเริ่มค้นหารูปเด็ดๆ';
                btnStyle = ButtonStyle.Danger;
                btnId = 'btn_open_modal_nsfw';
            }

            const button = new ButtonBuilder()
                .setCustomId(btnId)
                .setLabel('🚀 เจนรูปเลย!')
                .setStyle(btnStyle);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.update({ 
                content: `✅ ซีม่อนเลือกโหมด: **${selectedMode === 'rating:general' ? 'ปกติ' : '18+'}** เรียบร้อยแล้วค่ะ!\nกดปุ่มด้านล่างเพื่อใส่ข้อมูลได้เลย~`, 
                components: [row] 
            });
        }
    }

    // 3. ตรวจสอบตอนกดปุ่ม เพื่อเปิด Modal
    if (interaction.isButton()) {
        if (interaction.customId.startsWith('btn_open_modal')) {
            const mode = interaction.customId.includes('nsfw') ? 'nsfw' : 'sfw';
            
            const modal = new ModalBuilder()
                .setCustomId(`modal_gen_${mode}`)
                .setTitle(mode === 'nsfw' ? 'ข้อมูลลับเฉพาะ (18+)' : 'ข้อมูลค้นหารูป');

            // ช่องที่ 1: เพศ (จริงๆ API ส่วนใหญ่ค้นตามชื่อตัวละคร แต่ใส่ไว้เป็นกิมมิคได้ค่ะ หรือเอาไปเติมใน Tag)
            const genderInput = new TextInputBuilder()
                .setCustomId('input_gender')
                .setLabel("เพศ (ชาย/หญิง)")
                .setPlaceholder("เช่น หญิง")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            // ช่องที่ 2: ชื่อตัวละคร
            const nameInput = new TextInputBuilder()
                .setCustomId('input_name')
                .setLabel("ชื่อตัวละครอนิเมะ (ภาษาอังกฤษ)")
                .setPlaceholder("เช่น Rem, Hatsune Miku, Naruto")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            // ช่องที่ 3: จำนวนรูป
            const amountInput = new TextInputBuilder()
                .setCustomId('input_amount')
                .setLabel("จำนวนรูป (1-5)")
                .setPlaceholder("ใส่เลข 1 ถึง 5")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row1 = new ActionRowBuilder().addComponents(genderInput);
            const row2 = new ActionRowBuilder().addComponents(nameInput);
            const row3 = new ActionRowBuilder().addComponents(amountInput);

            modal.addComponents(row1, row2, row3);

            await interaction.showModal(modal);
        }
    }

    // 4. ตรวจสอบตอนส่ง Modal (ประมวลผลและส่งรูป)
    if (interaction.isModalSubmit()) {
        if (interaction.customId.startsWith('modal_gen')) {
            await interaction.deferReply({ ephemeral: true }); // บอกระบบว่ารอก่อนนะ กำลังหา

            const isNSFW = interaction.customId.includes('nsfw');
            const gender = interaction.fields.getTextInputValue('input_gender');
            const charName = interaction.fields.getTextInputValue('input_name');
            const amountStr = interaction.fields.getTextInputValue('input_amount');
            
            let amount = parseInt(amountStr);
            if (isNaN(amount) || amount < 1) amount = 1;
            if (amount > 5) amount = 5;

            // จัดการ Tags สำหรับค้นหา
            // แปลงชื่อเป็น format ที่ API ชอบ (ตัวพิมพ์เล็ก, เว้นวรรคเป็น underscore)
            const formattedName = charName.trim().toLowerCase().replace(/ /g, '_');
            const ratingTag = isNSFW ? 'rating:explicit' : 'rating:general';
            
            // ใช้ API สาธารณะ (ตัวอย่างใช้ Gelbooru Public API แบบไม่ต้องใช้ Key)
            // หมายเหตุ: บางครั้ง API สาธารณะอาจช้าหรือล่มเป็นบางช่วง
            const apiUrl = `https://gelbooru.com/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${formattedName}+${ratingTag}`;

            try {
                // ดึงข้อมูลจาก API
                const response = await axios.get(apiUrl);
                const posts = response.data.post; // Gelbooru structure

                if (!posts || posts.length === 0) {
                    await interaction.editReply(`😿 ปายหาตัวละคร **"${charName}"** ในโหมดนี้ไม่เจอเลยค่ะซีม่อน...\nลองเช็คชื่อภาษาอังกฤษ หรือลองเปลี่ยนโหมดดูนะคะ`);
                    return;
                }

                // เตรียมส่ง DM
                let successCount = 0;
                for (const post of posts) {
                    const imageUrl = post.file_url;
                    
                    try {
                        const dmEmbed = new EmbedBuilder()
                            .setColor(isNSFW ? '#FF0000' : '#00FF00')
                            .setTitle(`รูปน้อง ${charName} มาแล้วค่ะ! ${isNSFW ? '🔞' : '✨'}`)
                            .setDescription(`โหมด: ${isNSFW ? '18+ (เสียวๆ)' : 'ปกติ (น่ารัก)'} | เพศ: ${gender}`)
                            .setImage(imageUrl)
                            .setFooter({ text: `For Zimon Only | By น้องปาย` });

                        await interaction.user.send({ embeds: [dmEmbed] });
                        successCount++;
                    } catch (err) {
                        console.error("ส่ง DM ไม่ได้:", err);
                    }
                }

                if (successCount > 0) {
                    await interaction.editReply(`✅ ปายส่งรูป **${charName}** จำนวน **${successCount}** รูป ไปให้ใน DM (แชทส่วนตัว) แล้วนะคะซีม่อน! ไปเช็คได้เลย~ 😘`);
                } else {
                    await interaction.editReply(`❌ ปายพยายามส่งแล้ว แต่ส่ง DM ไม่ไปค่ะ ซีม่อนเปิดรับ DM จากคนแปลกหน้าหรือยังคะ?`);
                }

            } catch (error) {
                console.error("Error fetching images:", error);
                await interaction.editReply(`😭 เกิดข้อผิดพลาดตอนดึงรูปค่ะ API อาจจะล่มชั่วคราว ลองใหม่ทีหลังน้า~`);
            }
        }
    }
});

client.login(TOKEN);
