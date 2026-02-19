// ==========================================
//  Z-GEN X (PAI EDITION) - V7.0 (REAL WORLD)
// ==========================================

const { 
    Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, 
    ButtonStyle, EmbedBuilder, REST, Routes, SlashCommandBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder
} = require('discord.js');
const axios = require('axios');
const express = require('express');
const translate = require('translate-google');

const TOKEN = process.env.TOKEN; 
const CLIENT_ID = process.env.CLIENT_ID; 
const OWNER_ID = process.env.OWNER_ID; 

const app = express();
app.get('/', (req, res) => res.send('Z-Gen X V7.0 is Online! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X V7.0')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V7.0 พร้อมพาซีม่อนไปดูสาวๆ แล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

client.on('interactionCreate', async interaction => {
    
    // --- 1. หน้าแผงควบคุมหลัก (เพิ่ม Dropdown สัญชาติ) ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : WORLDWIDE GALLERY')
            .setDescription(
                '🌹 **ยินดีต้อนรับเข้าสู่คลังแสงระดับโลกนะคะ ซีม่อน**\n' +
                'เลือกว่าอยากจะดูสาวชาติไหน หรือจะดูอนิเมะเหมือนเดิมก็ได้ค่ะ\n\n' +
                '📍 **ขั้นตอนการใช้งาน**\n' +
                '1. เลือกสัญชาติ (หรือเลือก Anime)\n' +
                '2. กดปุ่มโหมดที่ต้องการ (น่ารัก/สยิว)\n' +
                '3. รอรับรูปใน DM ได้เลยค่ะ!'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('nation_select')
            .setPlaceholder('🌍 เลือกสัญชาติที่ต้องการ...')
            .addOptions(
                { label: '🌸 Anime (การ์ตูน)', value: 'anime', emoji: '🎨' },
                { label: '🇹🇭 Thai (สาวไทยขาวๆ)', value: 'thai', emoji: '🇹🇭' },
                { label: '🇯🇵 Japanese (สาวญี่ปุ่น)', value: 'japanese', emoji: '🇯🇵' },
                { label: '🇰🇷 Korean (สาวเกาหลี)', value: 'korean', emoji: '🇰🇷' },
                { label: '🇬🇧 English (สายฝอ)', value: 'english', emoji: '🇬🇧' }
            );

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('gen_sfw').setLabel('น่ารัก (SFW)').setStyle(ButtonStyle.Success).setEmoji('🎀'),
            new ButtonBuilder().setCustomId('gen_nsfw').setLabel('สยิว (NSFW)').setStyle(ButtonStyle.Danger).setEmoji('🔥')
        );

        await interaction.reply({ 
            embeds: [embed], 
            components: [new ActionRowBuilder().addComponents(selectMenu), btnRow] 
        });
    }

    // --- 2. บันทึกสัญชาติที่เลือกไว้ ---
    let selectedNation = 'anime'; // Default
    if (interaction.isStringSelectMenu() && interaction.customId === 'nation_select') {
        selectedNation = interaction.values[0];
        await interaction.reply({ content: `✅ เลือกสัญชาติ **${selectedNation}** เรียบร้อยค่ะซีม่อน!`, ephemeral: true });
    }

    // --- 3. ระบบ Modal ค้นหา ---
    if (interaction.isButton() && (interaction.customId === 'gen_sfw' || interaction.customId === 'gen_nsfw')) {
        const isNSFW = interaction.customId === 'gen_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 ค้นหาความเด็ด' : '✨ ค้นหาความน่ารัก');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('char_name').setLabel('ระบุชื่อตัวละครหรือสไตล์ (ไทย/อังกฤษ)').setPlaceholder('เช่น Nami หรือ ขาว สวย').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('char_num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true)
            )
        );
        await interaction.showModal(modal);
    }

    // --- 4. ระบบประมวลผลรูป (ส่งแบบเปิดโชว์ทันที) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId === 'modal_nsfw';
        const rawName = interaction.fields.getTextInputValue('char_name');
        let amount = parseInt(interaction.fields.getTextInputValue('char_num')) || 1;
        if (amount > 5) amount = 5;

        try {
            let searchTag = rawName;
            if (/[ก-๙]/.test(rawName)) searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
            const finalTag = searchTag.trim().toLowerCase().replace(/ /g, '_');

            // --- Logic การเลือก API ตามสัญชาติ ---
            let apiUrl = '';
            if (selectedNation === 'anime') {
                apiUrl = isNSFW 
                    ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                    : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;
            } else {
                // สำหรับคนจริง ปายจะใช้ฐานข้อมูลแนว Gravure/Cosplay ตามชาติที่เลือก
                apiUrl = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${selectedNation}+${isNSFW ? 'nude' : 'cosplay'}+${finalTag}`;
            }

            const res = await axios.get(apiUrl);
            const posts = res.data;

            if (!posts || posts.length === 0) return interaction.editReply(`😿 ปายหารูปแบบที่ซีม่อนต้องการไม่เจอเลยค่ะ ลองเปลี่ยนคำค้นหาน้า`);

            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i].file_url || posts[i].sample_url;
                if (!imgUrl) continue;

                // ส่งแบบ Embed เพื่อให้รูปขึ้นทันทีและมีปุ่มโหลด
                const photoEmbed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`✨ [${selectedNation.toUpperCase()}] รูปที่ ${i+1}: ${rawName}`)
                    .setImage(imgUrl)
                    .setFooter({ text: 'Z-Gen X V7.0 | บันทึกรูปได้เลยนะคะซีม่อน' });

                const downloadBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('📥 ดาวน์โหลดไฟล์ .png').setStyle(ButtonStyle.Link).setURL(imgUrl)
                );

                await interaction.user.send({ embeds: [photoEmbed], components: [downloadBtn] }).catch(() => {});
            }

            await interaction.editReply(`✅ ส่งของดีสัญชาติ **${selectedNation}** จำนวน **${posts.length}** รูปเข้า DM แล้วค่ะ!`);

        } catch (error) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
});

client.login(TOKEN);
