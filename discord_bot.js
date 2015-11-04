/*
	this bot is a ping pong bot, and every time a message
	beginning with "ping" is sent, it will reply with
	"pong".
*/
// Discord Unoffical API
var Discord = require("discord.js");
// YouTube Data API
var yt = require("./youtube_plugin");
var youtube_plugin = new yt();
// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var htmlToText = require('html-to-text');
// !GIF Support
var config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/search",
    "permission": ["NORMAL"]
};

var commands = {
		//Repond Back Commands
	    "pet": {
        usage: "<pets>",
        description: "Everyone loves being pet, right!?! Pets each *@user*. Leave emtpy (or mention me too) to pet me!",
        process: function(bot, message, params, errorCallback) {

		// build an array to store pets
		var pets = [];

		// if everyone is mentioned, skip all other mentions. if nobody is mentioned, nekobot just purrs
		// TODO: message.everyo	neMentioned is broken so for now we're using indexOf()
		if (message.mentions.length === 0 || params.indexOf("@everyone") !== -1) {
			if (params.indexOf("@everyone") !== -1) { pets.push(message.author + " pets @everyone "); }
			bot.sendMessage(message, pets + "*purrs*").catch(errorCallback);
			return;
		}

		// otherwise, cycle mentions and add each user to pets
		for (index in message.mentions) {
			var user = message.mentions[index];
			pets.push(user);
		}

		// if nekobot is on the list, purr
		if (message.isMentioned(bot.user)) { pets.push("*purrs*"); }

		// send message
		bot.sendMessage(message, message.author + " pets " + pets.join(" ")).catch(errorCallback);
	}
},

"dank": {
        usage: "<gives dank memes>",
        description: "Everyone loves dank memes, right!?!",
        process: function(bot, message, params, errorCallback) {

		// build an array to store dank
		var dank = [];

		// if everyone is mentioned, skip all other mentions. if nobody is mentioned, nekobot just purrs
		// TODO: message.everyo	neMentioned is broken so for now we're using indexOf()
		if (message.mentions.length === 0 || params.indexOf("@everyone") !== -1) {
			if (params.indexOf("@everyone") !== -1) { dank.push(message.author + " pets @everyone "); }
			bot.sendMessage(message, dank + "**All These Dank Memes** http://cdn.meme.am/instances/500x/56642282.jpg").catch(errorCallback);
			return;
		}

		// otherwise, cycle mentions and add each user to dank
		for (index in message.mentions) {
			var user = message.mentions[index];
			dank.push(user);
		}

		// if nekobot is on the list, purr
		if (message.isMentioned(bot.user)) { dank.push("*Dank*"); }

		// send message
		bot.sendMessage(message, message.author + " gives " + dank.join(" ") + " Dank Memes").catch(errorCallback);
	}
},

"shoot": {
        usage: "<shoots>",
        description: "Everyone loves being shot, right!?! shoots each *@user*. Leave emtpy (or mention me too) to shoot me!",
        process: function(bot, message, params, errorCallback) {

		// build an array to store shoot
		var shoots = [];

		// if everyone is mentioned, skip all other mentions. if nobody is mentioned, nekobot just purrs
		// TODO: message.everyo	neMentioned is broken so for now we're using indexOf()
		if (message.mentions.length === 0 || params.indexOf("@everyone") !== -1) {
			if (params.indexOf("@everyone") !== -1) { shoots.push(message.author + " pets @everyone "); }
			bot.sendMessage(message, pets + "*splat*").catch(errorCallback);
			return;
		}

		// otherwise, cycle mentions and add each user to shoot
		for (index in message.mentions) {
			var user = message.mentions[index];
			shoots.push(user);
		}

		// if nekobot is on the list, purr
		if (message.isMentioned(bot.user)) { shoots.push("*splat*"); }

		// send message
		bot.sendMessage(message, message.author + " shoots " + shoots.join(" ")).catch(errorCallback);
	}
},

"chill": {
        usage: "<passthe>",
        description: "Blaze it 420",
        process: function(bot, message, params, errorCallback) {

		// build an array to store shoot
		var chills = [];

		// if everyone is mentioned, skip all other mentions. if nobody is mentioned, nekobot just purrs
		// TODO: message.everyo	neMentioned is broken so for now we're using indexOf()
		if (message.mentions.length === 0 || params.indexOf("@everyone") !== -1) {
			if (params.indexOf("@everyone") !== -1) { chills.push(message.author + " pets @everyone "); }
			bot.sendMessage(message, pets + "*Kek*").catch(errorCallback);
			return;
		}

		// otherwise, cycle mentions and add each user to chills
		for (index in message.mentions) {
			var user = message.mentions[index];
			chills.push(user);
		}

		// if nekobot is on the list, purr
		if (message.isMentioned(bot.user)) { chills.push("*https://www.youtube.com/watch?v=SjBBDJ5OiT0*"); }

		// send message
		bot.sendMessage(message, message.author + " Passes the bong to " + chills.join(" ")).catch(errorCallback);
	}
},

	//Twitch Streamers Links
    "timmac": {
        description: "Link To Timmac Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://twitch.tv/timmac");
        }
    },
    "mrmoon": {
        description: "Link To Timmac Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://twitch.tv/mrmoonshouse");
        }
    },
    "ming": {
        description: "Link To Timmac Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://www.twitch.tv/mrbong011");
        }
    },
    "honyolo": {
        description: "Link To Hon Yolo Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel,"http://twitch.tv/honyolo");
        }
    },
    "floppy": {
        description: "Link To Floppy Pancakes Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://twitch.tv/floppypancakes");
        }
    },
    "monty": {
        description: "Link To Monty Brython Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://www.twitch.tv/montybrython");
        }
    },
    "shroomz": {
        description: "Link To Shroomz Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://www.twitch.tv/shroomztv");
        }
    },
    "jounie": {
        description: "Link To Jounie's Stream",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://www.twitch.tv/ravencatt");
        }
    },
	//Standard Commands
    "hype": {
        description: "timmacHYPE Animated",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://i.imgur.com/20CO8KA.gif");
        }
    },	
    "bd": {
        description: "information about BetterDiscord",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " Get Twitch Emotes on Discord! Check the **#FAQ** for more info!");
        }
    },	
    "steam": {
        description: "Steam Community Group",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " http://steamcommunity.com/groups/timmac");
        }
    },
    "johncena": {
        description: "AND HIS NAME IS",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " **AND HIS NAME IS** https://www.youtube.com/watch?v=4k1xY7v8dDQ");
        }
    },	
	"gif": {
		usage: "<image tags>",
        description: "returns a random gif matching the tags passed",
		process: function(bot, msg, suffix) {
		    var tags = suffix.split(" ");
		    get_gif(tags, function(id) {
			if (typeof id !== "undefined") {
			    bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
			else {
			    bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
			}
		    });
		}
	},
    "ping": {
        description: "responds pong, useful for checking if bot is alive",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, msg.sender+" pong!");
            if(suffix){
                bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
            }
        }
    },
    "game": {
        usage: "<name of game>",
        description: "pings channel asking if anyone wants to play",
        process: function(bot,msg,suffix){
            var game = game_abbreviations[suffix];
            if(!game) {
                game = suffix;
            }
            bot.sendMessage(msg.channel, "Anyone up for " + game + "?");
            console.log("sent game invites for " + game);
        }
    },
    "youtube": {
        usage: "<video tags>",
        description: "gets youtube video matching tags",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);
        }
    },	
    "log": {
        usage: "<log message>",
        description: "logs message to bot console",
        process: function(bot,msg,suffix){console.log(msg.content);}
    },
    "reddit": {
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top psot there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss"
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        }
    }
};
try{
var rssFeeds = require("./rss.json");
function loadFeeds(){
    for(var cmd in rssFeeds){
        commands[cmd] = {
            usage: "[count]",
            description: rssFeeds[cmd].description,
            url: rssFeeds[cmd].url,
            process: function(bot,msg,suffix){
                var count = 1;
                if(suffix != null && suffix != "" && !isNaN(suffix)){
                    count = suffix;
                }
                rssfeed(bot,msg,this.url,count,false);
            }
        };
    }
}
} catch(e) {
    console.log("Couldn't load rss.json. See rss.json.example if you want rss feed commands. error: " + e);
}

