const Bot = require('./bot.js');

let options = {
    token: process.env.TOKEN,
    url: "https://xemisuke-bot.azurewebsites.net",
    port: process.env.PORT,
    maxConnections: 40,
    dataSecretKey: process.env.DATA_SECRET_KEY
}

const bot = new Bot(options);
bot.start();