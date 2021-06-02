"use strict";
exports.__esModule = true;
var axios_1 = require("axios");
var Discord = require("discord.js");
var jsdom = require("jsdom");
var config = require("./config.json");
var client = new Discord.Client();
client.on("message", function (message) {
    var _a;
    var prefix = "!";
    // If the author is a bot or if the message doesn't start with the prefix do nothing
    if (message.author.bot)
        return;
    if (!message.content.startsWith(prefix))
        return;
    var commandBody = message.content.slice(prefix.length);
    var args = commandBody.split(" ");
    var command = (_a = args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (command === "ping") {
        // Return birthdays
        getBirthdays()
            .then(function (result) {
            message.channel.send("**Birthdays**");
            chunkArray(result, 15).forEach(function (split) {
                message.channel.send(split);
            });
        })["catch"](function (error) {
            sendErrorMessage(message.channel, error);
        });
        // Return events
        getEvents()
            .then(function (result) {
            message.channel.send("**Events**");
            chunkArray(result, 12).forEach(function (split) {
                message.channel.send(split);
            });
        })["catch"](function (error) {
            sendErrorMessage(message.channel, error);
        });
        // Send a link to upcoming movies
        message.channel.send("**Movies link**");
        message.channel.send("https://www.themoviedb.org/movie/upcoming");
    }
});
var birthdayRequestOptions = {
    method: "GET",
    url: "https://celebrity-bucks.p.rapidapi.com/birthdays/JSON",
    headers: {
        "x-rapidapi-key": config.RAPID_API_KEY,
        "x-rapidapi-host": "celebrity-bucks.p.rapidapi.com"
    }
};
function getBirthdays() {
    return axios_1["default"]
        .request(birthdayRequestOptions)
        .then(function (response) {
        var filteredResponse = [];
        var newResponse = response.data.Birthdays.sort(compareBirthdays);
        newResponse.forEach(function (item) {
            var dob = parseInt(item.dob.substring(0, 4));
            if (dob > 1940) {
                filteredResponse.push(item.dob.substring(0, 4) + ": " + item.name);
            }
        });
        return filteredResponse;
    })["catch"](function (error) {
        return "There was an error reaching the api:\n```" + error + "```";
    });
}
getEvents().then(function (response) { });
var JSDOM = jsdom.JSDOM;
function getEvents() {
    return axios_1["default"]
        .get("https://www.onthisday.com/")
        .then(function (response) {
        var dom = new JSDOM(response.data);
        var events = dom.window.document.getElementsByClassName("event");
        var parsedEvents = [];
        var eventStrings = [];
        for (var i = 0; i < events.length; i++) {
            parsedEvents[i] = { date: "", string: "", fullString: "" };
            var dateElement = events[i].getElementsByClassName("date")[0];
            parsedEvents[i].date = dateElement.innerHTML;
            dateElement.remove();
            parsedEvents[i].string = events[i].innerHTML;
            parsedEvents[i].fullString = parsedEvents[i].date + ": " + parsedEvents[i].string;
        }
        parsedEvents = parsedEvents.sort(compareEvents);
        for (var i = 0; i < events.length; i++) {
            eventStrings.push(parsedEvents[i].fullString.replace(/(<([^>]+)>)/gi, ""));
        }
        return eventStrings;
    })["catch"](function (error) {
        return "There was an error reaching the api:\n```" + error + "```";
    });
}
function chunkArray(myArray, chunkSize) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];
    for (index = 0; index < arrayLength; index += chunkSize) {
        var myChunk = myArray.slice(index, index + chunkSize);
        tempArray.push(myChunk);
    }
    return tempArray;
}
function sendErrorMessage(channel, error) {
    channel.send("Something went really wrong...\n```" + error + "```");
}
function compareBirthdays(a, b) {
    var aAsInt = parseInt(a.dob.substring(0, 4));
    var bAsInt = parseInt(b.dob.substring(0, 4));
    if (aAsInt < bAsInt) {
        return -1;
    }
    if (aAsInt > bAsInt) {
        return 1;
    }
    return 0;
}
function compareEvents(a, b) {
    var aAsInt = parseInt(a.date.substring(0, 4));
    var bAsInt = parseInt(b.date.substring(0, 4));
    if (aAsInt < bAsInt) {
        return -1;
    }
    if (aAsInt > bAsInt) {
        return 1;
    }
    return 0;
}
client.login(config.BOT_TOKEN);
