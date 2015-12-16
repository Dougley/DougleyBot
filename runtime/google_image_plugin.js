var util = require('util');
var winston = require('winston');
var ConfigFile = require("../config.json");

function GoogleImagePlugin () {
	this.request = require('request');
}

// Return true if a message was sent
GoogleImagePlugin.prototype._respondToFriendMessage = function(userId, message) {
	return this._respond(userId, message);
}

// Return true if a message was sent
GoogleImagePlugin.prototype._respondToChatMessage = function(roomId, chatterId, message) {
	return this._respond(roomId, message);
}

GoogleImagePlugin.prototype.respond = function(query, channel, bot) {
if(!ConfigFile || !ConfigFile.youtube_api_key || !ConfigFile.google_custom_search){
			bot.sendMessage(msg.channel, "Image search requires both a YouTube API key and a Google Custom Search key!");
			return;
		}
		//gets us a random result in first 5 pages
		var page = 1 + Math.floor(Math.random() * 5) * 10; //we request 10 items
		request("https://www.googleapis.com/customsearch/v1?key=" + ConfigFile.youtube_api_key + "&cx=" + ConfigFile.google_custom_search + "&q=" + (args.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+page, function(err, res, body) {
			var data, error;
			try {
				data = JSON.parse(body);
			} catch (error) {
				console.log(error)
				return;
			}
			if(!data){
				console.log(data);
				bot.sendMessage(msg.channel, "Error:\n" + JSON.stringify(data));
				return;
			}
			else if (!data.items || data.items.length == 0){
				console.log(data);
				bot.sendMessage(msg.channel, "No result for '" + args + "'");
				return;
			}
			var randResult = data.items[Math.floor(Math.random() * data.items.length)];
			bot.sendMessage(msg.channel, randResult.title + '\n' + randResult.link);
		});
	}
	
}

GoogleImagePlugin.prototype._stripCommand = function(message) {
	if (this.options.command && message && message.toLowerCase().indexOf(this.options.command.toLowerCase() + " ") == 0) {
		return message.substring(this.options.command.length + 1);
	}
	return null;
}

module.exports = GoogleImagePlugin;
