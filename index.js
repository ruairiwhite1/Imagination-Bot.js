require('module-alias/register')

const Discord = require('discord.js')
const client = new Discord.Client()

const config = require('@root/config.json')
const command = require('@util/command')
const mongo = require('@util/mongo')
const welcome = require('@features/welcome')
const messageCount = require('@features/message-counter')
const antiAd = require('@features/anti-add')
const loadCommands = require('@root/commands/load-commands')
const levels = require('@features/levels')
const loadFeatures = require('@root/features/load-features')

client.on('ready', async () => {
    console.log('The client is ready!')

    loadCommands(client)
    loadFeatures(client)
    levels(client)
    antiAd(client)
    welcome(client)
    messageCount(client)

    let y = process.openStdin()
    y.addListener("data", res => {
        let x = res.toString().trim().split(/ +/g)
        client.channels.cache.get("647398611725975553").send(x.join(" "));
});
    
    await mongo().then(mongoose => {
        try {
            console.log('Connected to Mongo!')
        } finally {
          mongoose.connection.close()
        }
    })

        command(client, 'kick', (message) => {
            const {member, mentions } = message
    
            const tag = `<@${member.id}>`
            
            if (member.hasPermission('ADMINISTRATOR') ||
                member.hasPermission('KICK_MEMBERS')
            ) {
                const target = mentions.users.first()
                if (target) {
                    const targetMember = message.guild.members.cache.get(target.id)
                    targetMember.kick()
                    message.channel.send(`${tag} That user has been kicked.`)
                } else {
                    message.channel.send(`${tag} Please specify the user you are trying to kick.`)
                }
            } else {
              message.channel.send(
                  `${tag} You do not have permission to use this command.`)
            }
    
            })
    
    command(client, 'serverinfo', (message) => {
        const { guild } = message

        const { name, region, memberCount, owner } = guild
        const icon = guild.iconURL()

        const info = new Discord.MessageEmbed()
            .setTitle(`Server info for ${name}`)
            .setThumbnail(icon)
            .setColor('#00AAFF')
            .addFields({
                name: 'Region',
                value: region
            },{
                name: 'Members',
                value: memberCount
            },{
                name: 'Owner',
                value: owner.user.tag
            },)

        message.channel.send(info)

    })
    
    command(client, 'embed', (message)=> {
        const logo = 'https://static.planetminecraft.com/files/avatar/2577383_1.jpeg'

        const embed = new Discord.MessageEmbed()
            .setTitle('Example text embed')
            .setURL('https://discord.gg/MuevYFa')
            .setAuthor(message.author.username)
            .setImage(logo)
            .setThumbnail(logo)
            .setFooter('This is a footer.', logo)
            .setColor('#00AAFF')
            .addField(
            {
             name: 'Field 1',
             value: 'Hello world!'
            })

        message.channel.send(embed)
    })
    
    command(client, 'createvoicechannel', (message) => {
        const name = message.content.replace('!createvoicechannel ', '')
    
        message.guild.channels
          .create(name, {
            type: 'voice',
          })
    })

    command(client, 'createtextchannel', (message) => {
        const name = message.content.replace('!createtextchannel ', '')
    
        message.guild.channels
          .create(name, {
            type: 'text',
          })
    })

          command(client, 'servers', message => {
        client.guilds.cache.forEach(guild => {
            message.channel.send(`${guild.name} has a total of ${guild.memberCount} members`)
        })
    })

    command(client, ['cc', 'clearchannel'], message => {
        if (message.member.hasPermission('ADMINISTRATOR')) {
            message.channel.messages.fetch().then((results) => {
                message.channel.bulkDelete(results)
            })
        }
    })

    command(client, 'status', message => {
        const content = message.content.replace('!status ', '')
        
        client.user.setPresence({
            activity: {
                name: content,
                type: 0,
            }
        })
    })
})

client.login(config.token)
