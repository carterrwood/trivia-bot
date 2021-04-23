import { Message } from "discord.js";
import { parse } from "node:path";

const axios = require("axios");
const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

const prefix = "!";

client.on("message", function (message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    getBirthdays()
      .then((result) => {
        message.channel.send(`**Birthdays**`);
        chunkArray(result, 15).forEach((split) => {
          message.channel.send(split);
        });
      })
      .catch((error) => {
        message.channel.send(
          `Something went really wrong...\n\`\`\`${error}\`\`\``
        );
      });
    getEvents()
      .then((result) => {
        message.channel.send(`**Events**`);
        chunkArray(result, 12).forEach((split) => {
          message.channel.send(split);
        });
      })
      .catch((error) => {
        message.channel.send(
          `Something went really wrong...\n\`\`\`${error}\`\`\``
        );
      });
    message.channel.send(`**Movies link**`);
    message.channel.send("https://www.themoviedb.org/movie/upcoming");
  }
});

var options = {
  method: "GET",
  url: "https://celebrity-bucks.p.rapidapi.com/birthdays/JSON",
  headers: {
    "x-rapidapi-key": config.RAPID_API_KEY,
    "x-rapidapi-host": "celebrity-bucks.p.rapidapi.com",
  },
};

function compare(a: any, b: any) {
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
      const newResponse = response.data.Birthdays.sort(compare);
      newResponse.forEach((item) => {
        const dob = parseInt(item.dob.substring(0, 4));
        if (dob > 1940) {
          filteredResponse.push(`${item.dob.substring(0, 4)}: ${item.name}`);
        }
      });
      return filteredResponse;
    })
    .catch(function (error) {
      return `There was an error reaching the api:\n\`\`\`${error}\`\`\``;
    });
}

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
function getEvents() {
  return axios
    .get("https://www.onthisday.com/")
    .then(function (response) {
      const dom = new JSDOM(response.data);
      const events = dom.window.document.getElementsByClassName("event");
      var parsedEvents = [];
      var eventStrings = [];
      for (var i = 0; i < events.length; i++) {
        parsedEvents[i] = {};
        const dateElement = events[i].getElementsByClassName("date")[0];
        parsedEvents[i].date = dateElement.innerHTML;
        dateElement.remove();
        parsedEvents[i].string = events[i].innerHTML;
        parsedEvents[
          i
        ].fullString = `${parsedEvents[i].date}: ${parsedEvents[i].string}`;
        eventStrings.push(
          parsedEvents[i].fullString.replace(/(<([^>]+)>)/gi, "")
        );
      }
      return eventStrings;
    })
    .catch(function (error) {
      return `There was an error reaching the api:\n\`\`\`${error}\`\`\``;
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
