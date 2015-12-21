/*
========================
	This is a "ping-pong bot"
  Everytime a message matches a command, the bot will respond.
========================
*/
var VersionChecker = require("./runtime/versioncheck");

var Cleverbot = require('cleverbot-node');
var cleverbot = new Cleverbot();

var ChatLog = require("./runtime/logger.js").ChatLog;
var CmdErrorLog = require("./runtime/logger.js").CmdErrorLog;

var maintenance;

var version = require("./package.json").version;

var Discord = require("discord.js");

var yt = require("./runtime/youtube_plugin");
var youtube_plugin = new yt();

var min = 1;
var max = 671;

var cmdPrefix = require("./config.json").command_prefix;

var aliases;

//Allowed send file types for !iff
var ext = [".jpg", ".jpeg", ".gif", ".png"];
var imgDirectory = require("./config.json").image_folder;

// Get the email and password
var ConfigFile = require("./config.json");
var qs = require("querystring");

var htmlToText = require('html-to-text');

var config = {
  "api_key": "dc6zaTOxFJmzC",
  "rating": "r",
  "url": "http://api.giphy.com/v1/gifs/search",
  "permission": ["NORMAL"]
};

var meme = require("./runtime/memes.json");

var game_abbreviations = require("./runtime/abbreviations.json");

var cmdLastExecutedTime = {};

var admin_ids = require("./config.json").admin_ids;

/*
========================
Commands.

These are the commands, as described in the wiki, they can be adjusted to your needs.
None of the commands given here are required for the bot to run.
========================
*/

