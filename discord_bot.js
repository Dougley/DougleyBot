/*
========================
	This is a "ping-pong bot"
  Everytime a message matches a command, the bot will respond.
========================
*/

var Discord = require("discord.js");

var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var min = 1;
var max = 671;

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

// Get the email and password
var AuthDetails = require("./auth.json");
var qs = require("querystring");

var htmlToText = require('html-to-text');

var config = {
    "api_key": "dc6zaTOxFJmzC",
    "rating": "r",
    "url": "http://api.giphy.com/v1/gifs/search",
    "permission": ["NORMAL"]
};

/*
========================
Meme ID's

These are the ID's from Imgflip, needed for !meme.
You can fetch more ID's at https://api.imgflip.com/popular_meme_ids
========================
*/
var meme = {
	"brace": 61546,
	"mostinteresting": 61532,
	"fry": 61520,
	"onedoesnot": 61579,
	"yuno": 61527,
	"success": 61544,
	"allthethings": 61533,
	"doge": 8072285,
	"drevil": 40945639,
	"skeptical": 101711,
	"notime": 442575,
	"yodawg": 101716,
	"ermahgerd": 101462,
	"hipsterariel": 86601,
	"imagination": 163573,
	"grumpycat": 405658,
	"morpheus": 100947,
	"1stworldproblems": 61539
};

/*
========================
Game abbreviations.

These are te game abbreviations needed for !game.
========================
*/

var game_abbreviations = {
	"cs": "Counter-Strike",
	"hon": "Heroes of Newerth",
	"hots": "Heroes of the Storm",
	"sc2": "Starcraft II",
	"wf": "Warframe",
	"gtao": "Grand Theft Auto: Online",
	"gta": "Grand Theft Auto",
	"lol": "League of Legends",
	"wow": "World of Warcraft",
	"tf2": "Team Fortress 2",
	"p2": "Portal 2",
	"civ": "Civilization",
	"se": "Space Engineers",
	"cod": "Call of Duty",
    "db": "Dirty Bomb",
    "rs": "RuneScape"

};

var cmdLastExecutedTime = {};

/*
========================
Admin ID's.

Here you can enter the Discord ID's for the operators of the bot.
The ID from the devs (SteamingMutt and Mirrorbreak), is given as a example.
ID's from users can be aquired by starting the bot, and sending !myid to a chat the bot is in.
========================
*/

var admin_ids = ["108125505714139136", "107904023901777920"];

/*
========================
Commands.

These are the commands, as described in the wiki, they can be adjusted to your needs.
None of the commands given here are required for the bot to run.
========================
*/

