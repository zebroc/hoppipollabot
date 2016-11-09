'use strict';

var Config = require('./config');
var wit = require('./services/wit').getWit();

var sessions = {};

var findOrCreateSession = function (fbid) {
    var sessionId;

    Object.keys(sessions).forEach(k => {
        if (sessions[k].fbid === fbid) {
            sessionId = k
        }
    });

    if (!sessionId) {
        sessionId = new Date().toISOString();
        sessions[sessionId] = {
            fbid: fbid,
            context: {
                _fbid_: fbid
            }
        }
    }

    return sessionId
};

var read = function (sender, message, reply) {
    if (message === 'hello') {
        message = 'Hello yourself!';
        reply(sender, message)
    } else {
        var sessionId = findOrCreateSession(sender);

        wit.runActions(
            sessionId,
            message,
            sessions[sessionId].context,
            function (error, context) {
                if (error) {
                    console.log('oops!', error)
                } else {
                    console.log('Waiting for further messages');
                    sessions[sessionId].context = context
                }
            })

        sessions[sessionId] = null;
    }
};

module.exports = {
    findOrCreateSession: findOrCreateSession,
    read: read,
};
