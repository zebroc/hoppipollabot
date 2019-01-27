'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');

var Config = require('./config');
var FB = require('./connectors/facebook');
var Bot = require('./bot');


var app = express();

app.set('port', (process.env.PORT) || 5000);

app.listen(app.get('port'), 'localhost', function () {
    console.log('Running on port', app.get('port'))
});

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('hello world i am a chat bot')
});

app.get('/webhooks', function (req, res) {
    if (req.query['hub.verify_token'] === Config.FB_VERIFY_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

app.post('/webhooks', function (req, res) {
    var entry = FB.getMessageEntry(req.body);

    if (entry && entry.message) {
        if (entry.message.attachments) {
            FB.newMessage(entry.sender.id, "That's interesting!")
        } else {
            if (entry.sender.id != 1427557190883167)
                Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
                    FB.newMessage(sender, reply)
                })
        }
    }

    res.sendStatus(200)
});