var commands = {
	"gif": {
		usage: "<image tags>",
        description: "Returns a random gif matching the tags passed.",
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
        description: "Responds pong, useful for checking if bot is alive.",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, msg.sender+" pong!");
            if(suffix){
                bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
            }
        }
    },
    "devs": {
        description: "Prints the devs of DougleyBot to the channel.",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, "Made with love by <@107904023901777920> and <@108125505714139136>. <3");
        }
    },
    "status": {
        description: "Prints the stats from the instance into the chat.",
        process: function(bot, msg, suffix) {
          var msgArray = [];
            msgArray.push("My uptime is " + (Math.round(bot.uptime/(1000*60*60))) + " hours, " + (Math.round(bot.uptime/(1000*60))%60) + " minutes, and " + (Math.round(bot.uptime/1000)%60) + " seconds.");
            msgArray.push("Currently, I'm in " + bot.channels.length + " channels, and in " + bot.servers.length + " servers.");
            msgArray.push("Currently, I'm serving " + bot.users.length + " users.");
            msgArray.push("To Discord, I'm known as " + bot.user + ".");
            bot.sendMessage(msg, msgArray);
        }
    },
    "server-info": {
        description: "Prints the information of the current server.",
        process: function(bot, msg, suffix) {
          // if we're not in a PM, return some info about the channel
	         if (!msg.isPrivate) {
              var msgArray = [];
                msgArray.push("You are currently in " + msg.channel + " (id: " + msg.channel.id + ")");
                msgArray.push("on server **" + msg.channel.server.name + "** (id: " + msg.channel.server.id + ") (region: " + msg.channel.server.region + ")");
                msgArray.push("owned by " + msg.channel.server.owner + " (id: " + msg.channel.server.owner.id + ")");
                if (msg.channel.topic) { msgArray.push("The current topic is: " + msg.channel.topic); }
                bot.sendMessage(msg, msgArray);
              }
	          else{
      	       bot.sendMessage(msg, "This is a DM, There is no info.");
      		}
      	}
      },
    "birds":	{
    	 description: "What are birds?",
    	  process: function(bot,msg)	{
          var msgArray = [];
    		    msgArray.push("https://www.youtube.com/watch?v=Kh0Y2hVe_bw");
    		    msgArray.push("We just don't know");
            bot.sendMessage(msg, msgArray);
    	}
    },
    "game": {
        usage: "<name of game>",
        description: "Pings channel asking if anyone wants to play.",
        process: function(bot,msg,suffix){
            var game = game_abbreviations[suffix];
            if(!game) {
                game = suffix;
            }
            bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
            console.log("sent game invites for " + game);
        }
    },
    "servers": {
        description: "Lists servers bot is connected to.",
        adminOnly: true,
        process: function(bot,msg){bot.sendMessage(msg.channel,bot.servers);}
    },
    "channels": {
        description: "Lists channels bot is connected to.",
        adminOnly: true,
        process: function(bot,msg) { bot.sendMessage(msg.channel,bot.channels);}
    },
    "myid": {
        description: "Returns the user id of the sender.",
        process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);}
    },
    "idle": {
        description: "Sets bot status to idle.",
        adminOnly: true,
        process: function(bot,msg){ bot.setStatusIdle();}
    },
    "killswitch": {
        description: "Kills all running instances of DougleyBot.",
        adminOnly: true,
        process: function(bot,msg){
          bot.sendMessage(msg.channel,"An admin has requested to kill all instances of DougleyBot, exiting...");
            console.log("Disconnected via killswitch!");
            process.exit(0);} //exit node.js without an error
    },
    "online": {
        description: "Sets bot status to online.",
        adminOnly: true,
        process: function(bot,msg){ bot.setStatusOnline();}
    },
    "youtube": {
        usage: "<video tags>",
        description: "Gets a Youtube video matching given tags.",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);
        }
    },
    "say": {
        usage: "<text>",
        description: "Copies text, and repeats it as the bot.",
        process: function(bot,msg,suffix){ bot.sendMessage(msg.channel,suffix,true);}
    },
    "refresh": {
        description: "Refreshes the game status.",
        process: function(bot,msg){
          bot.sendMessage(msg.channel,"I'm refreshing my playing status.");
          bot.setPlayingGame(Math.floor(Math.random() * (max - min)) + min);
            }
        },
    "image": {
        usage: "<image tags>",
        description: "Gets image matching tags from Google.",
        process: function(bot,msg,suffix){ google_image_plugin.respond(suffix,msg.channel,bot);}
    },
    "pullanddeploy": {
        description: "Bot will perform a git pull master and restart with the new code.",
        adminOnly: true,
        process: function(bot,msg,suffix) {
            bot.sendMessage(msg.channel,"fetching updates...",function(error,sentMsg){
                console.log("updating...");
	            var spawn = require('child_process').spawn;
                var log = function(err,stdout,stderr){
                    if(stdout){console.log(stdout);}
                    if(stderr){console.log(stderr);}
                };
                var fetch = spawn('git', ['fetch']);
                fetch.stdout.on('data',function(data){
                    console.log(data.toString());
                });
                fetch.on("close",function(code){
                    var reset = spawn('git', ['reset','--hard','origin/master']);
                    reset.stdout.on('data',function(data){
                        console.log(data.toString());
                    });
                    reset.on("close",function(code){
                        var npm = spawn('npm', ['install']);
                        npm.stdout.on('data',function(data){
                            console.log(data.toString());
                        });
                        npm.on("close",function(code){
                            console.log("goodbye");
                            bot.sendMessage(msg.channel,"brb!",function(){
                                bot.logout(function(){
                                    process.exit();
                                });
                            });
                        });
                    });
                });
            });
        }
    },
    "meme": {
        usage: 'meme "top text" "bottom text"',
        process: function(bot,msg,suffix) {
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            //bot.sendMessage(msg.channel,tags);
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
                //console.log(arguments);
                bot.sendMessage(msg.channel,image);
            });
        }
    },
    "memehelp": { //TODO: this should be handled by !help
        description: "Returns available memes for !meme.",
        process: function(bot,msg) {
            var str = "Currently available memes:\n";
            for (var m in meme){
                str += m + "\n";
            }
            bot.sendMessage(msg.channel,str);
        }
    },
    "log": {
        usage: '<log message>',
        description: 'Logs a message to the console.',
        adminOnly: true,
        process: function(bot, msg, suffix) {
            console.log(msg.content);
        }
    },
    "wiki": {
        usage: "<search terms>",
        description: "Returns the summary of the first matching search result from Wikipedia.",
        timeout: 10, // In seconds
        process: function(bot,msg,suffix) {
            var query = suffix;
            if(!query) {
                bot.sendMessage(msg.channel,"usage: !wiki search terms");
                return;
            }
            var Wiki = require('wikijs');
            new Wiki().search(query,1).then(function(data) {
                new Wiki().page(data.results[0]).then(function(page) {
                    page.summary().then(function(summary) {
                        var sumText = summary.toString().split('\n');
                        var continuation = function() {
                            var paragraph = sumText.shift();
                            if(paragraph){
                                bot.sendMessage(msg.channel,paragraph,continuation);
                            }
                        };
                        continuation();
                    });
                });
            },function(err){
                bot.sendMessage(msg.channel,err);
            });
        }
    },
    "join-server": {
        usage: "<instant-invite>",
        description: "Joins the server it's invited to.",
        process: function(bot,msg,suffix) {
            console.log(bot.joinServer(suffix,function(error,server) {
                console.log("callback: " + arguments);
                if(error){
                    bot.sendMessage(msg.channel,"failed to join: " + error);
                } else {
                    console.log("Joined server " + server);
                    bot.sendMessage(msg.channel,"Successfully joined " + server);
                }
            }));
        }
    },
    "stock": {
        usage: "<stock to fetch>",
        process: function(bot,msg,suffix) {
            var yahooFinance = require('yahoo-finance');
            yahooFinance.snapshot({
              symbol: suffix,
              fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
            }, function (error, snapshot) {
                if(error){
                    bot.sendMessage(msg.channel,"couldn't get stock: " + error);
                } else {
                    //bot.sendMessage(msg.channel,JSON.stringify(snapshot));
                    bot.sendMessage(msg.channel,snapshot.name + "\nprice: $" + snapshot.lastTradePriceOnly);
                }
            });
        }
    },
    "rss": {
        description: "Lists available rss feeds",
        process: function(bot,msg,suffix) {
            /*var args = suffix.split(" ");
            var count = args.shift();
            var url = args.join(" ");
            rssfeed(bot,msg,url,count,full);*/
            bot.sendMessage(msg.channel,"Available feeds:", function(){
                for(var c in rssFeeds){
                    bot.sendMessage(msg.channel,c + ": " + rssFeeds[c].url);
                }
            });
        }
    },
    "reddit": {
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top post there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss";
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        }
    }
};

