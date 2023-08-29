const APIKey = " "
const APIToken = ""
const idList = ""
const token = "" # Bot Token
const allowedRole = ""

const fetch = require('node-fetch');
const { Client, GatewayIntentBits, Events} = require('discord.js');
const bot = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
	],
});

async function getCards(){
    var cards
    var response = await fetch(`https://api.trello.com/1/lists/${idList}/cards?key=${APIKey}&token=${APIToken}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })

    cards = await response.json()
    return cards

}

async function ban(username){

    var cards = await getCards()

    for (let i=0; i<cards.length; i++){
        if (cards[i].name === username){
            return 301
        }
    }

    var response = await fetch(`https://api.trello.com/1/cards?idList=${idList}&key=${APIKey}&token=${APIToken}&name=${username}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        }
    })
    return response.status
}

async function unban(username){
    var cards = await getCards()
    var cardID

    for (let i=0; i<cards.length; i++){
        if (cards[i].name === username){
            cardID = cards[i].id
        }
    }

    var response = await fetch(`https://api.trello.com/1/cards/${cardID}?key=${APIKey}&token=${APIToken}`, {
        method: 'DELETE',
    })
    return response.status
}

bot.on(Events.ClientReady, async () => {
    console.clear()
    console.log(`Logged on ${bot.user.username}`)
})

bot.on(Events.MessageCreate, async (message) => {

    if (allowedRole === 0){
        return
    }
    let userId = message.author.id
    let member = message.guild.members.cache.get(userId)

    if (!(member.roles.cache.has(allowedRole))){
        return
    }

    if (message.content.startsWith("!ban")){
        
        if (!(message.content.includes(" "))){
            await message.reply("You need to specifiy the user.")
            return
        }

        var username = message.content.split(" ")[1]

        var code = await ban(username)

        if (code === 200){
            message.reply("Banned successfully!")
        }else if (code === 301){
            message.reply("User already banned!")
        }else{    
            message.reply(`Error: ${code}`) 
        }

    }

    if (message.content.startsWith("!unban")){
        
        if (!(message.content.includes(" "))){
            await message.reply("You need to specifiy the user.")
            return
        }

        var username = message.content.split(" ")[1]

        var code = await unban(username)

        if (code === 200){
            message.reply("Unbanned successfully!")
        }else if (code === 400){
            message.reply("User is not banned.")
        }else{
            message.reply(`Error: ${code}`)
        }

    }

    if (message.content.startsWith("!viewbans")){

        var cards = await getCards()
        var messageToSend = "\`\`\` Active bans \n"
        for (let i=0; i<cards.length; i++){
            messageToSend += ` ${cards[i].name} \n`
        }

        messageToSend += "\`\`\`"

        message.reply(messageToSend)

    }

})

bot.login(token);
