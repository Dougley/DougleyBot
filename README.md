# DougleyBot
A chat bot for discord app based off <a href="https://github.com/chalda/DiscordBot/">Chalda's DiscordBot</a>, which is based off <a href="https://github.com/hydrabolt/discord.js/">discord.js</a>.

# Notice
If you plan on just using DougleyBot as a chatbot, and don't plan on using the files, you can make DougleyBot join your server via DougleyBot's Test server (https://discord.gg/0cFoiR5QVh57Spqg). Use `!join-server <instant-invite>` to make DougleyBot join your server.
**Note** that `!pullanddeploy`, `!online` and `!idle` don't work on this instance.

# Features:
- `!gif <query>`
  - Returns a gif from Giphy. 
  - **Example:** `!gif cute cats doing stuff`
- `!game <nameofgame>`
  - Asks the room if anyone wants to play the specified game. Some abbriviations work. 
  - **Example:** `!game gtao`
- `!image <query>` 
  - Returns an image from Google. (Careful, potentionally NSFW) 
  - **Example:** `!image cute cats`
- `!youtube <query>`
  - Returns a YouTube link. 
  - **Example:** `!youtube Windows 10 review`
- `!wiki <query>` 
  - Returns the summary of the first search result on Wikipedia. 
  - **Example:** `!wiki Windows 10`
- `!say <text>`
  - Copies text, and repeats it as the bot. 
  - **Example:** `!say I'm a bot.`
- `!pullanddeploy` 
  - Pulls changes from your (or this) repo and restarts node.  
  - Does <strong>not</strong> work for Windows!
- `!meme memetype "text1" "text2"`
  - Returns a meme image. Notice the quotes around text, they are vitally important. 
  - **Example:** `!meme doge "DougleyBot knows lots of memes" "Much wow"`
- `!help`
  - Prints all commands with usage and description.
- `!stock <ticker symbol>`
  - Fetches a stock price from Yahoo! Finance.
  - **Example:** `!stock GOOGL`
- `!servers`
  - Returns servers this bot is in.
- `!channels`
  - Returns channels this bot is in.
- `!idle`
  - Sets bot status to idle.
- `!online`
  - Sets bot status to online.
- `!ping` 
  - Responds to user with "Pong!", usefull for cheking if the bot is still active.
- `!join-server <instant-invite>`
  - Bot will join the requested server. 
  - **Example:** `!join-server https://discord.gg/0cFoiR5QVh57Spqg`

#### Currently avalible memes and abbriviations for `!meme` and `!game`

##### `!meme`
| Meme type   | Corresponds to: |
| ------------- | ------------- |
| brace  | Brace Yourselves X is Coming  |
| mostinteresting  | The Most Interesting Man In The World  |
| fry  | Futurama Fry  |
| yuno  | Y U No  |
| success | Success Kid  |
| allthethings  | X All The Y  |
| doge  | Doge  |
| drevil  | Dr Evil Laser  |
| skeptical  | Skeptical Baby  |
| notime  | Aint Nobody Got Time For That  |
| yodawg | Yo Dawg Heard You  |
| ermahgerd | Ermahgerd Berks  |
| hipsterariel | Hipster Ariel  |
| imagination | Imagination Spongebob |
| grumpycat  | Grumpy Cat  |
| morpheus  | Matrix Morpheus  |

##### `!game`
| Abbriviation   | Corresponds to: |
| ------------- | ------------- |
| cs  | Counter-Strike  |
| hon  | Heroes of Newerth  |
| hots  | Heroes of the Storm  |
| sc2  | Starcraft II  |
| warf | Warframe  |
| gtao  | Grand Theft Auto: Online  |
| gta  | Grand Theft Auto  |
| lol | League of Legends  |
| wow | World of Warcraft  |

More abbriviations and memes to be added later.

## Todo

- [x] Make it that bot runs without some of the code from the original DiscordBot.
- [ ] Clean up the code a bit.
- [ ] Make it so that !help takes arguments, so it can explain functions independently
- [ ] Add permissions to certain commands. (Like !pullanddeploy, !online, !idle)
- [x] Add more memes and abbriviations for the !meme and !game commands.
    - [ ] Create a function that will pull the popular memes from Imgflip, and integrate them automaticly.
- [ ] Integrate !memehelp into !help.
- [ ] Integrate a WolframAlpha command. The original DiscordBot had one, but that didn't work.
- [ ] Make it so that log files are written when !log is used, instead of printing them to the console.

## RSS:
    You can create an rss.json file adding rss feeds as commands. See rss.json.example for details.

# Instructions for using the files

Install Node (Version 0.12 works the best)

Pull this repo

Edit/Create auth.json
- Enter the login details for the bot's Discord account. (Line 2 to 3)
- Create a Google API key <a href="https://console.developers.google.com">here,</a> don't forget to enable the YouTube Data API in the "API & auth" -> "APIs" menu. (Line 4)
- Create a Imgflip acount for the bot, and enter the login details. (Line 5 to 6)
- (Optional) Create a WolframAlpha API key <a href="http://products.wolframalpha.com/api/">here,</a> and enter the API key. (Line 7)


<strong>Once installed and ready to be deployed, run the following in a command prompt in the folder you've copied DougleyBot's files into.</strong>


"npm install"

"node discord_bot.js"