/*
========================
RRS feed fetcher.

This will fetch the RSS feeds defined in rss.json.
========================
*/

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
                if(suffix !== null && suffix !== "" && !isNaN(suffix)){
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
        shown += 1;
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

/*
========================
When all commands are loaded, start the connection to Discord!
========================
*/

bot.on("ready", function () {
    loadFeeds();
	console.log("Ready to begin! Serving in " + bot.channels.length + " channels");
  bot.setPlayingGame(Math.floor(Math.random() * (max - min)) + min);
});

bot.on("disconnected", function () {

	console.log("Disconnected!");
	process.exit(1); // exit node.js with an error

});
/*
========================
Command interpeter.

This will check if given message will correspond to a command defined in the command variable.
This will work, so long as the bot isn't overloaded or still busy.
========================
*/

bot.on("message", function (msg) {
	// check if message is a command
	if(msg.author.id != bot.user.id && (msg.content[0] === '!' || msg.content.indexOf(bot.user.mention()) === 0)){
        if(msg.author.equals(bot.user)) { return; }
        console.log("treating " + msg.content + " from " + msg.author + " as command");
		var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space

		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
            //help is special since it iterates over the other commands
            bot.sendMessage(msg.channel, msg.sender+", I've send you a list of commands via DM.");
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
                bot.sendMessage(msg.author,info);
            }
        }
		else if(cmd) {
            var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
			if(cmdCheckSpec.isAllow) {
				cmd.process(bot,msg,suffix);
			}
		} else {
			bot.sendMessage(msg.channel, msg.sender+", you've used an invalid command!");
		}
  }
});

