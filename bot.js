const Telegraf = require("telegraf")
const axios = require("axios")
const bot = new Telegraf(TOKEN)

//retrieve data from sheet
let dataStore = []
getData()

// help command to display when we hit help
bot.command('help',ctx => {
    let helpMessage = `
    /fact command gives you facts
/update command updates the facts
/help command will print this message
    `
    ctx.reply(helpMessage)
})
//this command give a random fact
bot.command('fact', ctx => {
    //setup the max row from the sheet filter among the rows and extract the value
    let maxRow = dataStore.filter(item =>{
        return item.row == '1' && item.col == "2"
    })[0].val
    //Randomize the selection
    let k = Math.floor(Math.random() * maxRow) + 1
    //select the random row
    let fact = dataStore.filter(item => {
        return (item.row == k && item.col =='5')
    })[0];
    
    let message = 
        `
        Fact #${fact.row} : ${fact.val}
        `
    ctx.reply(message)
})

//to update our sheet if there are any new fact
bot.command('update', async ctx => {
    try{
        await getData();
        ctx.reply("updated")
    }catch(e){
        console.log(e)
        ctx.reply("Error Encountered")
    }
})
//get data from sheet and store it in array
async function getData() {
    try {
        let res = await axios('https://spreadsheets.google.com/feeds/cells/1hhp7xLY4ojE7WGL1OakTLsTOiXp5xJcU3BWjEbr2JvA/1/public/full?alt=json')
        // console.log(res.data.feed.entry)
        let data = res.data.feed.entry
        dataStore = []
        data.forEach(item => {
            dataStore.push({
                row:item.gs$cell.row,
                col:item.gs$cell.col,
                val:item.gs$cell.inputValue,
            })
        })
        // console.log(dataStore)
    }catch(e){
        console.log(e)
        throw new Error;
    }
}

bot.launch()