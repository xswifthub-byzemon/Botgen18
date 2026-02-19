// ==========================================
//  Z-GEN X (PAI EDITION) - V7.1 (REDDIT FIX)
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
app.get('/', (req, res) => res.send('Z-Gen X V7.1 (Reddit Fix) is Online! 💖'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages],
    partials: [Partials.Channel]
});

const commands = [
    new SlashCommandBuilder().setName('pai_secret').setDescription('เรียกแผงควบคุม Z-Gen X V7.1')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log(`✨ น้องปาย V7.1 พร้อมแก้ตัวเรื่องสาวไทยแล้วค่ะ!`);
    } catch (e) { console.error(e); }
});

// เก็บค่าสัญชาติชั่วคราว (Simple Memory)
let userSelectedNation = {}; 

client.on('interactionCreate', async interaction => {
    
    // --- 1. หน้าแผงควบคุมหลัก ---
    if (interaction.isChatInputCommand() && interaction.commandName === 'pai_secret') {
        if (interaction.user.id !== OWNER_ID) return interaction.reply({ content: '🚫 เฉพาะซีม่อนเท่านั้น!', ephemeral: true });
        
        const embed = new EmbedBuilder()
            .setTitle('🔞 Z-GEN X : REAL GIRLS GALLERY')
            .setDescription(
                '🌹 **ระบบใหม่ไฉไลกว่าเดิมค่ะ ซีม่อน**\n' +
                'ปายเปลี่ยนไปดึงรูปจากแหล่งเฉพาะกลุ่ม (Reddit) เพื่อให้ได้สาวไทย/เอเชียแบบตรงปกที่สุด!\n\n' +
                '📍 **วิธีใช้**\n' +
                '1. เลือกสัญชาติในเมนู\n' +
                '2. กดปุ่มโหมด (ถ้าเลือกคนจริง ไม่ต้องใส่ชื่อก็ได้ค่ะ พิมพ์ "สุ่ม" แล้วกดส่งเลย)'
            )
            .setColor('#FF0099')
            .setImage('https://media1.tenor.com/m/XjC4J4_Z_jUAAAAC/anime-girl.gif');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('nation_select')
            .setPlaceholder('🌍 เลือกสัญชาติ...')
            .addOptions(
                { label: '🌸 Anime (การ์ตูน)', value: 'anime', emoji: '🎨' },
                { label: '🇹🇭 Thai (สาวไทย)', value: 'thai', emoji: '🇹🇭' },
                { label: '🇯🇵 Japanese (สาวญี่ปุ่น)', value: 'japanese', emoji: '🇯🇵' },
                { label: '🇰🇷 Korean (สาวเกาหลี)', value: 'korean', emoji: '🇰🇷' },
                { label: '🇨🇳 Chinese (สาวจีน)', value: 'chinese', emoji: '🇨🇳' }
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

    // --- 2. บันทึกสัญชาติ ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'nation_select') {
        userSelectedNation[interaction.user.id] = interaction.values[0];
        await interaction.reply({ content: `✅ บันทึกสัญชาติ **${interaction.values[0]}** แล้วค่ะ! กดปุ่มเลือกโหมดได้เลย`, ephemeral: true });
    }

    // --- 3. Modal ---
    if (interaction.isButton() && (interaction.customId === 'gen_sfw' || interaction.customId === 'gen_nsfw')) {
        const isNSFW = interaction.customId === 'gen_nsfw';
        const modal = new ModalBuilder()
            .setCustomId(isNSFW ? 'modal_nsfw' : 'modal_sfw')
            .setTitle(isNSFW ? '🔞 ค้นหา (18+)' : '✨ ค้นหา (ปกติ)');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('char_name').setLabel('ชื่อตัวละคร (ถ้าคนจริงพิมพ์ "สุ่ม" ได้เลย)').setValue('สุ่ม').setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('char_num').setLabel('จำนวนรูป (1-5)').setValue('5').setStyle(TextInputStyle.Short).setRequired(true)
            )
        );
        await interaction.showModal(modal);
    }

    // --- 4. ประมวลผล (Reddit + Rule34 Hybrid) ---
    if (interaction.isModalSubmit()) {
        await interaction.deferReply({ ephemeral: true });
        const isNSFW = interaction.customId === 'modal_nsfw';
        const rawName = interaction.fields.getTextInputValue('char_name');
        let amount = parseInt(interaction.fields.getTextInputValue('char_num')) || 1;
        if (amount > 5) amount = 5;

        const nation = userSelectedNation[interaction.user.id] || 'anime';

        try {
            let posts = [];
            
            // === กรณี Anime (ใช้ Rule34/Safebooru เหมือนเดิม) ===
            if (nation === 'anime') {
                let searchTag = rawName;
                if (/[ก-๙]/.test(rawName) && rawName !== 'สุ่ม') searchTag = await translate(rawName, { to: 'en' }).catch(() => rawName);
                const finalTag = (rawName === 'สุ่ม') ? '' : searchTag.trim().toLowerCase().replace(/ /g, '_');
                
                const apiUrl = isNSFW 
                    ? `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`
                    : `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=${amount}&tags=${finalTag}`;
                
                const res = await axios.get(apiUrl);
                posts = res.data.map(p => p.file_url || p.sample_url).filter(url => url);
            } 
            
            // === กรณี Real Life (ใช้ Reddit API) ===
            else {
                // เลือก Subreddit ตามสัญชาติ
                let subreddits = [];
                if (nation === 'thai') subreddits = isNSFW ? ['ThaiNsfw', 'soccersuck'] : ['ThaiCuties'];
                else if (nation === 'japanese') subreddits = isNSFW ? ['JavPreview', 'gravure'] : ['JapaneseHotties'];
                else if (nation === 'korean') subreddits = isNSFW ? ['kpopfap', 'nsfw_korea'] : ['koreangirls'];
                else if (nation === 'chinese') subreddits = isNSFW ? ['AsianHotties'] : ['realasians'];
                
                // สุ่ม Subreddit
                const sub = subreddits[Math.floor(Math.random() * subreddits.length)];
                const redditUrl = `https://www.reddit.com/r/${sub}/random.json?limit=${amount}`;
                
                // ดึงรูปวนลูปจนกว่าจะครบจำนวน
                for(let i=0; i<amount; i++) {
                     try {
                        const res = await axios.get(`https://www.reddit.com/r/${sub}/random.json`, { 
                            headers: { 'User-Agent': 'Mozilla/5.0' } // ต้องใส่ UA
                        });
                        const imgUrl = res.data[0].data.children[0].data.url_overridden_by_dest;
                        if (imgUrl && (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.png'))) {
                            posts.push(imgUrl);
                        }
                     } catch(e) {}
                }
            }

            if (posts.length === 0) return interaction.editReply(`😿 ปายหารูปในหมวด **${nation}** ไม่เจอเลยค่ะ ลองกดใหม่น้า`);

            // ส่งรูปเข้า DM
            for (let i = 0; i < posts.length; i++) {
                const imgUrl = posts[i];
                const photoEmbed = new EmbedBuilder()
                    .setColor(isNSFW ? '#FF0000' : '#00FF00')
                    .setTitle(`✨ [${nation.toUpperCase()}] รูปที่ ${i+1}`)
                    .setImage(imgUrl)
                    .setFooter({ text: 'Z-Gen X V7.1 | By น้องปาย' });

                const downloadBtn = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setLabel('📥 ดาวน์โหลด').setStyle(ButtonStyle.Link).setURL(imgUrl)
                );

                await interaction.user.send({ embeds: [photoEmbed], components: [downloadBtn] }).catch(() => {});
            }

            await interaction.editReply(`✅ ปายส่งรูปสาว **${nation}** จำนวน **${posts.length}** รูปเข้า DM เรียบร้อยแล้วค่ะซีม่อน!`);

        } catch (error) {
            await interaction.editReply(`😭 เกิดข้อผิดพลาด: ${error.message}`);
        }
    }
});

client.login(TOKEN);
