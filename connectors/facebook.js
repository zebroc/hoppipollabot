'use strict';

var request = require('request');
var Config = require('../config');

var newRequest = request.defaults({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    method: 'POST',
    json: true,
    qs: {
        access_token: Config.FB_PAGE_TOKEN
    },
    headers: {
        'Content-Type': 'application/json'
    },
});

var newMessage = function (recipientId, msg, atts, cb) {
    console.log('newMessage: ', recipientId);
    console.log('newMessage: ', msg);
    console.log('newMessage: ', atts);
    console.log('newMessage: ', cb);

    var opts = {
        form: {
            recipient: {
                id: recipientId
            },
        }
    };

    if (atts) {
        var message = {
            attachment: {
                "type": "image",
                "payload": {
                    "url": msg
                }
            }
        }
    } else {
        var message = {
            text: msg
        }
    }
    opts.form.message = message;

    newRequest(opts, function (err, resp, data) {
        if (cb) {
            cb(err || data.error && data.error.message, data)
        }
    })
};

var getMessageEntry = function (body) {
    console.log('getMessageEntry: ', body);

    var val = body.object === 'page' &&
        body.entry &&
        Array.isArray(body.entry) &&
        body.entry.length > 0 &&
        body.entry[0] &&
        body.entry[0].messaging &&
        Array.isArray(body.entry[0].messaging) &&
        body.entry[0].messaging.length > 0 &&
        body.entry[0].messaging[0];
    return val || null
};

module.exports = {
    newRequest: newRequest,
    newMessage: newMessage,
    getMessageEntry: getMessageEntry,
};
