const http = require('http');
const https = require('https');
const Dispatcher = require('./dispatcher.js')
const scraper = require('./scraper.js');
require("babel-polyfill");

class Bot {
    constructor(options) {
        this._options = options;
        this._dataURL = 'api.jsonbin.io';
        this._dbID = '5bbfcbdeadf9f5652a5c360c';
        this._commandsID = '5ba7cf78a97c597b3c56d492';
        this._audiosID = '5bbb80e9a24f62566ba02f61';
        this._dispatcher = new Dispatcher(this);
    }

    async start() {
        console.log('Collecting data...')
        this._db = await this.readData(this._dbID);
        this._commands = await this.readData(this._commandsID);
        this._audios = await this.readData(this._audiosID);
        console.log("Setting up commands...")
        this.setupCommands();
        console.log('Setting up the webhook..');
        this.setWebhook();
        console.log('Listening!');
    }

    readData(id) {
        const options = {
            host: this._dataURL,
            port: 80,
            path: `/b/${id}`,
            method: 'GET',
            headers: {
                'secret-key': this._options.dataSecretKey
            }
        };

        return new Promise(resolve => {
            http.get(options, res => {
                let data = '';

                res.on('data', d => {
                    data += d;
                });

                res.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });
        });
    }

    writeData(id, data) {
        const options = {
            host: this._dataURL,
            port: 80,
            path: `/b/${id}`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'secret-key': this._options.dataSecretKey,
                'versioning': false
            }
        };

        const request = http.request(options, res => {
            let data = '';

            res.on('data', d => {
                data += d;
            });

            res.on('end', () => {
                console.log(JSON.parse(data));
            });
        });

