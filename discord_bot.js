/*
	this bot is a ping pong bot, and every time a message
	beginning with "ping" is sent, it will reply with
	"pong".
*/

var Discord = require("discord.js");

var Commands = require("./commands").Commands;

// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var cmdLastExecutedTime = {};

var admin_ids = ["107904023901777920"];

try {
	var rssFeeds = require("./rss.json");

	function loadFeeds() {
		for (var cmd in rssFeeds) {
			commands[cmd] = {
				usage: "[count]",
				description: rssFeeds[cmd].description,
				url: rssFeeds[cmd].url,
				process: function(bot, msg, suffix) {
					var count = 1;
					if (suffix != null && suffix !== "" && !isNaN(suffix)) {
						count = suffix;
					}
					rssfeed(bot, msg, this.url, count, false);
				}
			};
		}
	}
} catch (e) {
	console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}

function rssfeed(bot, msg, url, count, full) {
	var FeedParser = require('feedparser');
	var feedparser = new FeedParser();
	var request = require('request');
	request(url).pipe(feedparser);
	feedparser.on('error', function(error) {
		bot.sendMessage(msg.channel, "failed reading feed: " + error);
	});
	var shown = 0;
	feedparser.on('readable', function() {
		var stream = this;
		shown += 1
		if (shown > count) {
			return;
		}
		var item = stream.read();
		bot.sendMessage(msg.channel, item.title + " - " + item.link, function() {
			if (full === true) {
				var text = htmlToText.fromString(item.description, {
					wordwrap: false,
					ignoreHref: true
				});
				bot.sendMessage(msg.channel, text);
			}
		});
		stream.alreadyRead = true;
	});
}


var bot = new Discord.Client();

bot.on("ready", function() {
	loadFeeds();
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function() {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error

});

bot.on("message", function(msg) {

	// log chat specifially for new VM web window
	var channelInfo = "[Private Message]";
	if (!msg.isPrivate) { channelInfo = "[$" + msg.channel.server.name + "] [#" + msg.channel.name + "]"; }

	// prevent NekoBot from gaining sentience
	if(msg.author.equals(bot.user)) { return; }

	// check for command prefix so we know it's a command
	if(msg.content.charAt(0) === "!") {

		// remove the command prefix from the message
		msg.content = msg.content.substr(1);

		// split message into command and params
		var chunks = msg.content.split(" ");
		var command = chunks[0];
		var params = chunks.slice(1);

		// ignore if idiotic punctuation spam
		var antiIdiot = new RegExp("^[a-z0-9]+$", "i");
		if (antiIdiot.test(command) === false) { return; }

		// search for a matching command
		if (Commands[command]) {
            Commands[command].process(bot, msg, params);

		// no matching command
		} else {
			bot.reply(msg, "there is no **" + Config.commands.prefix + command + "** command.").catch(error);
		}
	}
});


//Log user status changes
bot.on("presence", function(data) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(data.user + " went " + data.status);
	//}
});

function isInt(value) {
	return !isNaN(value) &&
		parseInt(Number(value)) == value &&
		!isNaN(parseInt(value, 10));
}

function canProcessCmd(cmd, cmdText, userId, msg) {
	var isAllowResult = true;
	var errorMessage = "";

	if (cmd.hasOwnProperty("timeout")) {
		// check for timeout
		if (cmdLastExecutedTime.hasOwnProperty(cmdText)) {
			var currentDateTime = new Date();
			var lastExecutedTime = new Date(cmdLastExecutedTime[cmdText]);
			lastExecutedTime.setSeconds(lastExecutedTime.getSeconds() + cmd.timeout);

			if (currentDateTime < lastExecutedTime) {
				// still on cooldown
				isAllowResult = false;
				//var diff = (lastExecutedTime-currentDateTime)/1000;
				//errorMessage = diff + " secs remaining";
				bot.sendMessage(msg.channel, msg.sender + ", this command is on cooldown!");
			} else {
				// update last executed date time
				cmdLastExecutedTime[cmdText] = new Date();
			}
		} else {
			// first time executing, add to last executed time
			cmdLastExecutedTime[cmdText] = new Date();
		}
	}

	if (cmd.hasOwnProperty("adminOnly") && cmd.adminOnly && !isAdmin(userId)) {
		isAllowResult = false;
		bot.sendMessage(msg.channel, msg.sender + ", you are not allowed to do that!");
	}

	return {
		isAllow: isAllowResult,
		errMsg: errorMessage
	};
}

function isAdmin(id) {
	return (admin_ids.indexOf(id) > -1);
}

function get_gif(tags, func) {
	//limit=1 will only return 1 gif
	var params = {
		"api_key": config.api_key,
		"rating": config.rating,
		"format": "json",
		"limit": 1
	};
	var query = qs.stringify(params);

	if (tags !== null) {
		query += "&q=" + tags.join('+')
	}

	//wouldnt see request lib if defined at the top for some reason:\
	var request = require("request");
	//console.log(query)

	request(config.url + "?" + query, function(error, response, body) {
		//console.log(arguments)
		if (error || response.statusCode !== 200) {
			console.error("giphy: Got error: " + body);
			console.log(error);
			//console.log(response)
		} else {
			var responseObj = JSON.parse(body)
			console.log(responseObj.data[0])
			if (responseObj.data.length) {
				func(responseObj.data[0].id);
			} else {
				func(undefined);
			}
		}
	}.bind(this));
}

bot.login(AuthDetails.email, AuthDetails.password);