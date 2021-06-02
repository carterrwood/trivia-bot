import axios, { AxiosRequestConfig } from "axios";
import * as Discord from "discord.js";
import * as jsdom from "jsdom";
import * as config from "./config.json";

const client = new Discord.Client();

client.on("message", function (message) {
  const prefix = "!";

  // If the author is a bot or if the message doesn't start with the prefix do nothing
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift()?.toLowerCase();

  if (command === "ping") {
    // Return birthdays
    getBirthdays()
      .then((result) => {
        message.channel.send(`**Birthdays**`);
        chunkArray(result, 15).forEach((split) => {
          message.channel.send(split);
        });
      })
      .catch((error) => {
        sendErrorMessage(message.channel, error);
      });

    // Return events
    getEvents()
      .then((result) => {
        message.channel.send(`**Events**`);
        chunkArray(result, 12).forEach((split) => {
          message.channel.send(split);
        });
      })
      .catch((error) => {
        sendErrorMessage(message.channel, error);
      });

    // Send a link to upcoming movies
    message.channel.send(`**Movies link**`);
    message.channel.send("https://www.themoviedb.org/movie/upcoming");
  }
});

const birthdayRequestOptions: AxiosRequestConfig = {
  method: "GET",
  url: "https://celebrity-bucks.p.rapidapi.com/birthdays/JSON",
  headers: {
    "x-rapidapi-key": config.RAPID_API_KEY,
    "x-rapidapi-host": "celebrity-bucks.p.rapidapi.com",
  },
};

function getBirthdays() {
  return axios
    .request(birthdayRequestOptions)
    .then(function (response) {
      var filteredResponse: String[] = [];
      const newResponse = response.data.Birthdays.sort(compareBirthdays);
      newResponse.forEach((item: { dob: string; name: any }) => {
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

getEvents().then(function (response) {});
const { JSDOM } = jsdom;
function getEvents() {
  return axios
    .get("https://www.onthisday.com/")
    .then(function (response) {
      const dom = new JSDOM(response.data);
      const events = dom.window.document.getElementsByClassName("event");
      var parsedEvents: {
        date: string;
        string: string;
        fullString: string;
      }[] = [];
      var eventStrings = [];
      for (var i = 0; i < events.length; i++) {
        parsedEvents[i] = { date: "", string: "", fullString: "" };
        const dateElement = events[i].getElementsByClassName("date")[0];
        parsedEvents[i].date = dateElement.innerHTML;
        dateElement.remove();
        parsedEvents[i].string = events[i].innerHTML;
        parsedEvents[
          i
        ].fullString = `${parsedEvents[i].date}: ${parsedEvents[i].string}`;
      }
      parsedEvents = parsedEvents.sort(compareEvents);
      for (var i = 0; i < events.length; i++) {
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

function chunkArray(myArray: string | any[], chunkSize: number) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunkSize) {
    var myChunk = myArray.slice(index, index + chunkSize);
    tempArray.push(myChunk);
  }

  return tempArray;
}

function sendErrorMessage(
  channel: Discord.TextChannel | Discord.DMChannel | Discord.NewsChannel,
  error: any
) {
  channel.send(`Something went really wrong...\n\`\`\`${error}\`\`\``);
}

function compareBirthdays(a: { dob: string }, b: { dob: string }) {
  const aAsInt = parseInt(a.dob.substring(0, 4));
  const bAsInt = parseInt(b.dob.substring(0, 4));
  if (aAsInt < bAsInt) {
    return -1;
  }
  if (aAsInt > bAsInt) {
    return 1;
  }
  return 0;
}

function compareEvents(a: { date: string }, b: { date: string }) {
  const aAsInt = parseInt(a.date.substring(0, 4));
  const bAsInt = parseInt(b.date.substring(0, 4));
  if (aAsInt < bAsInt) {
    return -1;
  }
  if (aAsInt > bAsInt) {
    return 1;
  }
  return 0;
}

client.login(config.BOT_TOKEN);
