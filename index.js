const discord = require('discord.js');
const config = require('./config.json');
const path = require('path');
const fileSystem = require('fs');

const client = new discord.Client();

const delay = 250;

client.once('ready', async function(){
    console.log('Discord bot is ready.');
    console.log('Loading...')
    for(const [id, guild] of this.guilds.cache) {
        let tick, active, lastChannel, timer;
        console.log(guild);
        if(!guild || !guild.members) continue;
        const user = await guild.members.fetch(config.user);
        console.log('Loaded.')


        active = async () => {
            let channel = user.voice.channel;
            if(channel) {
                try {
                    let connection = await channel.join();
                    if(lastChannel != channel.id) {
                        lastChannel = channel.id;
                        console.log(`Playing the follow clip... (channel ${channel.id}, from ${lastChannel})`);
                        setTimeout(() => connection.play(path.join(__dirname, './follow.mp3'), {volume: 0.7}), 600)
                    }
                } catch (e) { console.log(e); }

            } else {
                clearInterval(timer)
                timer = setInterval(tick, delay)
                lastChannel.leave()
            }
        }

        tick = async () => {
            let channel = user.voice.channel;
            if(channel) {
                clearInterval(timer)
                lastChannel = channel.id;
                try {
                    let connection = await channel.join();
                    setTimeout(() => {
                        console.log('Playing the sound clip...')
                        connection.play(path.join(__dirname, './sound.mp3'), {volume: 0.7})
                    }, 500);
                    timer = setInterval(active, delay);
                } catch (e) {
                    timer = setInterval(tick, delay);
                }

            }
        }
        timer = setInterval(tick, delay);
    }
});

client.login(config.token);