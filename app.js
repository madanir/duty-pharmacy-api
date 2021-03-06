const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const slugify = require('slugify');

const {ApolloServer} = require('apollo-server-express');
const {importSchema} = require('graphql-import');

const resolvers = require('./graphql/resolvers/index');

const API_URI = 'https://www.haberturk.com/nobetci-eczaneler/{0}/{1}';
const API_CITY_URI = 'https://www.haberturk.com/nobetci-eczaneler/{0}';

const server = new ApolloServer({
    typeDefs: importSchema('./graphql/schema.graphql'),
    resolvers,
    context: {
        API_URI,
        API_CITY_URI,
        fetch,
        cheerio,
        slugify,
    },
    introspection: true,
    playground: true
});

const app = express();

app.get('/get/:city', async (req, res) => {
    var city = req.params.city;

    var datas = [];
    await fetch(API_CITY_URI.replace('{0}', slugify(city)))
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body);

            $('figure').each(function (i, elem) {
                datas[i] = {
                    city: city.charAt(0).toUpperCase() + city.slice(1),
                    town: $(this)
                        .find('div[class=title] h3 a span')
                        .text()
                        .match(/(.*) \(([^)]+)\)/)[2],
                    name: $(this)
                        .find('div[class=title] h3 a span')
                        .text()
                        .match(/(.*) \(([^)]+)\)/)[1],
                    address: $(this)
                        .find('figcaption p')
                        .first()
                        .text()
                        .split('Adres: ')[1],
                    phone: $(this)
                        .find('figcaption p')
                        .last()
                        .text()
                        .split('Telefon: ')[1],
                }
            })
        })
    res.send(datas)
})

app.get('/get/:city/:town', async (req, res) => {
    var city = req.params.city;
    var town = req.params.town;

    var datas = [];
    await fetch(API_URI.replace('{0}', slugify(city)).replace('{1}', slugify(town)))
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body);

            $('figure').each(function (i, elem) {
                datas[i] = {
                    city: city.charAt(0).toUpperCase() + city.slice(1),

                    town: $(this)
                        .find('div[class=title] h3 a span')
                        .text()
                        .match(/(.*) \(([^)]+)\)/)[2],
                    name: $(this)
                        .find('div[class=title] h3 a span')
                        .text()
                        .match(/(.*) \(([^)]+)\)/)[1],
                    address: $(this)
                        .find('figcaption p')
                        .first()
                        .text()
                        .split('Adres: ')[1],
                    phone: $(this)
                        .find('figcaption p')
                        .last()
                        .text()
                        .split('Telefon: ')[1],
                }
            })
        })
    res.send(datas)
})

server.applyMiddleware({
    app,
    path: '/graphql',
    cors: {
        origin: true,
        credentials: true
    }
})

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log('sunucu ayakta efenim')
})