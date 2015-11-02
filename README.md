# DougleyBot
A chat bot for discord app based off <a href="https://github.com/chalda/DiscordBot/">Chalda's DiscordBot</a>, which is based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>.

# Notice
If you plan on just using DougleyBot as a chatbot, and don't plan on using the files, you can make DougleyBot join your server via DougleyBot's Test server (https://discord.gg/0cFoiR5QVh57Spqg). Use !join-server [instant-invite] to make DougleyBot join your server.

# Features:
- !gif query = Returns a gif from Giphy. Example: !gif cute cats doing stuff
- !game nameofgame => Asks the room if anyone wants to play the specified game. Some abbriviations work. Example: !game gtao
- !image query => Returns an image from Google. (Careful, potentionally NSFW) Example: !image cute cats
- !youtube query=> Returns a YouTube link. Example: !youtube Windows 10 review
- !wiki query=> Returns the summary of the first search result on Wikipedia. Example: !wiki Windows 10
- !say text => Copies text, and repeats it as the bot. Example: !say I'm a bot.
- !pullanddeploy => Pulls changes from your (or this) repo and restarts node. Does <strong>not</strong> work for Windows!
- !meme memetype "text1" "text2" => Returns a meme image. Notice the quotes around text, they are vitally important. Example: !meme doge "DougleyBot knows lots of memes" "Much wow"
- !help => Prints all commands with usage and description.
- !version => Shows the last deployed commit to the Git repo.
- !servers => Returns servers this bot is in.
- !channels => Returns channels this bot is in.
- !idle => Sets bot status to idle.
- !online => Sets bot status to online.
- !ping => Responds to user with "Pong!", usefull for cheking if the bot is still active.
- !join-server => Bot will join the requested server. Example: !join-server https://discord.gg/0cFoiR5QVh57Spqg

## RSS:
    you can create an rss.json file adding rss feeds as commands. See rss.json.example for details

# Instructions for using the files

Requires Node (probably 0.12)

Pull this repo

Edit/Create auth.json: email/password, youtube API key, username/password for imgflip (example provided)


<strong>Once installed and ready to be deployed, run the following in a command prompt in the folder you've copied DougleyBot's files into.</strong>


"npm install"

"node discord_bot.js"