var commands = {
  "gif": {
    name: "gif",
    description: "Returns a random gif matching the tags passed.",
    extendedhelp: "I will search Giphy for a gif matching your tags.",
    usage: "<image tags>",
    process: function(bot, msg, suffix) {
      var tags = suffix.split(" ");
      get_gif(tags, function(id) {
        if (typeof id !== "undefined") {
          bot.sendMessage(msg.channel, "http://media.giphy.com/media/" + id + "/giphy.gif [Tags: " + (tags ? tags : "Random GIF") + "]");
        } else {
          bot.sendMessage(msg.channel, "Invalid tags, try something different. For example, something that exists [Tags: " + (tags ? tags : "Random GIF") + "]");
        }
      });
    }
  },
  "maintenance-mode": {
    name: "maintenance-mode",
    description: "Enables maintenance mode.",
    extendedhelp: "This will disable my command interpeter for a given amount of seconds, making me inable to execute commands.",
    usage: "<time-in-seconds>",
    adminOnly: true,
    process: function(bot, msg, suffix) {
      CmdErrorLog.log("warn", "Maintenance mode activated for " + suffix + " seconds.");
      bot.sendMessage(msg.channel, "The bot is now in maintenance mode, commands **will NOT** work!");
      bot.setPlayingGame(525);
      bot.setStatusIdle();
      maintenance = "true";
      setTimeout(continueExecution, Math.round(suffix * 1000));

      function continueExecution() {
        CmdErrorLog.log("info", "Maintenance ended.");
        bot.sendMessage(msg.channel, "Maintenance period ended, returning to normal.");
        bot.setPlayingGame(308);
        bot.setStatusOnline();
        maintenance = null;
      }
    }
  },
  "ping": {
    name: "ping",
    description: "Responds pong, useful for checking if bot is alive.",
    extendedhelp: "I'll reply to you with ping, this way you can see if I'm still able to take commands.",
    process: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, " " + msg.sender + " pong!");
      if (suffix) {
        bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
      }
    }
  },
  "setgame": {
    name: "setgame",
    description: "Sets the playing status to a specified game.",
    extendedhelp: "This will change my playing status to a given game ID, you can check for a list of game ID's at the wiki of DougleyBot.",
    usage: "<game-id>",
    process: function(bot, msg, suffix) {
      bot.setPlayingGame(suffix);
      CmdErrorLog.log("debug", "The playing status has been changed to " + suffix + " by " + msg.sender.username);
    }
  },
  "cleverbot": {
    name: "cleverbot",
    description: "Talk to Cleverbot!",
    extendedhelp: "I'll act as Cleverbot when you execute this command, remember to enter a message as suffix.",
    usage: "<message>",
    process: function(bot, msg, suffix) {
      Cleverbot.prepare(function() {
        bot.startTyping(msg.channel);
        cleverbot.write(suffix, function(response) {
          bot.sendMessage(msg.channel, response.message);
          bot.stopTyping(msg.channel);
        });
      });
    }
  },
  "devs": {
    name: "devs",
    description: "Prints the devs of DougleyBot to the channel.",
    extendedhelp: "This will print the Discord ID's from the developers of DougleyBot to the channel.",
    process: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, "Made with love by <@107904023901777920> and <@108125505714139136>. <3 <@110147170740494336> did stuff too.");
    }
  },
  "status": {
    name: "status",
    description: "Prints the stats from the instance into the chat.",
    extendedhelp: "This will print some information about the instance of the bot to the channel, like uptime and currently connected users.",
    process: function(bot, msg, suffix) {
      var msgArray = [];
      msgArray.push("My uptime is " + (Math.round(bot.uptime / (1000 * 60 * 60))) + " hours, " + (Math.round(bot.uptime / (1000 * 60)) % 60) + " minutes, and " + (Math.round(bot.uptime / 1000) % 60) + " seconds.");
      msgArray.push("Currently, I'm in " + bot.servers.length + " servers, and in " + bot.channels.length + " channels.");
      msgArray.push("Currently, I'm serving " + bot.users.length + " users.");
      msgArray.push("To Discord, I'm known as " + bot.user + ", and I'm running DougleyBot version " + version);
      CmdErrorLog.log("debug", msg.sender.username + " requested the bot status.");
      bot.sendMessage(msg, msgArray);
    }
  },
  "hello": {
    name: "hello",
    description: "Gives a friendly greeting, including github link.",
    extendedhelp: "I'll respond to you with hello along with a GitHub link, handy!",
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, "Hello " + msg.sender + "! I'm " + bot.user.username + ", help me grow by contributing to my GitHub: https://github.com/SteamingMutt/DougleyBot");
    }
  },
  "server-info": {
    name: "server-info",
    description: "Prints the information of the current server.",
    extendedhelp: "I'll tell you some information about the server and the channel you're currently in.",
    process: function(bot, msg, suffix) {
      // if we're not in a PM, return some info about the channel
      if (msg.channel.server) {
        var msgArray = [];
        msgArray.push("You are currently in " + msg.channel + " (id: " + msg.channel.id + ")");
        msgArray.push("on server **" + msg.channel.server.name + "** (id: " + msg.channel.server.id + ") (region: " + msg.channel.server.region + ")");
        msgArray.push("owned by " + msg.channel.server.owner + " (id: " + msg.channel.server.owner.id + ")");
        if (msg.channel.topic) {
          msgArray.push("The current topic is: " + msg.channel.topic);
        }
        bot.sendMessage(msg, msgArray);
      } else {
        bot.sendMessage(msg, "This is a DM, there is no info.");
      }
    }
  },
  "birds": {
    name: "birds",
    description: "What are birds?",
    extendedhelp: "The best stale meme evahr, IDST.",
    process: function(bot, msg) {
      var msgArray = [];
      msgArray.push("https://www.youtube.com/watch?v=Kh0Y2hVe_bw");
      msgArray.push("We just don't know");
      bot.sendMessage(msg, msgArray);
    }
  },
  "game": {
    name: "game",
    description: "Pings channel asking if anyone wants to play.",
    extendedhelp: "I'll ask the channel you're currently in if they want to play the game you provide me, try some abbreviations, some might work!",
    usage: "<name of game>",
    process: function(bot, msg, suffix) {
      var game = game_abbreviations[suffix];
      if (!game) {
        game = suffix;
      }
      bot.sendMessage(msg.channel, "@everyone, " + msg.sender + " would like to know if anyone is up for " + game);
      CmdErrorLog.log("debug", "Sent game invites for " + game);
    }
  },
  "servers": {
    name: "servers",
    description: "Lists servers bot is connected to.",
    extendedhelp: "This will list all the servers I'm currently connected to, but if I'm in a lot of servers, don't expect a response.",
    adminOnly: true,
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, bot.servers);
    }
  },
  "channels": {
    name: "channels",
    description: "Lists channels bot is connected to.",
    extendedhelp: "This will list all the channels I'm currently connected to, but if I'm in a lot of channels, don't expect a response.",
    adminOnly: true,
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, bot.channels);
    }
  },
  "myid": {
    name: "myid",
    description: "Returns the user id of the sender.",
    extendedhelp: "This will print your Discord ID to the channel, useful if you want to define admins in your own instance.",
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, msg.author.id);
    }
  },
  "idle": {
    name: "idle",
    description: "Sets bot status to idle.",
    extendedhelp: "This will change my status to idle.",
    adminOnly: true,
    process: function(bot, msg) {
      bot.setStatusIdle();
      CmdErrorLog.log("debug", "My status has been changed to idle.");
    }
  },
  "killswitch": {
    name: "killswitch",
    description: "Kills all running instances of DougleyBot.",
    extendedhelp: "This will instantly terminate all of the running instances of the bot without restarting.",
    adminOnly: true,
    process: function(bot, msg) {
        bot.sendMessage(msg.channel, "An admin has requested to kill all instances of DougleyBot, exiting...");
        CmdErrorLog.log("warn", "Disconnected via killswitch!");
        process.exit(0);
      } //exit node.js without an error
  },
  "addmeme": {
	  name: "addmeme",
	  description: "Adds a meme.",
	  adminOnly: true,
	  extendedhelp: "Type !addmeme followed by text to add that text to the memelist.", //Just uses memes.txt in root folder.
	  process: function(bot, msg, suffix) {
		  var fs = require ("fs");
<<<<<<< HEAD
		  fs.appendFile('memes.txt', suffix + " ~END\n", function(err) {
=======
		  fs.appendFile('memes.txt', suffix + "\n", function(err) {
>>>>>>> refs/remotes/SteamingMutt/master
		  });
		  bot.sendMessage(msg.channel, "Added '" + suffix + "' as a meme.");
	  }
  },
 "saymeme":{
    name: "saymeme",
    description: "Say a meme",
    extendedhelp: "Makes the bot say a random meme from the meme list",
    process: function(bot, msg) {
        var fs = require ("fs");
        fs.readFile('memes.txt', "utf8", function(err, fileContents) {
<<<<<<< HEAD
          var lines = fileContents.split(" ~END\n");
=======
          var lines = fileContents.split("\n");
>>>>>>> refs/remotes/SteamingMutt/master
          bot.sendMessage(msg.channel, lines[Math.floor(Math.random()*lines.length) -1]);
        });
    }
  },
  "purge": {
    name: "purge",
    usage: "<number-of-messages-to-delete>",
    extendedhelp: "I'll delete a certain ammount of messages.",
    process: function(bot, msg, suffix) {
      if (msg.isPrivate) {
      return;
      }
      if (!msg.channel.permissionsOf(msg.sender).hasPermission("manageMessages")) {
        bot.sendMessage(msg.channel, "Sorry, your permissions doesn't allow that.");
        return;
      }
      if (!msg.channel.permissionsOf(bot.user).hasPermission("manageMessages")) {
        bot.sendMessage(msg.channel, "I don't have permission to do that!");
        return;
      }
      bot.getChannelLogs(msg.channel, suffix, function(error, messages){
        if (error){
          bot.sendMessage(msg.channel, "Something went wrong while fetching logs.");
          return;
        } else {
          CmdErrorLog.info("Beginning purge...");
          var todo = messages.length,
          delcount = 0;
          for (msg of messages){
            bot.deleteMessage(msg);
            todo--;
            delcount++;
          if (todo === 0){
            bot.sendMessage(msg.channel, "Done! Deleted " + delcount + " messages.");
            CmdErrorLog.info("Ending purge");
            return;
            }}
          }
        }
    );}},
  "kappa": {
    name: "kappa",
    description: "Kappa all day long!",
    extendedhelp: "KappaKappaKappaKappaKappaKappaKappaKappaKappaKappa",
    process: function(bot, msg, suffix) {
      bot.sendFile(msg.channel, "./images/kappa.png");
      if (!msg.channel.server){return;}
      var bot_permissions = msg.channel.permissionsOf(bot.user);
      if (bot_permissions.hasPermission("manageMessages")) {
        bot.deleteMessage(msg);
        return;
      } else {
        bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
      }
    }
  },
  "iff": {
    name: "iff",
    description: "Send an image from the ./images/ directory!",
    extendedhelp: "I'll send an image from the image directory to the chat.",
    usage: "[image name] -ext",
    process: function(bot, msg, suffix) {
      var fs = require("fs");
      var path = require("path");
      var imgArray = [];
      fs.readdir(imgDirectory, function(err, dirContents) {
        for (var i = 0; i < dirContents.length; i++) {
          for (var o = 0; o < ext.length; o++) {
            if (path.extname(dirContents[i]) === ext[o]) {
              imgArray.push(dirContents[i]);
            }
          }
        }
        if (imgArray.indexOf(suffix) !== -1) {
          bot.sendFile(msg.channel, "./images/" + suffix);
          if (!msg.channel.server){return;}
          var bot_permissions = msg.channel.permissionsOf(bot.user);
          if (bot_permissions.hasPermission("manageMessages")) {
            bot.deleteMessage(msg);
            return;
          } else {
            bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
          }
        } else {
          bot.sendMessage(msg.channel, "*Invalid input!*");
        }
      });
    }
  },
  "imglist": {
    name: "imglist",
    description: "List's ./images/ dir!",
    extendedhelp: "I'll list the images in the images directory for you, use them with the " + ConfigFile.command_prefix + "iff command!",
    process: function(bot, msg, suffix) {
      var fs = require("fs");
      var path = require("path");
      var imgArray = [];
      fs.readdir(imgDirectory, function(err, dirContents) {
        for (var i = 0; i < dirContents.length; i++) {
          for (var o = 0; o < ext.length; o++) {
            if (path.extname(dirContents[i]) === ext[o]) {
              imgArray.push(dirContents[i]);
            }
          }
        }
        bot.sendMessage(msg.channel, imgArray);
      });
    }
  },
  "leave": {
    name: "leave",
    description: "Asks the bot to leave the current server.",
    extendedhelp: "I'll leave the server in which the command is executed, you'll need the *Manage server* permission in your role to use this command.",
    process: function(bot, msg, suffix) {
      if (msg.channel.server) {
        if (msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")) {
          bot.sendMessage(msg.channel, "Alright, see ya!");
          bot.leaveServer(msg.channel.server);
          CmdErrorLog.log("info", "I've left a server on request of " + msg.sender.username + ", I'm only in " + bot.servers.length + " servers now.");
          return;
        } else {
          bot.sendMessage(msg.channel, "Can't tell me what to do. (Your role in this server needs the permission to manage the server to use this command.)");
          CmdErrorLog.log("warn", "A non-privileged user (" + msg.sender.username + ") tried to make me leave a server.");
          return;
        }
      } else {
        bot.sendMessage(msg.channel, "I can't leave a DM, dummy!");
        return;
      }
    }
  },
  "online": {
    name: "online",
    description: "Sets bot status to online.",
    extendedhelp: "I'll change my status to online.",
    adminOnly: true,
    process: function(bot, msg) {
      bot.setStatusOnline();
      CmdErrorLog.log("debug", "My status has been changed to online.");
    }
  },
  "youtube": {
    name: "youtube",
    description: "Gets a Youtube video matching given tags.",
    extendedhelp: "I'll search YouTube for a video matching your given tags.",
    usage: "<video tags>",
    process: function(bot, msg, suffix) {
      youtube_plugin.respond(suffix, msg.channel, bot);
    }
  },
  "say": {
    name: "say",
    description: "Copies text, and repeats it as the bot.",
    extendedhelp: "I'll echo the suffix of the command to the channel and, if I have sufficient permissions, deletes the command.",
    usage: "<text>",
    process: function(bot, msg, suffix) {
      var bot_permissions = msg.channel.permissionsOf(bot.user);
      if (suffix.search("!say") === -1) {
//        bot.sendMessage(msg.channel, suffix, true + "-" + msg.author);
//        This line makes no sense... it appears there is an attempt to add "-"+msg.author to the suffix, and true is supposed to enable the boolean /tts function. This command is useless if it adds the msg.author, so I'll just fix tts for now now lol
          bot.sendMessage(msg.channel, suffix);
        if (!msg.channel.server){return;}
        if (bot_permissions.hasPermission("manageMessages")) {
          bot.deleteMessage(msg);
          return;
        } else {
          bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
        }
      } else {
        bot.sendMessage(msg.channel, "HEY " + msg.sender + " STOP THAT!", {tts:"true"});
      }
    }
  },
  "tts": {
    name: "tts",
    description: "Same as say, tts",
    extendedhelp: "SAAAAMMMEEE ASSSS SAAAAYYYYY, TTS",
    usage: "<text>",
    process: function(bot, msg, suffix) {
      var bot_permissions = msg.channel.permissionsOf(bot.user);
      if (suffix.search("!say") === -1) {
          bot.sendMessage(msg.channel, suffix, {tts:"true"});
        if (!msg.channel.server){return;}
        if (bot_permissions.hasPermission("manageMessages")) {
          bot.deleteMessage(msg);
          return;
        } else {
          bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
        }
      } else {
        bot.sendMessage(msg.channel, "HEY " + msg.sender + " STOP THAT!", {tts:"true"});
      }
    }
  },
  "dankquote": {
    name: "dankquote",
    description: "Makes a dank quote and says it as the bot.",
    extendedhelp: "Makes a dank quote and says it as the bot. This is the extended version, it is longer.",
    usage: "<text>",
    process: function(bot, msg, suffix) {
      var bot_permissions = msg.channel.permissionsOf(bot.user);
      if (suffix.search("!say") === -1) {
        var d = new Date();
          bot.sendMessage(msg.channel,'"' + suffix + '"' + ' -' + msg.author + ' ' + d.getFullYear(), {tts:"true"});
        if (!msg.channel.server){return;}
        if (bot_permissions.hasPermission("manageMessages")) {
          bot.deleteMessage(msg);
          return;
        } else {
          bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
        }
      } else {
        bot.sendMessage(msg.channel, "HEY " + msg.sender + " STOP THAT!", {tts:"true"});
      }
    }
  },
  "refresh": {
    name: "refresh",
    description: "Refreshes the game status.",
    extendedhelp: "I'll refresh my playing status to a new random game!",
    process: function(bot, msg) {
      bot.sendMessage(msg.channel, "I'm refreshing my playing status.");
      bot.setPlayingGame(Math.floor(Math.random() * (max - min)) + min);
      CmdErrorLog.log("debug", "The playing status has been refreshed");
    }
  },
  "image": {
    name: "image",
    description: "Gets image matching tags from Google.",
    extendedhelp: "I'll search teh interwebz for a picture matching your tags.",
    usage: "<image tags>",
    process: function(bot, msg, suffix) {
      if(!ConfigFile || !ConfigFile.youtube_api_key || !ConfigFile.google_custom_search){
      			bot.sendMessage(msg.channel, "Image search requires both a YouTube API key and a Google Custom Search key!");
      			return;
      		}
      		//gets us a random result in first 5 pages
      		var page = 1 + Math.floor(Math.random() * 5) * 10; //we request 10 items
          var request = require("request");
      		request("https://www.googleapis.com/customsearch/v1?key=" + ConfigFile.youtube_api_key + "&cx=" + ConfigFile.google_custom_search + "&q=" + (suffix.replace(/\s/g, '+')) + "&searchType=image&alt=json&num=10&start="+page, function(err, res, body) {
      			var data, error;
      			try {
      				data = JSON.parse(body);
      			} catch (error) {
      				CmdErrorLog.error(error);
      				return;
      			}
      			if(!data){
      				CmdErrorLog.debug(data);
      				bot.sendMessage(msg.channel, "Error:\n" + JSON.stringify(data));
      				return;
      			}
      			else if (!data.items || data.items.length === 0){
      				CmdErrorLog.debug(data);
      				bot.sendMessage(msg.channel, "No result for '" + suffix + "'");
      				return;
      			}
      			var randResult = data.items[Math.floor(Math.random() * data.items.length)];
      			bot.sendMessage(msg.channel, randResult.title + '\n' + randResult.link);
      		});
      CmdErrorLog.log("debug", "I've looked for images of " + suffix + " for " + msg.sender.username);
  }},
  "pullanddeploy": {
    name: "pullanddeploy",
    description: "Bot will perform a git pull master and restart with the new code.",
    extendedhelp: "I'll check if my code is up-to-date with the code from <@107904023901777920>, and restart. **Please note that this does NOT work on Windows!**",
    adminOnly: true,
    process: function(bot, msg, suffix) {
      bot.sendMessage(msg.channel, "Fetching updates...", function(error, sentMsg) {
        CmdErrorLog.log("info", "Updating...");
        var spawn = require('child_process').spawn;
        var log = function(err, stdout, stderr) {
          if (stdout) {
            CmdErrorLog.log("debug", stdout);
          }
          if (stderr) {
            CmdErrorLog.log("debug", stderr);
          }
        };
        var fetch = spawn('git', ['fetch']);
        fetch.stdout.on('data', function(data) {
          CmdErrorLog("debug", data.toString());
        });
        fetch.on("close", function(code) {
          var reset = spawn('git', ['reset', '--hard', 'origin/master']);
          reset.stdout.on('data', function(data) {
            CmdErrorLog.log("debug", data.toString());
          });
          reset.on("close", function(code) {
            var npm = spawn('npm', ['install']);
            npm.stdout.on('data', function(data) {
              CmdErrorLog.log("debug", data.toString());
            });
            npm.on("close", function(code) {
              CmdErrorLog.log("info", "Goodbye");
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
  "meme": {
    name: "meme",
    extendedhelp: "I'll create a meme with your suffixes!",
    usage: 'memetype "top text" "bottom text"',
    process: function(bot, msg, suffix) {
      var tags = msg.content.split('"');
      var memetype = tags[0].split(" ")[1];
      //bot.sendMessage(msg.channel,tags);
      var Imgflipper = require("imgflipper");
      var imgflipper = new Imgflipper(ConfigFile.imgflip_username, ConfigFile.imgflip_password);
      imgflipper.generateMeme(meme[memetype], tags[1] ? tags[1] : "", tags[3] ? tags[3] : "", function(err, image) {
        //CmdErrorLog.log("debug", arguments);
        bot.sendMessage(msg.channel, image);
        if (!msg.channel.server){return;}
        var bot_permissions = msg.channel.permissionsOf(bot.user);
        if (bot_permissions.hasPermission("manageMessages")) {
          bot.deleteMessage(msg);
          return;
        } else {
          bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
        }
      });
    }
  },
  "log": {
    name: "log",
    description: 'Logs a message to the console.',
    extendedhelp: "I'll log your message to the console.",
    usage: '<log message>',
    adminOnly: true,
    process: function(bot, msg, suffix) {
      CmdErrorLog.log("debug", msg.content);
    }
  },
  "whois": {
    name: "whois",
    description: "Gets info of a user.",
    extendedhelp: "I'll fetch some info about the user you've mentioned.",
    usage: '<user-mention>',
    process: function(bot, msg, suffix) {
      if (!msg.channel.server) {
        bot.sendMessage(msg.author, "I can't do that in a DM, sorry.");
        return;
      }
      if (msg.mentions.length === 0) {
        bot.sendMessage(msg.channel, "Please mention the user that you want to get information of.");
        return;
      }
      msg.mentions.map(function(user) {
        var msgArray = [];
        if (user.avatarURL === null) {
          msgArray.push("Requested user: `" + user.username + "`");
          msgArray.push("ID: `" + user.id + "`");
          msgArray.push("Status: `" + user.status + "`");
          bot.sendMessage(msg.channel, msgArray);
          return;
        } else {
          msgArray.push("Requested user: `" + user.username + "`");
          msgArray.push("ID: `" + user.id + "`");
          msgArray.push("Status: `" + user.status + "`");
          msgArray.push("Avatar: " + user.avatarURL);
          bot.sendMessage(msg.channel, msgArray);
        }
      });
    }
  },
  "wiki": {
    name: "wiki",
    description: "Returns the summary of the first matching search result from Wikipedia.",
    extendedhelp: "I'll search Wikipedia for your requested subject, and return my finds.",
    usage: "<search terms>",
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
                bot.sendMessage(msg.channel, paragraph);
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
  "join-server": {
    name: "join-server",
    description: "Joins the server it's invited to.",
    extendedhelp: "I'll join the server you've requested me to join, as long as the invite is valid and I'm not banned of already in the requested server.",
    usage: "<bot-username> <instant-invite>",
    process: function(bot, msg, suffix) {
      suffix = suffix.split(" ");
      if (suffix[0] === bot.user.username) {
        CmdErrorLog.log("debug", bot.joinServer(suffix[1], function(error, server) {
          CmdErrorLog.log("debug", "callback: " + arguments);
          if (error) {
            CmdErrorLog.warn("Failed to join a server: " + error);
            bot.sendMessage(msg.channel, "Something went wrong, try again.");
          } else {
            var msgArray = [];
            msgArray.push("Yo! I'm **" + bot.user.username + "**, " + msg.author + " invited me to this server.");
            msgArray.push("If I'm intended to be in this server, you may use **" + ConfigFile.command_prefix + "help** to see what I can do!");
            msgArray.push("If you don't want me here, you may use **" + ConfigFile.command_prefix + "leave** to ask me to leave.");
            bot.sendMessage(server.defaultChannel, msgArray);
            msgArray = [];
            msgArray.push("Hey " + server.owner.username + ", I've joined a server in which you're the founder.");
            msgArray.push("I'm " + bot.user.username + " by the way, a Discord bot, meaning that all of the things I do are mostly automated.");
            msgArray.push("If you are not keen on having me in your server, you may use `" + ConfigFile.command_prefix + "leave` in the server I'm not welcome in.");
            msgArray.push("If you do want me, use `" + ConfigFile.command_prefix + "help` to see what I can do.");
            bot.sendMessage(server.owner, msgArray);
            bot.sendMessage(msg.channel, "I've successfully joined **" + server.name + "**");
          }
        }));
      } else {
        CmdErrorLog.log("debug", "Ignoring join command meant for another bot.");
      }
    }
  },
  "stock": {
    name: "stock",
    extendedhelp: "I'll search Yahoo! Finance for the price of the stock you've given me.",
    usage: "<stockticker>",
    process: function(bot, msg, suffix) {
      var yahooFinance = require('yahoo-finance');
      yahooFinance.snapshot({
        symbol: suffix,
        fields: ['s', 'n', 'd1', 'l1', 'y', 'r'],
      }, function(error, snapshot) {
        if (error) {
          bot.sendMessage(msg.channel, "couldn't get stock, it's behind lock, also, it's boorriiinngg: " + error);
        } else {
          //bot.sendMessage(msg.channel,JSON.stringify(snapshot));
          bot.sendMessage(msg.channel, snapshot.name + "\nprice: $" + snapshot.lastTradePriceOnly);
        }
      });
    }
  },
  "rss": {
    name: "rss",
    extendedhelp: "I'll list all of the avalible RSS feeds, just for you.",
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
  "reddit": {
    name: "reddit",
    description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top post there instead",
    extendedhelp: "I'll fetch the top post from the top page of Reddit, and return the link, you can enter a specific subreddit as suffix and I'll post the first post from that subreddit.",
    usage: "[subreddit]",
    process: function(bot, msg, suffix) {
      var path = "/.rss";
      if (suffix) {
        path = "/r/" + suffix + path;
      }
      rssfeed(bot, msg, "https://www.reddit.com" + path, 1, false);
    }
  },
  "stroke": {
    name: "stroke",
    description: "Stroke someone's ego, best to use first and last name or split the name!",
    extendedhelp: "I'll stroke someones ego, how nice of me.",
    usage: "[First name][, [Last name]]",
    process: function(bot, msg, suffix) {
      var name;
      if (suffix) {
        name = suffix.split(" ");
        if (name.length === 1) {
          name = ["", name];
        }
      } else {
        name = ["Perpetu", "Cake"];
      }
      var request = require('request');
      request('http://api.icndb.com/jokes/random?escape=javascript&firstName=' + name[0] + '&lastName=' + name[1], function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var joke = JSON.parse(body);
          bot.sendMessage(msg.channel, joke.value.joke);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "yomomma": {
    name: "yomomma",
    description: "Returns a random Yo momma joke.",
    extendedhelp: "I'll get a random yo momma joke for you.",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://api.yomomma.info/', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var yomomma = JSON.parse(body);
          bot.sendMessage(msg.channel, yomomma.joke);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "advice": {
    name: "advice",
    description: "Gives you good advice!",
    extendedhelp: "I'll give you some great advice, I'm just too kind.",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://api.adviceslip.com/advice', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var advice = JSON.parse(body);
          bot.sendMessage(msg.channel, advice.slip.advice);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "yesno": {
    name: "yesno",
    description: "Answer yes or no with a gif (or randomly choose one!)",
    extendedhelp: "Ever wanted a gif displaying your (dis)agreement? Then look no further!",
    usage: "optional: [force yes/no/maybe]",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://yesno.wtf/api/?force=' + suffix, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var yesNo = JSON.parse(body);
          bot.sendMessage(msg.channel, msg.sender + " " + yesNo.image);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "urbandictionary": {
    name: "urbandictionary",
    description: "Search Urban Dictionary, one of the original AIDS of the internet!",
    extendedhelp: "Every wanted to know what idiots on the internet thinks something means? Here ya go!",
    usage: "[string]",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://api.urbandictionary.com/v0/define?term=' + suffix, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var uD = JSON.parse(body);
          if (uD.result_type !== "no_results") {
            bot.sendMessage(msg.channel, suffix + ": " + uD.list[0].definition + ' "' + uD.list[0].example + '"');
          } else {
            bot.sendMessage(msg.channel, suffix + ": This is so screwed up, even Urban Dictionary doesn't have it in it's database");
          }
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "xkcd": {
    name: "xkcd",
    description: "Returns a random (or chosen) xkcd comic",
    extendedhelp: "I'll get a XKCD comic for you, you can define a comic number and I'll fetch that one.",
    usage: "[current, or comic number]",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://xkcd.com/info.0.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var xkcdInfo = JSON.parse(body);
          if (suffix) {
            var isnum = /^\d+$/.test(suffix);
            if (isnum) {
              if ([suffix] < xkcdInfo.num) {
                request('http://xkcd.com/' + suffix + '/info.0.json', function(error, response, body) {
                  if (!error && response.statusCode == 200) {
                    xkcdInfo = JSON.parse(body);
                    bot.sendMessage(msg.channel, xkcdInfo.img);
                  } else {
                    CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
                  }
                });
              } else {
                bot.sendMessage(msg.channel, "There are only " + xkcdInfo.num + " xkcd comics!");
              }
            } else {
              bot.sendMessage(msg.channel, xkcdInfo.img);
            }
          } else {
            var xkcdRandom = Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
            request('http://xkcd.com/' + xkcdRandom + '/info.0.json', function(error, response, body) {
              if (!error && response.statusCode == 200) {
                xkcdInfo = JSON.parse(body);
                bot.sendMessage(msg.channel, xkcdInfo.img);
              } else {
                CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
              }
            });
          }

        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "8ball": {
    name: "8ball",
    description: "Makes executive decisions super easy!",
    extendedhelp: "I'll function as an magic 8 ball for a bit and anwser all of your questions! (So long as you enter the questions as suffixes.)",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('https://8ball.delegator.com/magic/JSON/0', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var eightBall = JSON.parse(body);
          bot.sendMessage(msg.channel, eightBall.magic.answer + ", " + msg.sender);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "catfacts": {
    name: "catfacts",
    description: "Returns cool facts about cats!",
    extendedhelp: "I'll give you some interresting facts about cats!",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://catfacts-api.appspot.com/api/facts', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var catFact = JSON.parse(body);
          bot.sendMessage(msg.channel, catFact.facts[0]);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "fact": {
    name: "fact",
    description: "Returns a random fact!",
    extendedhelp: "I'll give you some interresting facts!",
    process: function(bot, msg, suffix) {
      var request = require('request');
      var xml2js = require('xml2js');
      request("http://www.fayd.org/api/fact.xml", function(error, response, body) {
        if (!error && response.statusCode == 200) {
          //CmdErrorLog.log("debug", body)
          xml2js.parseString(body, function(err, result) {
            bot.sendMessage(msg.channel, result.facts.fact[0]);
          });
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "csgoprice": {
    name: "csgoprice",
    description: "Gives the price of a CSGO skin. Very picky regarding capitalization and punctuation.",
    extendedhelp: "I'll give you the price of a CS:GO skin.",
    usage: '[weapon "AK-47"] [skin "Vulcan"] [[wear "Factory New"] [stattrak "(boolean)"]] Quotes are important!',
    process: function(bot, msg, suffix) {
      skinInfo = suffix.split('"');
      var csgomarket = require('csgo-market');
      csgomarket.getSinglePrice(skinInfo[1], skinInfo[3], skinInfo[5], skinInfo[7], function(err, skinData) {
        if (err) {
          CmdErrorLog.log('error', err);
          bot.sendMessage(msg.channel, "That skin is so super secret rare, it doesn't even exist!");
        } else {
          if (skinData.success === true) {
            if (skinData.stattrak) {
              skinData.stattrak = "Stattrak";
            } else {
              skinData.stattrak = "";
            }
            var msgArray = ["Weapon: " + skinData.wep + " " + skinData.skin + " " + skinData.wear + " " + skinData.stattrak, "Lowest Price: " + skinData.lowest_price, "Number Available: " + skinData.volume, "Median Price: " + skinData.median_price, ];
            bot.sendMessage(msg.channel, msgArray);
          }
        }
      });
    }
  },
  "dice": {
    name: "dice",
    description: "Dice roller yay!",
    extendedhelp: "I'll roll some dice for you, handy!",
    usage: "[numberofdice]d[sidesofdice]",
    process: function(bot, msg, suffix) {
      var dice;
      if (suffix) {
        dice = suffix;
      } else {
        dice = "d6";
      }
      var request = require('request');
      request('https://rolz.org/api/?' + dice + '.json', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var roll = JSON.parse(body);
          bot.sendMessage(msg.channel, "Your " + roll.input + " resulted in " + roll.result + " " + roll.details);
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "imdb": {
    name: "imdb",
    description: "Returns information for an IMDB title",
    extendedhelp: "I'll search through IMDb for a movie matching your given tags, and post my finds in the channel.",
    usage: "[title]",
    process: function(bot, msg, suffix) {
      if (suffix) {
        var request = require('request');
        request('http://api.myapifilms.com/imdb/title?format=json&title=' + suffix + '&token=' + ConfigFile.myapifilms_token, function(error, response, body) {
          if (!error && response.statusCode == 200) {
            var imdbInfo = JSON.parse(body);
            imdbInfo = imdbInfo.data.movies[0];
            if (imdbInfo) {
              //Date snatching
              var y = imdbInfo.releaseDate.substr(0, 4),
                m = imdbInfo.releaseDate.substr(4, 2),
                d = imdbInfo.releaseDate.substr(6, 2);
              var msgArray = [imdbInfo.title, imdbInfo.plot, " ", "Released on: " + m + "/" + d + "/" + y, "Rated: " + imdbInfo.rated+ imdbInfo.rating + "/10"];
              var sendArray = [imdbInfo.urlIMDB, msgArray];
              for (var i = 0; i < sendArray.length; i++) {
                bot.sendMessage(msg.channel, sendArray[i]);
              }
            } else {
              bot.sendMessage(msg.channel, "Search for " + suffix + " failed!");
            }
          } else {
            CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      } else {
        bot.sendMessage(msg.channel, "Usage: !imdb [title]");
      }
    }
  },
  "fancyinsult": {
    name: "fancyinsult",
    description: "Insult your friends, in style.",
    extendedhelp: "I'll insult your friends, in style.",
    process: function(bot, msg, suffix) {
      var request = require('request');
      request('http://quandyfactory.com/insult/json/', function(error, response, body) {
        if (!error && response.statusCode == 200) {
          var fancyinsult = JSON.parse(body);
          if (suffix === "") {
            bot.sendMessage(msg.channel, fancyinsult.insult);
            bot.deleteMessage(msg);
          } else {
            bot.sendMessage(msg.channel, suffix + ", " + fancyinsult.insult);
            bot.deleteMessage(msg);
          }
        } else {
          CmdErrorLog.log("warn", "Got an error: ", error, ", status code: ", response.statusCode);
        }
      });
    }
  },
  "alias": {
    name: "alias",
    description: "Creates command aliases. Useful for making simple commands on the fly",
    extendedhelp: "I'll create a alias for a command.",
    usage: "<aliasname> <actual command> (without cmdPrefix)",
    adminOnly: true,
    process: function(bot, msg, suffix) {
      var args = suffix.split(" ");
      var name = args.shift();
      if (!name) {
        bot.sendMessage(msg.channel, cmdPrefix + "alias " + this.usage + "\n" + this.description);
      } else if (commands[name] || name === "help") {
        bot.sendMessage(msg.channel, "overwriting commands with aliases is not allowed!");
      } else {
        var command = args.shift();
        aliases[name] = [command, args.join(" ")];
        //now save the new alias
        require("fs").writeFile("./alias.json", JSON.stringify(aliases, null, 2), null);
        bot.sendMessage(msg.channel, "created alias " + name);
      }
    }
  }
};

/*
========================
RRS feed fetcher.

This will fetch the RSS feeds defined in rss.json.
========================
*/

try {
  var rssFeeds = require("./runtime/rss.json");

  function loadFeeds() {
    for (var cmd in rssFeeds) {
      commands[cmd] = {
        usage: "[count]",
        description: rssFeeds[cmd].description,
        url: rssFeeds[cmd].url,
        process: function(bot, msg, suffix) {
          var count = 1;
          if (suffix !== null && suffix !== "" && !isNaN(suffix)) {
            count = suffix;
          }
          rssfeed(bot, msg, this.url, count, false);
        }
      };
    }
  }
} catch (e) {
  CmdErrorLog.log("warn", "Couldn't load rss.json. See rss.json.example if you want rss feed commands. " + e);
}

try {
  aliases = require("./alias.json");
} catch (e) {
  //No aliases defined
  aliases = {};
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
    shown += 1;
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

/*
========================
When all commands are loaded, start the connection to Discord!
========================
*/

bot.on("ready", function() {
  loadFeeds();
  bot.joinServer(ConfigFile.join_servers_on_startup);
  CmdErrorLog.log("info", "I've joined the servers defined in my config file.");
  CmdErrorLog.log("info", "Ready to begin! Serving in " + bot.channels.length + " channels");
  bot.setPlayingGame(Math.floor(Math.random() * (max - min)) + min);
});

bot.on("disconnected", function() {

  CmdErrorLog.log("error", "Disconnected!");
  process.exit(1); // exit node.js with an error

});
/*
========================
Command interpeter.

This will check if given message will correspond to a command defined in the command variable.
This will work, so long as the bot isn't overloaded or still busy.
========================
*/
bot.on("message", function(msg) {
  if (ConfigFile.log_chat === true && msg.channel.server) { // Note that this is programmed to NOT log DM's.
    var d = new Date();
    var n = d.toUTCString();
    ChatLog.log("info", n + ": " + msg.channel.server.name + ", " + msg.channel.name + ": " + msg.author.username + " said <" + msg + ">");
  }
  if (msg.author == bot.user) {
    return;
  }
  // check if message is a command
  if (msg.author.id != bot.user.id && (msg.content[0] === cmdPrefix)) {
    if (msg.author.equals(bot.user)) {
      return;
    }
    if (maintenance == "true") {
      bot.sendMessage(msg.channel, "Hey " + msg.sender + ", I'm in maintenance mode, I can't take commands right now.");
      return;
    }
    CmdErrorLog.log("info", msg.author.username + " executed <" + msg.content + ">");
    var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
    var suffix = msg.content.substring(cmdTxt.length + 2); //add one for the ! and one for the space

    alias = aliases[cmdTxt];
    if (alias) {
      cmdTxt = alias[0];
      suffix = alias[1] + " " + suffix;
    }

    var cmd = commands[cmdTxt];
    if (cmdTxt === "help") { // Help is special, as it isn't a real 'command'
      var msgArray = []; // Build a Messsage array, this makes all the messages send as one.
      var commandnames = []; // Build a array of names from commands.
      for (cmd in commands) {
        var info = cmdPrefix + cmd;
        var usage = commands[cmd].usage;
        if (usage) {
          info += " " + usage;
        }
        var description = commands[cmd].description;
        if (description) {
          info += "\n\t" + description;
        }
      }
      if (!suffix) {
        for (index in commands) {
          commandnames.push(commands[index].name);
        }
        msgArray.push("These are the currently avalible commands, use `" + cmdPrefix + "help <command_name>` to learn more about a specific command.");
        msgArray.push("");
        msgArray.push(commandnames.join(", "));
        msgArray.push("");
        msgArray.push("If you have any questions, or if you don't get something, contact <@107904023901777920> or <@110147170740494336>");
        bot.sendMessage(msg.author, msgArray);
        if (msg.channel.server) {
          bot.sendMessage(msg.channel, "Ok " + msg.sender + ", I've send you a list of commands via DM.");
        }
      }
      if (suffix) {
        if (commands[suffix]) { // Look if suffix corresponds to a command
          var commando = commands[suffix]; // Make a varialbe for easier calls
          msgArray = []; // Build another message array
          msgArray.push("**Command:** `" + commando.name + "`"); // Push the name of the command to the array
          msgArray.push(""); // Leave a whiteline for readability
          if (commando.hasOwnProperty("usage")) { // Push special message if command needs a suffix.
            msgArray.push("**Usage:** `" + ConfigFile.command_prefix + commando.name + " " + commando.usage + "`");
          } else {
            msgArray.push("**Usage:** `" + ConfigFile.command_prefix + commando.name + "`");
          }
          msgArray.push("**Description:** " + commando.extendedhelp); // Push the extendedhelp to the array.
          if (commando.hasOwnProperty("adminOnly")) { // Push special message if command is restricted.
            msgArray.push("**This command is restricted to admins.**");
          }
          if (commando.hasOwnProperty("timeout")) { // Push special message if command has a cooldown
            msgArray.push("**This command has a cooldown of " + commando.timeout + " seconds.**");
          }
          if (suffix == "meme") { // If command requested is meme, print avalible meme's
            msgArray.push("");
            var str = "**Currently available memes:\n**";
            for (var m in meme) {
              str += m + ", ";
            }
            msgArray.push(str);
          }
          bot.sendMessage(msg.author, msgArray); // Send the array to the user
        } else {
          bot.sendMessage(msg.channel, "There is no **" + suffix + "** command!");
        }
      }
    } else if (cmd) {
      var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
      if (cmdCheckSpec.isAllow) {
        cmd.process(bot, msg, suffix);
      }
    }
  }
});


/*
========================
Logger for status changes.

Feature disabled for being unneeded.
========================


//Log user status changes
bot.on("presence", function(data) {
	//if(status === "online"){
	//ChatLog.log("info", "presence update");
	ChatLog.log("info", data.user+" went "+data.status);
	//}
});

function isInt(value) {
  return !isNaN(value) &&
         parseInt(Number(value)) == value &&
         !isNaN(parseInt(value, 10));
}
*/

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
    if (cmdLastExecutedTime.hasOwnProperty(cmdText)) {
      var currentDateTime = new Date();
      var lastExecutedTime = new Date(cmdLastExecutedTime[cmdText]);
      lastExecutedTime.setSeconds(lastExecutedTime.getSeconds() + cmd.timeout);

      if (currentDateTime < lastExecutedTime) {
        // still on cooldown
        isAllowResult = false;
        //var diff = (lastExecutedTime-currentDateTime)/1000;
        //errorMessage = diff + " secs remaining";
        bot.sendMessage(msg.channel, "Hey " + msg.sender + ", this command is on cooldown!");
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
    bot.sendMessage(msg.channel, "Hey " + msg.sender + ", you are not allowed to do that!");
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
    query += "&q=" + tags.join('+');
  }

  //wouldnt see request lib if defined at the top for some reason:\
  var request = require("request");
  //CmdErrorLog.log("debug", query)

  request(config.url + "?" + query, function(error, response, body) {
    //CmdErrorLog.log("debug", arguments)
    if (error || response.statusCode !== 200) {
      CmdErrorLog.log("error", "giphy: Got error: " + body);
      CmdErrorLog("error", error);
      //CmdErrorLog.log("debug", response)
    } else {
      var responseObj = JSON.parse(body);
      CmdErrorLog.log("debug", responseObj.data[0]);
      if (responseObj.data.length) {
        func(responseObj.data[0].id);
      } else {
        func(undefined);
      }
    }
  }.bind(this));
}

function init(){
  CmdErrorLog.log("info", "Initializing...");
  CmdErrorLog.log("info", "Checking for updates...");
  VersionChecker.getStatus(function(err, status) {
    if (err) {
      error(err);
    } // error handle
    if (status && status !== "failed") {
      CmdErrorLog.log("info", status);
    }
  });
}

bot.login(ConfigFile.discord_email, ConfigFile.discord_password).then(init);
