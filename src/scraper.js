const URL = "https://www.etsisi.upm.es/estudios/secretaria-alumnos";

module.exports = {
    getData() {
        const sanitize = text => {
            const data = text.substring(1).replace(/\n|\t/g, "");

            return data.substring(0, 1) + data.substring(1).toLowerCase();
        }

        const getAttatchedLink = item => {
            let URL = $(item).find('a').attr('href');
            const baseURL = 'https://www.etsisi.upm.es';

            if (URL == undefined)
                URL = baseURL;
            else if (URL.indexOf("/") == 0)
                URL = baseURL + URL;

            return URL;
        }

        return new Promise(res => {
            https.get(URL, res => {
                let body = '';

                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    const $ = cheerio.load(body);
                    let data = [];

                    $($('tbody').find('ul')).find('li').each((i, item) => {
                        data[i] = {
                            text: sanitize($(item).text()),
                            link: getAttatchedLink(item)
                        };
                    });

                    data = data.filter((item) => {
                        return item.text != "";
                    }).reverse();

                    resolve(data);
                });
            });
        });
    }
}