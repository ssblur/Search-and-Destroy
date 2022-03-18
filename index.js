const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice')
const config = require('./config.json');
const path = require('path');
const fileSystem = require('fs');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS,
    ]
});

const delay = 250;

client.once('ready', async function(){
    console.log('Discord bot is ready.');
    console.log('Loading...')
    for(const [id, guild] of this.guilds.cache) {
        let tick, active, lastChannel, timer, connection;
        console.log(guild);
        if(!guild || !guild.members) continue;
        try {
            const user = await guild.members.fetch(config.user);
            active = async () => {
                let channel = user.voice.channel;
                if(channel && channel.isVoice()) {
                    try {
                        connection = await joinVoiceChannel({
                            channelId: channel.id,
                            guildId: channel.guild.id,
                            adapterCreator: channel.guild.voiceAdapterCreator, 
                        });
                        if(lastChannel.id != channel.id) {
                            let audioPlayer = createAudioPlayer();
                            lastChannel = channel;
                            console.log(`Playing the follow clip... (channel ${channel.id}, from ${lastChannel})`);
                            connection.subscribe(audioPlayer);
                            let followResource = createAudioResource(path.join(__dirname, './follow.mp3'), { inlineVolume: true })
                            followResource.volume.setVolume(0.25);
                            audioPlayer.play(followResource);
                        }
                    } catch (e) { console.log(e); }
    
                } else {
                    clearInterval(timer)
                    timer = setInterval(tick, delay)
                    connection.destroy()
                }
            }
    
            tick = async () => {
                let channel = user.voice.channel;
                if(channel && channel.isVoice()) {
                    clearInterval(timer)
                    lastChannel = channel;
                    try {
                        connection = await joinVoiceChannel({
                            channelId: channel.id,
                            guildId: channel.guild.id,
                            adapterCreator: channel.guild.voiceAdapterCreator, 
                        });
                        setTimeout(() => {
                            let audioPlayer = createAudioPlayer();
                            console.log('Playing the sound clip...');
                            connection.subscribe(audioPlayer);
                            let soundResource = createAudioResource(path.join(__dirname, './sound.mp3'), { inlineVolume: true })
                            soundResource.volume.setVolume(0.25);
                            audioPlayer.play(soundResource);
                        }, 500);
                        timer = setInterval(active, delay);
                    } catch (e) {
                        console.log(channel, e);
                        timer = setInterval(tick, delay);
                    }
    
                }
            }
            timer = setInterval(tick, delay);
        } catch(e) {
            console.log(e);
        }
        console.log('Loaded.')
    }
});

client.login(config.token);