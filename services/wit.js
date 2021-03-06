'use strict';

var Config = require('../config');
var FB = require('../connectors/facebook');
var Wit = require('node-wit').Wit;
var request = require('request');

var firstEntityValue = function (entities, entity) {
    var val = entities && entities[entity] &&
        Array.isArray(entities[entity]) &&
        entities[entity].length > 0 &&
        entities[entity][0].value;

    if (!val) {
        return null
    }
    return typeof val === 'object' ? val.value : val
};

var actions = {
    say (sessionId, context, message, cb) {
        // Bot testing mode, run cb() and return
        if (require.main === module) {
            cb();
            return
        }

        console.log('WIT WANTS TO TALK TO:', context._fbid_);
        console.log('SESSION ID:', sessionId);
        console.log('WIT HAS SOMETHING TO SAY:', message);
        console.log('WIT HAS A CONTEXT:', context);
        console.log('CALLBACK:', cb);

        if (checkURL(message)) {
            FB.newMessage(context._fbid_, message, true)
        } else {
            FB.newMessage(context._fbid_, message)
        }

        cb()
    },

    merge(sessionId, context, entities, message, cb) {
        console.log('Here are the entities: ', entities);
        // Reset the weather story
        delete context.forecast;

        // Retrive the location entity and store it in the context field
        var location = firstEntityValue(entities, 'locationName');
        if (location) {
            context.location = location
        }

        // Reset the cutepics story
        delete context.pics;

        // Retrieve the category
        var category = firstEntityValue(entities, 'category');
        if (category) {
            context.cat = category
        }

        // Retrieve the season
        var season = firstEntityValue(entities, 'season');
        if (season) {
            context.season = season
        }

        // Retrieve the sentiment
        var sentiment = firstEntityValue(entities, 'sentiment');
        if (sentiment) {
            context.ack = sentiment === 'positive' ? 'Glad your liked it!' : 'Aww, that sucks.'
        } else {
            delete context.ack
        }

        cb(context)
    },

    error(sessionId, context, error) {
        console.log(error.message)
    },

    ['fetch-advice'](sessionId, context, cb) {
        console.log('Fetch-advice got season: ', context.season);

        if (context.season === 'Sommer') {
            context.advice = 'Im Sommer kannst du im Grunde jedes beliebige Auto mieten, so lange du dich auf den' +
                'normalen Straßen aufhältst und nicht auf F-Straßen. Ein Kleinwagen, Bus oder Kombi ist OK.';
        } else if (context.season === 'Winter') {
            context.advice = 'Im Winter, wenn die Wahrscheinlichkeit für Schnee nahezu 100% ist, würde ich immer einen' +
                'Allradwagen empfehlen, also zum Beispiel ein SUV.';
        } else if (context.season === 'Frühling') {
            context.advice = 'Im Frühling wie im Herbst solltest du das Wetter beobachten und je nachdem entscheiden: ' +
                'War es ein strammer Winter solltest du im Frühling vorsichtig sein und lieber einen Allradler mieten. ' +
                'War der Winter milde und die Vorhersagen ähnlich kann man evtl. auch das Risiko eingehen ein normales Fahrzeug zu mieten.';
        } else if (context.season === 'Herbst') {
            context.advice = 'Im Herbst wie im Frühling solltest du das Wetter beobachten und je nachdem entscheiden: ' +
                'War es ein strammer Winter solltest du im Frühling vorsichtig sein und lieber einen Allradler mieten. ' +
                'War der Winter milde und die Vorhersagen ähnlich kann man evtl. auch das Risiko eingehen ein normales Fahrzeug zu mieten.';
        }

        cb(context);
    },

    ['fetch-weather'](sessionId, context, cb) {
        getWeather(context, cb);
    },

};

// SETUP THE WIT.AI SERVICE
var getWit = function () {
    console.log('GRABBING WIT');
    return new Wit(Config.WIT_TOKEN, actions);
};

module.exports = {
    getWit: getWit,
};

// BOT TESTING MODE
if (require.main === module) {
    console.log('Bot testing mode!');
    var client = getWit();
    client.interactive();
}

// CHECK IF URL IS AN IMAGE FILE
var checkURL = function (url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
};

// GET WEATHER FROM API
var getWeather = function (context, cb) {
    var url = 'https://query.yahooapis.com/v1/public/yql?q=select%20item.condition%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + context.location + '%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

    console.log('Context: ', context);

    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var jsonData = JSON.parse(body);
            var forecast = jsonData.query.results.channel.item.condition.text;

            if (context.location) {
                context.weather = forecast || 'Super';
                console.log('Context had location, getWeather result:', forecast);
            } else {
                context.weather = forecast || 'Unbekannt';
                console.log('Context had NO location, getWeather result: Unknown');
            }

            cb(context)

        }
    })

};
