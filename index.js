const discord = require('discord.js');
const config = require('./config.json');
const path = require('path');
const fileSystem = require('fs');

const client = new discord.Client();

const delay = 250;

var timer;

client.once('ready', async function(){
    console.log('Discord bot is ready.');
    console.log('Loading...')
    const guild = await this.guilds.fetch(config.guild);
    const user = await guild.members.fetch(config.user);
    console.log('Loaded.')

    let tick, active, lastChannel;

    active = async () => {
        let channel = user.voice.channel;
        if(channel) {
            lastChannel = channel;
            try {
                await channel.join();
            } catch (e) {}
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
            lastChannel = channel;
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
});

client.login(config.token);