function rssfeed(bot,msg,url,count,full){
    var FeedParser = require('feedparser');
    var feedparser = new FeedParser();
    var request = require('request');
    request(url).pipe(feedparser);
    feedparser.on('error', function(error){
        bot.sendMessage(msg.channel,"failed reading feed: " + error);
    });
    var shown = 0;
    feedparser.on('readable',function() {
        var stream = this;
        shown += 1
        if(shown > count){
            return;
        }
        var item = stream.read();
        bot.sendMessage(msg.channel,item.title + " - " + item.link, function() {
            if(full === true){
                var text = htmlToText.fromString(item.description,{
                    wordwrap:false,
                    ignoreHref:true
                });
                bot.sendMessage(msg.channel,text);
            }
        });
        stream.alreadyRead = true;
    });
}


var bot = new Discord.Client();

bot.on("ready", function () {
    loadFeeds();
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error
	
});

bot.on("message", function (msg) {
	//check if message is a command
	if(msg.author.id != bot.user.id && (msg.content[0] === '!' || msg.content.indexOf(bot.user.mention()) == 0)){
        console.log("treating " + msg.content + " from " + msg.author + " as command");
		var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) == 0){
            cmdTxt = msg.content.split(" ")[1];
            suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
        }
		var cmd = commands[cmdTxt];
        if(cmdTxt === "gammaagefive"){
            //help is special since it iterates over the other commands
            for(var cmd in commands) {
                var info = "!" + cmd;
                var usage = commands[cmd].usage;
                if(usage){
                    info += " " + usage;
                }
                var description = commands[cmd].description;
                if(description){
                    info += "\n\t" + description;
                }
                bot.sendMessage(msg.channel,info);
            }
        }
		else if(cmd) {
            cmd.process(bot,msg,suffix);
		} else {
			bot.sendMessage(msg.channel, "Invalid command " + cmdTxt);
		}
	} else {
		//message isn't a command or is from us
        //drop our own messages to prevent feedback loops
        if(msg.author == bot.user){
            return;
        }
        
    }
});
 

//Log user status changes
bot.on("presence", function(data) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(data.user+" went "+data.status);
	//}
});

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

        request(config.url + "?" + query, function (error, response, body) {
            //console.log(arguments)
            if (error || response.statusCode !== 200) {
                console.error("giphy: Got error: " + body);
                console.log(error);
                //console.log(response)
            }
            else {
                var responseObj = JSON.parse(body)
                console.log(responseObj.data[0])
                if(responseObj.data.length){
                    func(responseObj.data[0].id);
                } else {
                    func(undefined);
                }
            }
        }.bind(this));
    }

bot.login(AuthDetails.email, AuthDetails.password);