        request.write(JSON.stringify(data));
        request.end();
    }

    setupCommands() {
        this._dispatcher.addCommand('/subscribir', this.addSubscription);
        this._dispatcher.addCommand('/desubscribir', this.removeSubscription);
        this._dispatcher.addCommand('!guardar', this.saveMessage);
        this._dispatcher.addCommands(['/rosma', '/conxi', '/jenny', '/teresa', '/manu', '/nochi', '/xemisuke'], this.reply);
        this._dispatcher.addCommands(['/hoy', '/semana', '/mes', '/todo'], this.getSavedMessages);
        this._dispatcher.addCommands(['!bandida', '!teboté', '!vitamina', '!badbunny', '!ozuna', '!perreo', '!ciclo', "!booty"], this.sendAudio);
    }

    setWebhook() {
        https.get(`https://api.telegram.org/bot${this._options.token}/setWebhook?url=${this._options.url}&max_connections=${this._options.maxConnections}`, res => {
            let body = '';

            res.on('data', d => {
                body += d;
            });

            res.on('end', () => {
                console.log(JSON.parse(body).description);
            });
        });

        http.createServer((req, res) => {
            if (req.method == 'POST') {
                let body = '';

                req.on('data', d => {
                    body += d;
                });

                req.on('end', () => {
                    this._dispatcher.dispatch(JSON.parse(body));
                });

                res.writeHead(200, 'Message received successfully', { 'Content-Type': 'text/html' });
                res.write(JSON.stringify({}));
                res.end();
            }
            else {
                const timestamp = new Date().getTime();

                if (req.url == '/notify')
                    this.notifyEvents();

                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write('XemisukeBot' + '<br>' + 'Made with ❤ by Little Einsteins');
                res.end();
                console.log(`NEW GET REQUEST [Path: '${req.url}' | Remote Address: '${req.headers['x-forwarded-for'] || req.connection.remoteAddress}' Timestamp: '${timestamp}']`);
            }
        }).listen(this._options.port, '0.0.0.0');
    }


    saveMessage(message) {
        message.text = message.text.replace('#im', '').trim();
        this._db.messages.push(message);
        this.writeData(this._dbID, this._db);
    }

    getSavedMessages(chatID, time) {
        const date = new Date();
        let content = '';

        const getWeek = d => {
            var dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }

        const getExpDate = message => {
            const datePattern = /\[([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{1,2})\]/;
            let expDate = datePattern.exec(message);
            if (expDate != null) {
                const expDateParts = expDate[1].split('/');
                expDateParts[2] = parseInt(expDateParts[2]) + 2000;
                expDate = new Date(expDateParts.reverse().join('/'));
            }
            return expDate;
        }

        date.setTime(date.getTime() - date.getTimezoneOffset() * 60 * 1000);

        for (let i = 0; i < this._db.messages.length; i++) {
            let messageDate = new Date(this._db.messages[i].date * 1000);
            messageDate.setTime(messageDate.getTime() - messageDate.getTimezoneOffset() * 60 * 1000);
            let hours = messageDate.getHours();
            let minutes = messageDate.getMinutes();
            let day = messageDate.getUTCDate() < 10 ? `0${messageDate.getUTCDate()}` : messageDate.getUTCDate();
            let week = getWeek(messageDate);
            let month = messageDate.getUTCMonth() < 10 ? `0${messageDate.getUTCMonth() + 1}` : messageDate.getUTCMonth() + 1;
            let year = messageDate.getUTCFullYear().toString().substring(2);
            if (this._db.messages[i].chat.id == chatID) {
                const expDate = getExpDate(this._db.messages[i].text);
                if (expDate != null && expDate < date)
                    this._db.messages.splice(i, 1);
                else if ((time == 'hoy' && day == date.getUTCDate())
                    || (time == 'semana' && week == getWeek(date))
                    || (time == 'mes' && month == date.getUTCMonth())
                    || (time == 'todo')) {
                    content = `<b>[${day}/${month}/${year} ${hours}:${minutes}]</b> Mensaje de ${this._db.messages[i].from.first_name}:\n${this._db.messages[i].text}\n\n`;
                }
            }
        }

        if (content == '') {
            if (time == 'hoy')
                content = 'Vaya, parece que hoy no hay nada interesante :(';
            else if (time == 'semana')
                content = 'Vaya, parece que esta semana no hay nada interesante :(';
            else if (time == 'mes')
                content = 'Vaya, parece que este mes no hay nada intersante :(';
            else
                content = 'Vaya, parece que no hay nada intersante por aquí :(';
        }

        this.sendMessage(chatID, content);
        this.writeData(this._dbID, this._db);
    }

    addSubscription(chatID, message) {
        if (!this._db.events.subscribedChats.includes(chatID)) {
            this._db.events.subscribedChats.push(chatID);
            this.writeData(this._dbID, this._db);
            console.log(`CHAT SUBSCRIBED [Chat ID: '${chatID}' | Timestamp: '${message.date}']`);
        }
    }

    removeSubscription(chatID, message) {
        const index = this._db.events.subscribedChats.indexOf(chatID);

        if (index != -1) {
            this._db.events.subscribedChats.splice(index, 1);
            this.writeData(this._dbID, this._db);
            console.log(`CHAT UNSUBSCRIBED [Chat ID: '${chatID}' | Timestamp: '${message.date}']`);
        }
    }

    async notifyEvents() {
        const data = await scraper.getData();

        for (let i = 0; i < data.length; i++) {
            if (!this._db.events.notifications.includes(data[i].text)) {
                this._db.events.subscribedChats.forEach(chatID => {
                    setTimeout(() => {
                        this.sendMessage(chatID, `<b>AVISO DE SECRETARÍA ‼️</b>\n\n${data[i].text}\n\nMás información en: ${data[i].link}`);
                    }, i * 1000);
                });

                this._db.events.notifications.push(data[i].text);
            }
        }

        this.writeData(this._dbID, this._db);
    }

    reply(chatID, command, replyTo) {
        if (this._commands[command] != undefined)
            command = command.substring(1);
            this.sendMessage(chatID, this._commands[command][Math.floor(Math.random() * this._commands[command].length)].replace(/\${replyTo}/g, replyTo));
    }

    sendAudio(chatID, audio) {
        const timestamp = new Date().getTime();

        https.get(`https://api.telegram.org/bot${this._options.token}/sendAudio?chat_id=${chatID}&audio=${this._audios[audio.substring(1)]}`, res => {
            if (res.statusCode == 200)
                console.log(`AUDIO SENT [Chat ID: '${chatID}' | Timestamp: '${timestamp}']`);
            else
                console.error(`ERROR SENDING AUDIO [Status Code: '${res.statusCode}' | Headers: '${JSON.stringify(res.headers)}']`);
        });
    }

    sendMessage(chatID, text) {
        const encodedText = encodeURIComponent(text);
        const timestamp = new Date().getTime();

        https.get(`https://api.telegram.org/bot${this._options.token}/sendMessage?chat_id=${chatID}&text=${encodedText}&parse_mode=html`, res => {
            if (res.statusCode == 200)
                console.log(`MESSAGE SENT [Chat ID: '${chatID}' | Timestamp: '${timestamp}']`);
            else
                console.error(`ERROR SENDING MESSAGE [Status Code: '${res.statusCode}' | Headers: '${JSON.stringify(res.headers)}']`);
        });
    }
}

module.exports = Bot;