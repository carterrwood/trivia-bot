"use strict";
exports.__esModule = true;
var axios = require("axios");
var Discord = require("discord.js");
var config = require("./config.json");
var client = new Discord.Client();
var prefix = "!";
client.on("message", function (message) {
    if (message.author.bot)
        return;
    if (!message.content.startsWith(prefix))
        return;
    var commandBody = message.content.slice(prefix.length);
    var args = commandBody.split(" ");
    var command = args.shift().toLowerCase();
    if (command === "ping") {
        getBirthdays()
            .then(function (result) {
            message.channel.send("**Birthdays**");
            chunkArray(result, 15).forEach(function (split) {
                message.channel.send(split);
            });
        })["catch"](function (error) {
            message.channel.send("Something went really wrong...\n```" + error + "```");
        });
        getEvents()
            .then(function (result) {
            message.channel.send("**Events**");
            chunkArray(result, 12).forEach(function (split) {
                message.channel.send(split);
            });
        })["catch"](function (error) {
            message.channel.send("Something went really wrong...\n```" + error + "```");
        });
        message.channel.send("**Movies link**");
        message.channel.send("https://www.themoviedb.org/movie/upcoming");
    }
});
var options = {
    method: "GET",
    url: "https://celebrity-bucks.p.rapidapi.com/birthdays/JSON",
    headers: {
        "x-rapidapi-key": config.RAPID_API_KEY,
        "x-rapidapi-host": "celebrity-bucks.p.rapidapi.com"
    }
};
function compare(a, b) {
    a = parseInt(a.dob.substring(0, 4));
    b = parseInt(b.dob.substring(0, 4));
    if (a < b) {
        return -1;
    }
    if (a > b) {
        return 1;
    }
    return 0;
}
function getBirthdays() {
    return axios
        .request(options)
        .then(function (response) {
        var filteredResponse = [];
        var newResponse = response.data.Birthdays.sort(compare);
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
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
function getEvents() {
    return axios
        .get("https://www.onthisday.com/")
        .then(function (response) {
        var dom = new JSDOM(response.data);
        var events = dom.window.document.getElementsByClassName("event");
        var parsedEvents = [];
        var eventStrings = [];
        for (var i = 0; i < events.length; i++) {
            parsedEvents[i] = {};
            var dateElement = events[i].getElementsByClassName("date")[0];
            parsedEvents[i].date = dateElement.innerHTML;
            dateElement.remove();
            parsedEvents[i].string = events[i].innerHTML;
            parsedEvents[i].fullString = parsedEvents[i].date + ": " + parsedEvents[i].string;
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
client.login(config.BOT_TOKEN);
