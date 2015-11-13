var Discord = require("discord.js");
var bot = new Discord.Client();

var yt = require("./youtube_plugin");
var youtube_plugin = new yt();

var gi = require("./google_image_plugin");
var google_image_plugin = new gi();

var htmlToText = require('html-to-text');

var AuthDetails = require("./auth.json");
var qs = require("querystring");

var config = {
	"api_key": "dc6zaTOxFJmzC",
	"rating": "r",
	"url": "http://api.giphy.com/v1/gifs/search",
	"permission": ["NORMAL"]
};

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
	"cod": "Call of Duty"
};

Commands = [];

Commands["gif"] = {
    usage: "<image tags>",
    description: "Returns a random gif matching the tags passed.",
    process: function(bot, msg, suffix) {
        var tags = suffix.split(" ");
        get_gif(tags, function(id) {
            if (typeof id !== "undefined") {
                bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
            } else {
                bot.sendMessage(msg.channel, "Invalid tags, try something different. [Tags: " + (tags ? tags : "Random GIF") + "]");
            }
        });
    }
},
Commands["ping"] = {
    description: "Responds pong, useful for checking if bot is alive.",
    process: function(bot, msg, suffix) {
        bot.sendMessage(msg.channel, msg.sender + " pong!");
        if (suffix) {
            bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
        }
    }
},
Commands["birds"] = {
    description: "What are birds?",
    process: function(bot, msg) {
        bot.sendMessage(msg.channel, "https://www.youtube.com/watch?v=Kh0Y2hVe_bw")
        bot.sendMessage(msg.channel, "We just don't know")
    }
},
Commands["game"] = {
    usage: "<name of game>",
    description: "Pings channel asking if anyone wants to play.",
    process: function(bot, msg, suffix) {
        var game = game_abbreviations[suffix];
        if (!game) {
            game = suffix;
        }
        bot.sendMessage(msg.channel, "@everyone Anyone up for " + game + "?");
        console.log("sent game invites for " + game);
    }
},
Commands["servers"] = {
    description: "Lists servers bot is connected to.",
    adminOnly: true,
    process: function(bot, msg) {
        bot.sendMessage(msg.channel, bot.servers);
    }
},
Commands["channels"] = {
    description: "Lists channels bot is connected to.",
    adminOnly: true,
    process: function(bot, msg) {
        bot.sendMessage(msg.channel, bot.channels);
    }
},
Commands["myid"] = {
    description: "Returns the user id of the sender.",
    process: function(bot, msg) {
        bot.sendMessage(msg.channel, msg.author.id);
    }
},
Commands["idle"] = {
    description: "Sets bot status to idle.",
    adminOnly: true,
    process: function(bot, msg) {
        bot.setStatusIdle();
    }
},
Commands["killswitch"] = {
    description: "Kills all running instances of DougleyBot.",
    adminOnly: true,
    process: function(bot, msg) {
            bot.sendMessage(msg.channel, "An admin has requested to kill all instances of DougleyBot, exiting...");
            console.log("Disconnected via killswitch!");
            process.exit(0);
        } //exit node.js without an error
},
Commands["online"] = {
    description: "Sets bot status to online.",
    adminOnly: true,
    process: function(bot, msg) {
        bot.setStatusOnline();
    }
},
Commands["youtube"] = {
    usage: "<video tags>",
    description: "Gets a Youtube video matching given tags.",
    process: function(bot, msg, suffix) {
        youtube_plugin.respond(suffix, msg.channel, bot);
    }
},
Commands["say"] = {
    usage: "<text>",
    description: "Copies text, and repeats it as the bot.",
    process: function(bot, msg, suffix) {
        bot.sendMessage(msg.channel, suffix, true);
    }
},
Commands["image"] = {
    usage: "<image tags>",
    description: "Gets image matching tags from Google.",
    process: function(bot, msg, suffix) {
        google_image_plugin.respond(suffix, msg.channel, bot);
    }
},
Commands["pullanddeploy"] = {
    description: "Bot will perform a git pull master and restart with the new code.",
    adminOnly: true,
    process: function(bot, msg, suffix) {
        bot.sendMessage(msg.channel, "fetching updates...", function(error, sentMsg) {
            console.log("updating...");
            var spawn = require('child_process').spawn;
            var log = function(err, stdout, stderr) {
                if (stdout) {
                    console.log(stdout);
                }
                if (stderr) {
                    console.log(stderr);
                }
            };
            var fetch = spawn('git', ['fetch']);
            fetch.stdout.on('data', function(data) {
                console.log(data.toString());
            });
            fetch.on("close", function(code) {
                var reset = spawn('git', ['reset', '--hard', 'origin/master']);
                reset.stdout.on('data', function(data) {
                    console.log(data.toString());
                });
                reset.on("close", function(code) {
                    var npm = spawn('npm', ['install']);
                    npm.stdout.on('data', function(data) {
                        console.log(data.toString());
                    });
                    npm.on("close", function(code) {
                        console.log("goodbye");
                        bot.sendMessage(msg.channel, "brb!", function() {
                            bot.logout(function() {
                                process.exit();
                            });
                        });
                    });
                });
            });
        });
    }
},
Commands["meme"] = {
    usage: 'meme "top text" "bottom text"',
    process: function(bot, msg, suffix) {
        var tags = msg.content.split('"');
        var memetype = tags[0].split(" ")[1];
        //bot.sendMessage(msg.channel,tags);
        var Imgflipper = require("imgflipper");
        var imgflipper = new Imgflipper(AuthDetails.imgflip_username, AuthDetails.imgflip_password);
        imgflipper.generateMeme(meme[memetype], tags[1] ? tags[1] : "", tags[3] ? tags[3] : "", function(err, image) {
            //console.log(arguments);
            bot.sendMessage(msg.channel, image);
        });
    }
},
Commands["memehelp"] = { //TODO: this should be handled by !help
    description: "Returns available memes for !meme.",
    process: function(bot, msg) {
        var str = "Currently available memes:\n"
        for (var m in meme) {
            str += m + "\n"
        }
        bot.sendMessage(msg.channel, str);
    }
},
Commands["log"] = {
    usage: '<log message>',
    description: 'Logs a message to the console.',
    adminOnly: true,
    process: function(bot, msg, suffix) {
        console.log(msg.content);
    }
},
Commands["wiki"] = {
    usage: "<search terms>",
    description: "Returns the summary of the first matching search result from Wikipedia.",
    timeout: 10, // In seconds
    process: function(bot, msg, suffix) {
        var query = suffix;
        if (!query) {
            bot.sendMessage(msg.channel, "usage: !wiki search terms");
            return;
        }
        var Wiki = require('wikijs');
        new Wiki().search(query, 1).then(function(data) {
            new Wiki().page(data.results[0]).then(function(page) {
                page.summary().then(function(summary) {
                    var sumText = summary.toString().split('\n');
                    var continuation = function() {
                        var paragraph = sumText.shift();
                        if (paragraph) {
                            bot.sendMessage(msg.channel, paragraph, continuation);
                        }
                    };
                    continuation();
                });
            });
        }, function(err) {
            bot.sendMessage(msg.channel, err);
        });
    }
},
Commands["join-server"] = {
    usage: "<instant-invite>",
    description: "Joins the server it's invited to.",
    process: function(bot, msg, suffix) {
        console.log(bot.joinServer(suffix, function(error, server) {
            console.log("callback: " + arguments);
            if (error) {
                bot.sendMessage(msg.channel, "failed to join: " + error);
            } else {
                console.log("Joined server " + server);
                bot.sendMessage(msg.channel, "Successfully joined " + server);
            }
        }));
    }
},
Commands["stock"] = {
    usage: "<stock to fetch>",
    process: function(bot, msg, suffix) {
        var yahooFinance = require('yahoo-finance');
        yahooFinance.snapshot({
            symbol: suffix,
            fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
        }, function(error, snapshot) {
            if (error) {
                bot.sendMessage(msg.channel, "couldn't get stock: " + error);
            } else {
                //bot.sendMessage(msg.channel,JSON.stringify(snapshot));
                bot.sendMessage(msg.channel, snapshot.name + "\nprice: $" + snapshot.lastTradePriceOnly);
            }
        });
    }
},
Commands["rss"] = {
    description: "Lists available rss feeds",
    process: function(bot, msg, suffix) {
        /*var args = suffix.split(" ");
        var count = args.shift();
        var url = args.join(" ");
        rssfeed(bot,msg,url,count,full);*/
        bot.sendMessage(msg.channel, "Available feeds:", function() {
            for (var c in rssFeeds) {
                bot.sendMessage(msg.channel, c + ": " + rssFeeds[c].url);
            }
        });
    }
},
Commands["reddit"] = {
    usage: "[subreddit]",
    description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top post there instead",
    process: function(bot, msg, suffix) {
        var path = "/.rss"
        if (suffix) {
            path = "/r/" + suffix + path;
        }
        rssfeed(bot, msg, "https://www.reddit.com" + path, 1, false);
    }
},
Commands["help"] = {
    process: function(bot, msg) {
    bot.sendMessage(msg.channel, msg.sender + ", I've send you a list of commands via DM.");
    for (var cmd in Commands) {
        var info = "!" + cmd;
        var usage = Commands[cmd].usage;
        if (usage) {
            info += " " + usage;
        }
        var description = Commands[cmd].description;
        if (description) {
            info += "\n\t" + description;
        }
        bot.sendMessage(msg.author, info);
    }
}
}
exports.Commands = Commands;