/*
========================
Logger for status changes.

This will log the status changes from users who are in the same server as the bot.
The logs will be printed to the console.
It's planned to make logs print to a file, instead of a console print.
========================
*/

//Log user status changes
bot.on("presence", function(data) {
	//if(status === "online"){
	//console.log("presence update");
	console.log(data.user+" went "+data.status);
	//}
});

function isInt(value) {
  return !isNaN(value) &&
         parseInt(Number(value)) == value &&
         !isNaN(parseInt(value, 10));
}

/*
========================
Permission/cooldown checker.

This will check if the user has permission to execute the given command, or if the command is on cooldown.
When there are no permissions, or the command is on cooldown, don't execute the command.
========================
*/

function canProcessCmd(cmd, cmdText, userId, msg) {
	var isAllowResult = true;
	var errorMessage = "";

	if (cmd.hasOwnProperty("timeout")) {
		// check for timeout
		if(cmdLastExecutedTime.hasOwnProperty(cmdText)) {
			var currentDateTime = new Date();
			var lastExecutedTime = new Date(cmdLastExecutedTime[cmdText]);
			lastExecutedTime.setSeconds(lastExecutedTime.getSeconds() + cmd.timeout);

			if(currentDateTime < lastExecutedTime) {
				// still on cooldown
				isAllowResult = false;
				//var diff = (lastExecutedTime-currentDateTime)/1000;
				//errorMessage = diff + " secs remaining";
                bot.sendMessage(msg.channel, msg.sender+", this command is on cooldown!");
			}
			else {
				// update last executed date time
				cmdLastExecutedTime[cmdText] = new Date();
			}
		}
		else {
			// first time executing, add to last executed time
			cmdLastExecutedTime[cmdText] = new Date();
		}
	}

	if (cmd.hasOwnProperty("adminOnly") && cmd.adminOnly && !isAdmin(userId)) {
		isAllowResult = false;
        bot.sendMessage(msg.channel, msg.sender+", you are not allowed to do that!");
	}

	return { isAllow: isAllowResult, errMsg: errorMessage };
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
            query += "&q=" + tags.join('+');
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
                var responseObj = JSON.parse(body);
                console.log(responseObj.data[0]);
                if(responseObj.data.length){
                    func(responseObj.data[0].id);
                } else {
                    func(undefined);
                }
            }
        }.bind(this));
    }

bot.login(AuthDetails.email, AuthDetails.password);
