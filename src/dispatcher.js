class Dispatcher {
    constructor(bot) {
        this._bot = bot;
        this._commands = {}
    }

    dispatch(update) {
        const message = update.message;

        if (message.hasOwnProperty('text')) {
            const chatID = message.chat.id;
            const messageID = message.message_id;
            const updateID = update.update_id;
            const timestamp = message.date;
            const content = message.text.toLowerCase().trim();
            const command = content.split(' ')[0].replace('@xemisukebot', '')
            const text = content.split(' ').shift();

            if (!this._bot._db.chats.includes(chatID)) {
                this._bot._db.chats.push(chatID);
                this._bot.writeData(this._bot._dbID, this._bot._db);
            }

            console.log(`NEW MESSAGE [Chat ID: '${chatID}' | Message ID: '${messageID}' | Update ID: '${updateID}' | Timestamp: '${timestamp}' | Content: '${content}']`);

            if (command && this._commands[command])
                this._commands[command](chatID, command, timestamp, text);
        }
    }

    addCommand(command, callback) {
        this._commands[command] = callback.bind(this._bot);
    }

    addCommands(commands, callback) {
        commands.forEach(command => {
            this.addCommand(command, callback);
        });
    }

    removeCommand(command) {
        delete this._commands[command];
    }

    removeCommands(commands) {
        commands.forEach(command => {
            this.removeCommand(command);
        });
    }
}

module.exports = Dispatcher;