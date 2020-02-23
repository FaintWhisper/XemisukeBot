# XemisukeBot: A fun and useful Telegram bot built for the ETSISI - UPM

## Deployment
If you want to deploy and host this bot on your own just follow this steps:
1. Clone this repository to you computer.
2. Set up the mandatory environment variables needed to connect to the Telegram API in the machine or PaaS you will be using. (You can read more about it here: https://core.telegram.org/bots/api), you may also need to change the deplyment url inside 'main.js' to the one given by your domain or PaaS service provider.
3. Run the script named 'compile.cmd'.
4. Wait until the script finishes the compilation task and then type:
    > npm start

That's all, you can go now to telegram and interact with the bot (Tip: type '/' to see all the available commands).

## Built With

* [Telegram API](https://core.telegram.org/) - Official API used to interact with the Telegram service.
* [Microsoft Azure - Web App](https://azure.microsoft.com/es-es/services/app-service/web/) - PaaS used to deploy the bot.

## Contributing

If you want to contribute to this project you're more than welcome, just send a pull request and you are done!

## Authors

* **Amit Karamchandani Batra** - [RYSKZ](https://github.com/RYSKZ)

## License

This project is licensed under the GNU v3.0 License.

## Acknowledgments

* Thanks to the team behind Cheerio JS: https://github.com/cheeriojs/cheerio
