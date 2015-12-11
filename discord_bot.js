/*
========================
	This is a "ping-pong bot"
  Everytime a message matches a command, the bot will respond.
========================
*/
var VersionChecker	= require("./runtime/versioncheck");

var Cleverbot = require('cleverbot-node');
var cleverbot = new Cleverbot();

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
var ext = [".jpg",".jpeg",".gif",".png"];
var imgDirectory = require("./config.json").image_folder;


var gi = require("./runtime/google_image_plugin");
var google_image_plugin = new gi();

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
		usage: "<image tags>",
    name: "gif",
    description: "Returns a random gif matching the tags passed.",
    extendedhelp: "I will search Giphy for a gif matching your tags.",
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
    "maintenance-mode": {
        adminOnly: true,
        name: "maintenance-mode",
        description: "Enables maintenance mode.",
        extendedhelp: "This will disable my command interpeter for a given amount of seconds, making me inable to execute commands.",
        usage: "<time-in-seconds>",
        process: function(bot,msg,suffix){
            console.log("Maintenance mode activated for " + suffix + " seconds.");
            bot.sendMessage(msg.channel, "The bot is now in maintenance mode, commands **will NOT** work!" );
            bot.setPlayingGame(525);
            bot.setStatusIdle();
            maintenance = "true";
            setTimeout(continueExecution, Math.round(suffix * 1000));
            function continueExecution(){
              console.log("Maintenance ended.");
              bot.sendMessage(msg.channel, "Maintenance period ended, returning to normal.");
              bot.setPlayingGame(308);
              bot.setStatusOnline();
              maintenance = null;
            }
        }
    },
    "ping": {
        description: "Responds pong, useful for checking if bot is alive.",
        name: "ping",
        extendedhelp: "I'll reply to you with ping, this way you can see if I'm still able to take commands.",
        process: function(bot, msg, suffix) {
            bot.sendMessage(msg.channel, " "+msg.sender+" pong!");
            if(suffix){
                bot.sendMessage(msg.channel, "note that !ping takes no arguments!");
            }
        }
    },
    "setgame": {
        description: "Sets the playing status to a specified game.",
        name: "setgame",
        extendedhelp: "This will change my playing status to a given game ID, you can check for a list of game ID's at the wiki of DougleyBot.",
        usage: "<game-id>",
        process: function(bot, msg, suffix) {
            bot.setPlayingGame(suffix);
            console.log("The playing status has been changed to " + suffix + " by " + msg.sender.username);
        }
    },
    "cleverbot": {
        description: "Talk to Cleverbot!",
        name: "cleverbot",
        usage: "<message>",
        extendedhelp: "I'll act as Cleverbot when you execute this command, remember to enter a message as suffix.",
        process: function(bot, msg, suffix) {
          Cleverbot.prepare(function(){
            bot.startTyping(msg.channel);
                cleverbot.write(suffix, function (response) {
                     bot.sendMessage(msg.channel, response.message);
                     bot.stopTyping(msg.channel);
                   }
                 );
               }
             );
           }
    },
    "devs": {
        description: "Prints the devs of DougleyBot to the channel.",
        name: "devs",
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
            msgArray.push("My uptime is " + (Math.round(bot.uptime/(1000*60*60))) + " hours, " + (Math.round(bot.uptime/(1000*60))%60) + " minutes, and " + (Math.round(bot.uptime/1000)%60) + " seconds.");
            msgArray.push("Currently, I'm in " + bot.servers.length + " servers, and in " + bot.channels.length + " channels.");
            msgArray.push("Currently, I'm serving " + bot.users.length + " users.");
            msgArray.push("To Discord, I'm known as " + bot.user + ", and I'm running DougleyBot version " + version);
            console.log(msg.sender.username + " requested the bot status.");
            bot.sendMessage(msg, msgArray);
        }
    },
   "hello": {
        name: "hello",
        description: "Gives a friendly greeting, including github link.",
        extendedhelp: "I'll respond to you with hello along with a GitHub link, handy!",
        process: function(bot, msg) {
            bot.sendMessage(msg.channel, "Hello "+msg.sender+"! I'm " + bot.user.username + ", help me grow by contributing to my GitHub: https://github.com/SteamingMutt/DougleyBot");
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
                if (msg.channel.topic) { msgArray.push("The current topic is: " + msg.channel.topic); }
                bot.sendMessage(msg, msgArray);
              }
      		else{
      			bot.sendMessage(msg, "This is a DM, there is no info.");
      		}
      	}
      },
    "birds":	{
      name: "birds",
    	 description: "What are birds?",
       extendedhelp: "The best stale meme evahr, IDST.",
    	  process: function(bot,msg)	{
          var msgArray = [];
    		    msgArray.push("https://www.youtube.com/watch?v=Kh0Y2hVe_bw");
    		    msgArray.push("We just don't know");
            bot.sendMessage(msg, msgArray);
    	}
    },
    "game": {
        name: "game",
        usage: "<name of game>",
        description: "Pings channel asking if anyone wants to play.",
        extendedhelp: "I'll ask the channel you're currently in if they want to play the game you provide me, try some abbreviations, some might work!",
        process: function(bot,msg,suffix){
            var game = game_abbreviations[suffix];
            if(!game) {
                game = suffix;
            }
            bot.sendMessage(msg.channel, "@everyone, " + msg.sender + " would like to know if anyone is up for " + game);
            console.log("Sent game invites for " + game);
        }
    },
    "servers": {
        name: "servers",
        description: "Lists servers bot is connected to.",
        extendedhelp: "This will list all the servers I'm currently connected to, but if I'm in a lot of servers, don't expect a response.",
        adminOnly: true,
        process: function(bot,msg){bot.sendMessage(msg.channel,bot.servers);}
    },
    "channels": {
        name: "channels",
        description: "Lists channels bot is connected to.",
        extendedhelp: "This will list all the channels I'm currently connected to, but if I'm in a lot of channels, don't expect a response.",
        adminOnly: true,
        process: function(bot,msg) { bot.sendMessage(msg.channel,bot.channels);}
    },
    "myid": {
        name: "myid",
        description: "Returns the user id of the sender.",
        extendedhelp: "This will print your Discord ID to the channel, useful if you want to define admins in your own instance.",
        process: function(bot,msg){bot.sendMessage(msg.channel,msg.author.id);}
    },
    "idle": {
        name: "idle",
        description: "Sets bot status to idle.",
        extendedhelp: "This will change my status to idle.",
        adminOnly: true,
        process: function(bot,msg){
          bot.setStatusIdle();
          console.log("My status has been changed to idle.");
        }
    },
    "killswitch": {
        name: "killswitch",
        description: "Kills all running instances of DougleyBot.",
        extendedhelp: "This will instantly terminate all of the running instances of the bot without restarting.",
        adminOnly: true,
        process: function(bot,msg){
          bot.sendMessage(msg.channel,"An admin has requested to kill all instances of DougleyBot, exiting...");
            console.log("Disconnected via killswitch!");
            process.exit(0);} //exit node.js without an error
    },
    "kappa": {
        name: "kappa",
        description: "Kappa all day long!",
        extendedhelp: "KappaKappaKappaKappaKappaKappaKappaKappaKappaKappa",
        process: function(bot, msg, suffix) {
          bot.sendFile(msg.channel, "./images/kappa.png");
          var bot_permissions = msg.channel.permissionsOf(bot.user);
          if (bot_permissions.hasPermission("manageMessages")){
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
        usage: "[image name] -ext",
        extendedhelp: "I'll send an image from the image directory to the chat.",
        process: function(bot, msg, suffix) {
          var fs = require("fs");
          var path = require("path");
          var imgArray = [];
          fs.readdir(imgDirectory, function(err, dirContents) {
                  for (var i = 0; i < dirContents.length; i++){
                    for (var o = 0; o < ext.length; o++){
                      if (path.extname(dirContents[i]) === ext[o]){
                        imgArray.push(dirContents[i]);
                      }
                    }
                  }
                  if (imgArray.indexOf(suffix) !== -1){
                  bot.sendFile(msg.channel, "./images/"+suffix);
                  var bot_permissions = msg.channel.permissionsOf(bot.user);
                  if (bot_permissions.hasPermission("manageMessages")){
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
                  for (var i = 0; i < dirContents.length; i++){
                    for (var o = 0; o < ext.length; o++){
                      if (path.extname(dirContents[i]) === ext[o]){
                        imgArray.push(dirContents[i]);
                      }
                    }
                  }
                  bot.sendMessage(msg.channel,imgArray);
          });
      }
    },
    "leave": {
        description: "Asks the bot to leave the current server.",
        name: "leave",
        extendedhelp: "I'll leave the server in which the command is executed, you'll need the *Manage server* permission in your role to use this command.",
        process: function(bot, msg, suffix) {
          if (msg.channel.server) {
            if (msg.channel.permissionsOf(msg.sender).hasPermission("manageServer")){
              bot.sendMessage(msg.channel, "Alright, see ya!");
              bot.leaveServer(msg.channel.server);
              console.log("I've left a server on request of " + msg.sender.username + ", I'm only in " + bot.servers.length + " servers now.");
              return;
            } else {
              bot.sendMessage(msg.channel, "Can't tell me what to do. (Your role in this server needs the permission to manage the server to use this command.)");
              console.log("A non-privileged user (" + msg.sender.username + ") tried to make me leave a server.");
              return;
          }} else {
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
        process: function(bot,msg){
          bot.setStatusOnline();
          console.log("My status has been changed to online.");
        }
    },
    "youtube": {
        name: "youtube",
        usage: "<video tags>",
        description: "Gets a Youtube video matching given tags.",
        extendedhelp: "I'll search YouTube for a video matching your given tags.",
        process: function(bot,msg,suffix){
            youtube_plugin.respond(suffix,msg.channel,bot);
        }
    },
    "say": {
        name: "say",
        usage: "<text>",
        extendedhelp: "I'll echo the suffix of the command to the channel and, if I have sufficient permissions, deletes the command.",
        description: "Copies text, and repeats it as the bot.",
        process: function(bot,msg,suffix){
              var bot_permissions = msg.channel.permissionsOf(bot.user);
              if (suffix.search("!say") === -1){
                bot.sendMessage(msg.channel,suffix,true);
                   if (bot_permissions.hasPermission("manageMessages")){
                     bot.deleteMessage(msg);
                     return;
                 } else {
                  bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
            }} else {
                bot.sendMessage(msg.channel,"HEY "+msg.sender+" STOP THAT!",true);
              }
            }
        },
    "refresh": {
        name: "refresh",
        extendedhelp: "I'll refresh my playing status to a new random game!",
        description: "Refreshes the game status.",
        process: function(bot,msg){
          bot.sendMessage(msg.channel,"I'm refreshing my playing status.");
          bot.setPlayingGame(Math.floor(Math.random() * (max - min)) + min);
          console.log("The playing status has been refreshed");
            }
        },
    "image": {
        name: "image",
        extendedhelp: "I'll search teh interwebz for a picture matching your tags.",
        usage: "<image tags>",
        description: "Gets image matching tags from Google.",
        process: function(bot,msg,suffix){
           google_image_plugin.respond(suffix,msg.channel,bot);
           console.log("I've looked for images of " + suffix + " for " + msg.sender.username);
         }
    },
    "pullanddeploy": {
        name: "pullanddeploy",
        extendedhelp: "I'll check if my code is up-to-date with the code from <@107904023901777920>, and restart. **Please note that this does NOT work on Windows!**",
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
        name: "meme",
        extendedhelp: "I'll create a meme with your suffixes!",
        usage: 'memetype "top text" "bottom text"',
        process: function(bot,msg,suffix) {
            var tags = msg.content.split('"');
            var memetype = tags[0].split(" ")[1];
            //bot.sendMessage(msg.channel,tags);
            var Imgflipper = require("imgflipper");
            var imgflipper = new Imgflipper(ConfigFile.imgflip_username, ConfigFile.imgflip_password);
            imgflipper.generateMeme(meme[memetype], tags[1]?tags[1]:"", tags[3]?tags[3]:"", function(err, image){
                //console.log(arguments);
                bot.sendMessage(msg.channel,image);
                var bot_permissions = msg.channel.permissionsOf(bot.user);
                if (bot_permissions.hasPermission("manageMessages")){
                  bot.deleteMessage(msg);
                  return;
              } else {
               bot.sendMessage(msg.channel, "*This works best when I have the permission to delete messages!*");
            }});
        }
    },
    "log": {
        usage: '<log message>',
        name: "log",
        extendedhelp: "I'll log your message to the console.",
        description: 'Logs a message to the console.',
        adminOnly: true,
        process: function(bot, msg, suffix) {
            console.log(msg.content);
        }
    },
    "wiki": {
        name: "wiki",
        extendedhelp: "I'll search Wikipedia for your requested subject, and return my finds.",
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
        name: "join-server",
        extendedhelp: "I'll join the server you've requested me to join, as long as the invite is valid and I'm not banned of already in the requested server.",
        usage: "<bot-username> <instant-invite>",
        description: "Joins the server it's invited to.",
        process: function(bot,msg,suffix) {
          suffix = suffix.split(" ");
          if (suffix[0] === bot.user.username) {
            console.log(bot.joinServer(suffix[1],function(error,server) {
                console.log("callback: " + arguments);
                if(error){
                    bot.sendMessage(msg.channel,"failed to join: " + error);
                } else {
                    console.log("Joined server " + server);
                    bot.sendMessage(msg.channel,"Successfully joined " + server);
                }
            }));
          } else {console.log("Ignoring join command meant for another bot.");}
        }
    },
    "stock": {
        name: "stock",
        extendedhelp: "I'll search Yahoo! Finance for the price of the stock you've given me.",
        usage: "<stockticker>",
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
        name: "rss",
        extendedhelp: "I'll list all of the avalible RSS feeds, just for you.",
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
        name: "reddit",
        extendedhelp: "I'll fetch the top post from the top page of Reddit, and return the link, you can enter a specific subreddit as suffix and I'll post the first post from that subreddit.",
        usage: "[subreddit]",
        description: "Returns the top post on reddit. Can optionally pass a subreddit to get the top post there instead",
        process: function(bot,msg,suffix) {
            var path = "/.rss";
            if(suffix){
                path = "/r/"+suffix+path;
            }
            rssfeed(bot,msg,"https://www.reddit.com"+path,1,false);
        }
    },
    "stroke": {
      name: "stroke",
      extendedhelp: "I'll stroke someones ego, how nice of me.",
      usage: "[First name][, [Last name]]",
      description: "Stroke someone's ego, best to use first and last name or split the name!",
      process: function(bot,msg,suffix) {
        var name;
        if (suffix){
        name = suffix.split(" ");
          if (name.length === 1) {name = ["",name];}
      } else {name = ["Perpetu","Cake"];}
        var request = require('request');
        request('http://api.icndb.com/jokes/random?escape=javascript&firstName='+name[0]+'&lastName='+name[1], function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var joke = JSON.parse(body);
            bot.sendMessage(msg.channel,joke.value.joke);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "yomomma": {
      description: "Returns a random Yo momma joke.",
      name: "yomomma",
      extendedhelp: "I'll get a random yo momma joke for you.",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://api.yomomma.info/', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var yomomma = JSON.parse(body);
            bot.sendMessage(msg.channel,yomomma.joke);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "advice": {
      name: "advice",
      extendedhelp: "I'll give you some great advice, I'm just too kind.",
      description: "Gives you good advice!",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://api.adviceslip.com/advice', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var advice = JSON.parse(body);
            bot.sendMessage(msg.channel,advice.slip.advice);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "yesno": {
      name: "yesno",
      extendedhelp: "Ever wanted a gif displaying your (dis)agreement? Then look no further!",
      description: "Answer yes or no with a gif (or randomly choose one!)",
      usage :"optional: [force yes/no/maybe]",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://yesno.wtf/api/?force='+suffix, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var yesNo = JSON.parse(body);
            bot.sendMessage(msg.channel,msg.sender+" "+yesNo.image);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "rule34": {
      description: "Rule#34 : If it exists there is porn of it. If not, start uploading.",
      process: function(bot,msg,suffix) {
        var request = require('request');
        var xml2js = require('xml2js');
        var url = "http://rule34.xxx/index.php?page=dapi&s=post&limit=1&q=index&tags="+suffix;
        request(url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //console.log(body)
            xml2js.parseString(body, function (err, result) {
              var util = require('util');
              //console.log(result)
              //console.log("1")
              //console.log(util.inspect(result, false, null))
              //console.log("2")
              //console.log(util.inspect(result["posts"], false, null))
              var fuckme = util.inspect(result.posts,false,null).split("'");
              //console.log(fuckme[14])
              bot.sendMessage(msg.channel,fuckme[13]);
              //console.log("3")
              //console.log(util.inspect(result["posts"["post"]], false, null))
              //console.log("4")
              //console.log(util.inspect(result["posts"["post"[1["'$'"]]]], false, null))

              //result = JSON.parse(result)
              //console.log(result)
              //bot.sendMessage(msg.channel,result.file_url)
                                        }
                                   );
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        }
      );
      }
    },
    "navy":    {
         description: "What are seals?",
          process: function(bot,msg)    {
            bot.sendMessage(msg, "What the fuck did you just fucking say about me, you little bitch? I’ll have you know I graduated top of my class in the Navy Seals, and I’ve been involved in numerous secret raids on Al-Quaeda, and I have over 300 confirmed kills. I am trained in gorilla warfare and I’m the top sniper in the entire US armed forces. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of spies across the USA and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You’re fucking dead, kid. I can be anywhere, anytime, and I can kill you in over seven hundred ways, and that’s just with my bare hands. Not only am I extensively trained in unarmed combat, but I have access to the entire arsenal of the United States Marine Corps and I will use it to its full extent to wipe your miserable ass off the face of the continent, you little shit. If only you could have known what unholy retribution your little “clever” comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn’t, you didn’t, and now you’re paying the price, you goddamn idiot. I will shit fury all over you and you will drown in it. You’re fucking dead, kiddo.");
        }
    },
    "urbandictionary": {
      name: "urbandictionary",
      extendedhelp: "Every wanted to know what idiots on the internet thinks something means? Here ya go!",
      description: "Search Urban Dictionary, one of the original AIDS of the internet!",
      usage :"[string]",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://api.urbandictionary.com/v0/define?term='+suffix, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var uD = JSON.parse(body);
            if (uD.result_type !== "no_results") {
            bot.sendMessage(msg.channel,suffix+": "+uD.list[0].definition+' "'+uD.list[0].example+'"');
          } else {
            bot.sendMessage(msg.channel,suffix+": No results");
          }
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    //This command needs cleaning. Very badly. But it works well, so whatever. <3 xkcd
    "xkcd": {
      name: "xkcd",
      extendedhelp: "I'll get a XKCD comic for you, you can define a comic number and I'll fetch that one.",
      description: "Returns a random (or chosen) xkcd comic",
      usage :"[current, or comic number]",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://xkcd.com/info.0.json', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var xkcdInfo = JSON.parse(body);
              if (suffix) {
                var isnum = /^\d+$/.test(suffix);
                if (isnum) {
                  if ([suffix] < xkcdInfo.num){
                  request('http://xkcd.com/'+suffix+'/info.0.json', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      xkcdInfo = JSON.parse(body);
                      bot.sendMessage(msg.channel,xkcdInfo.img);
                    } else {
                      console.log("Got an error: ", error, ", status code: ", response.statusCode);
                    }
                  });
                } else {bot.sendMessage(msg.channel,"There are only "+xkcdInfo.num+" xkcd comics!");}
              } else {
                bot.sendMessage(msg.channel,xkcdInfo.img);
              }
              } else {
                var xkcdRandom = Math.floor(Math.random() * (xkcdInfo.num - 1)) + 1;
                request('http://xkcd.com/'+xkcdRandom+'/info.0.json', function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    xkcdInfo = JSON.parse(body);
                    bot.sendMessage(msg.channel,xkcdInfo.img);
                  } else {
                    console.log("Got an error: ", error, ", status code: ", response.statusCode);
                  }
                });
              }

          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "8ball": {
      name: "8ball",
      extendedhelp: "I'll function as an magic 8 ball for a bit and anwser all of your questions! (So long as you enter the questions as suffixes.)",
      description: "Makes executive decisions super easy!",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('https://8ball.delegator.com/magic/JSON/0', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var eightBall = JSON.parse(body);
            bot.sendMessage(msg.channel,eightBall.magic.answer+", "+msg.sender);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "catfacts": {
      name: "catfacts",
      extendedhelp: "I'll give you some interresting facts about cats!",
      description: "Returns cool facts about cats!",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://catfacts-api.appspot.com/api/facts', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var catFact = JSON.parse(body);
            bot.sendMessage(msg.channel,catFact.facts[0]);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "fact": {
      name: "fact",
      extendedhelp: "I'll give you some interresting facts!",
      description: "Returns a random fact!",
      process: function(bot,msg,suffix) {
        var request = require('request');
        var xml2js = require('xml2js');
        request("http://www.fayd.org/api/fact.xml", function (error, response, body) {
          if (!error && response.statusCode == 200) {
            //console.log(body)
            xml2js.parseString(body, function (err, result) {
              bot.sendMessage(msg.channel,result.facts.fact[0]);
            });
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        }
      );
      }
    },
    "csgoprice": {
      name: "csgoprice",
      extendedhelp: "I'll give you the price of a CS:GO skin.",
      description: "Gives the price of a CSGO skin. Very picky regarding capitalization and punctuation.",
      usage: '[weapon "AK-47"] [skin "Vulcan"] [[wear "Factory New"] [stattrak "(boolean)"]] Quotes are important!',
      process: function(bot,msg,suffix) {
        skinInfo = suffix.split('"');
        var csgomarket = require('csgo-market');
        csgomarket.getSinglePrice(skinInfo[1],skinInfo[3],skinInfo[5],skinInfo[7], function (err, skinData) {
          if (err) {
            console.error('ERROR', err);
            bot.sendMessage(msg.channel,"That skin doesn't exist!");
          } else {
            if (skinData.success === true) {
              if (skinData.stattrak){skinData.stattrak = "Stattrak";} else {skinData.stattrak = "";}
            var msgArray = ["Weapon: "+skinData.wep+" "+skinData.skin+" "+skinData.wear+" "+skinData.stattrak,"Lowest Price: "+skinData.lowest_price,"Number Available: "+skinData.volume,"Median Price: "+skinData.median_price,];
            bot.sendMessage(msg.channel,msgArray);
            }
          }
        });
      }
    },
    "dice": {
      name: "dice",
      extendedhelp: "I'll roll some dice for you, handy!",
      usage: "[numberofdice]d[sidesofdice]",
      description: "Dice roller yay!",
      process: function(bot,msg,suffix) {
        var dice;
        if (suffix){
            dice = suffix;
      } else {dice = "d6";}
        var request = require('request');
        request('https://rolz.org/api/?'+dice+'.json', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var roll = JSON.parse(body);
            bot.sendMessage(msg.channel,"Your "+roll.input+" resulted in "+roll.result+" "+roll.details);
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "imdb": {
      name: "imdb",
      extendedhelp: "I'll search through IMDb for a movie matching your given tags, and post my finds in the channel.",
      usage: "[title]",
      description: "Returns information for an IMDB title",
      process: function(bot,msg,suffix) {
        if (suffix) {
        var request = require('request');
        request('http://api.myapifilms.com/imdb/title?format=json&title='+suffix+'&token='+ConfigFile.myapifilms_token, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var imdbInfo = JSON.parse(body);
            imdbInfo = imdbInfo.data.movies[0];
                if (imdbInfo) {
            //Date snatching
            var y = imdbInfo.releaseDate.substr(0,4),
            m = imdbInfo.releaseDate.substr(4,2),
            d = imdbInfo.releaseDate.substr(6,2);
            var msgArray = [imdbInfo.title,imdbInfo.plot," ","Released on: "+m+"/"+d+"/"+y,"Rated: "+imdbInfo.rated];
                    var sendArray = [imdbInfo.urlIMDB,msgArray];
                    for (var i = 0; i < sendArray.length; i++) {
                      bot.sendMessage(msg.channel,sendArray[i]);
                    }
                }else {
                bot.sendMessage(msg.channel,"Search for "+suffix+" failed!");
          }
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      } else {
        bot.sendMessage(msg.channel,"Usage: !imdb [title]");
      }
      }
    },
    "fancyinsult": {
      name: "fancyinsult",
      extendedhelp: "I'll insult your friends, in style.",
      description: "Insult your friends, in style.",
      process: function(bot,msg,suffix) {
        var request = require('request');
        request('http://quandyfactory.com/insult/json/', function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var fancyinsult = JSON.parse(body);
      if (suffix === "")  {
        bot.sendMessage(msg.channel,fancyinsult.insult);
	bot.deleteMessage(msg);
      }
      else {
        bot.sendMessage(msg.channel,suffix+", "+fancyinsult.insult);
	bot.deleteMessage(msg);
      }
          } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode);
          }
        });
      }
    },
    "alias": {
      name: "alias",
      extendedhelp: "I'll create a alias for a command.",
      usage: "<aliasname> <actual command> (without cmdPrefix)",
      description: "Creates command aliases. Useful for making simple commands on the fly",
      adminOnly: true,
      process: function(bot,msg,suffix) {
        var args = suffix.split(" ");
        var name = args.shift();
        if(!name){
          bot.sendMessage(msg.channel,cmdPrefix+"alias " + this.usage + "\n" + this.description);
        } else if(commands[name] || name === "help"){
          bot.sendMessage(msg.channel,"overwriting commands with aliases is not allowed!");
        } else {
          var command = args.shift();
          aliases[name] = [command, args.join(" ")];
          //now save the new alias
          require("fs").writeFile("./alias.json",JSON.stringify(aliases,null,2), null);
          bot.sendMessage(msg.channel,"created alias " + name);
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

try{
var rssFeeds = require("./runtime/rss.json");
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

try{
	aliases = require("./alias.json");
} catch(e) {
	//No aliases defined
	aliases = {};
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
    console.log("Initializing...");
    console.log("Checking for updates...");
    VersionChecker.getStatus(function(err, status) {
      if (err) { error(err); } // error handle
      if (status && status !== "failed") {
        console.log(status);
      }
    });
  bot.joinServer(ConfigFile.join_servers_on_startup);
  console.log("I've joined the servers defined in my config file.");
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
  if(msg.author == bot.user){return;}
	// check if message is a command
	if(msg.author.id != bot.user.id && (msg.content[0] === cmdPrefix)){
        if(msg.author.equals(bot.user)) { return; }
        if (maintenance == "true") {
          bot.sendMessage(msg.channel, "Hey "+msg.sender + ", I'm in maintenance mode, I can't take commands right now.");
          return;}
        console.log("Message recieved, I'm interpeting |" + msg.content + "| from " + msg.author.username + " as an command");
    var cmdTxt = msg.content.split(" ")[0].substring(1).toLowerCase();
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space

        alias = aliases[cmdTxt];
    		if(alias){
    			cmdTxt = alias[0];
    			suffix = alias[1] + " " + suffix;
    		}

		var cmd = commands[cmdTxt];
        if(cmdTxt === "help"){
          var msgArray = []; // Build a Messsage array, this makes all the messages send as one.
          var commandnames = []; // Build a array of names from commands.
          for(cmd in commands) {
              var info = cmdPrefix + cmd;
              var usage = commands[cmd].usage;
              if(usage){
                  info += " " + usage;
              }
              var description = commands[cmd].description;
              if(description){
                  info += "\n\t" + description;
              }}
            if(!suffix){
                for (index in commands){
                  commandnames.push(commands[index].name);}
                msgArray.push("These are the currently avalible commands, use `" + cmdPrefix + "help <command_name>` to learn more about a specific command.");
                msgArray.push("");
                msgArray.push(commandnames.join(", "));
                msgArray.push("");
                msgArray.push("If you have any questions, or if you don't get something, contact <@107904023901777920> or <@110147170740494336>");
                bot.sendMessage(msg.author,msgArray);
                if (msg.channel.server){
                  bot.sendMessage(msg.channel, "Ok "+msg.sender+", I've send you a list of commands via DM.");}
              }
            if (suffix){
              if (commands[suffix]){   // Look if suffix corresponds to a command
                var commando = commands[suffix]; // Make a varialbe for easier calls
                msgArray = []; // Build another message array
                msgArray.push("**Command:** `" + commando.name + "`"); // Push the name of the command to the array
                msgArray.push(""); // Leave a whiteline for readability
                if (commando.hasOwnProperty("usage")){ // Push special message if command needs a suffix.
                  msgArray.push("**Usage:** `" + ConfigFile.command_prefix + commando.name + " " + commando.usage + "`");}
                else {
                  msgArray.push("**Usage:** `" + ConfigFile.command_prefix + commando.name + "`");}
                msgArray.push("**Description:** " + commando.extendedhelp); // Push the extendedhelp to the array.
                if (commando.hasOwnProperty("adminOnly")){ // Push special message if command is restricted.
                  msgArray.push("**This command is restricted to admins.**");}
                if (commando.hasOwnProperty("timeout")){ // Push special message if command has a cooldown
                  msgArray.push("**This command has a cooldown of " + commando.timeout + " seconds.**");}
                if (suffix == "meme"){ // If command requested is meme, print avalible meme's
                  msgArray.push("");
                  var str = "**Currently available memes:\n**";
                  for (var m in meme){str += m + ", ";}
                  msgArray.push(str);}
                bot.sendMessage(msg.author, msgArray); // Send the array to the user
              }else {bot.sendMessage(msg.channel, "There is no **" + suffix + "** command!");}}
          }
		 else if(cmd) {
            var cmdCheckSpec = canProcessCmd(cmd, cmdTxt, msg.author.id, msg);
			if(cmdCheckSpec.isAllow) {
				cmd.process(bot,msg,suffix);
			}
		} else {
			bot.sendMessage(msg.channel, "Hey "+msg.sender+", you've used an invalid command!");
		}
}});

/*
========================
Logger for status changes.

Feature disabled for being unneeded.
========================


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
		if(cmdLastExecutedTime.hasOwnProperty(cmdText)) {
			var currentDateTime = new Date();
			var lastExecutedTime = new Date(cmdLastExecutedTime[cmdText]);
			lastExecutedTime.setSeconds(lastExecutedTime.getSeconds() + cmd.timeout);

			if(currentDateTime < lastExecutedTime) {
				// still on cooldown
				isAllowResult = false;
				//var diff = (lastExecutedTime-currentDateTime)/1000;
				//errorMessage = diff + " secs remaining";
                bot.sendMessage(msg.channel, "Hey "+msg.sender+", this command is on cooldown!");
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
        bot.sendMessage(msg.channel, "Hey "+msg.sender+", you are not allowed to do that!");
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

bot.login(ConfigFile.discord_email, ConfigFile.discord_password);
