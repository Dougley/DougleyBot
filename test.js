// DougleyBot testing utility 1.0

// This is a script to test the capabilities of the public version of the bot live on Discord
// This script does NOT utilize a config.json, rather, it uses enviroment variables to define a Discord login
// You are not encouraged to use this script outside of a testing enviroment

var Discord = require("discord.js");
var bot = new Discord.Client();

var failcount = 0,
passcount = 0;

function pass(msg){
  console.log("✓     " + msg);
}

function fail(msg){
  console.log("✗     " + msg);
}

console.log("Beginning bot testing, logging in.");
bot.login(process.env.ds_email, process.env.ds_password).then(init);

function init(){
  pass("Succesfully logged in, continuing testing at ready.");
  bot.on("ready", function() {
    pass("Ready to start, starting with joining the test server.");
    MakeAndJoin();
  }
);}

function MakeAndJoin(){
  bot.joinServer(process.env.ds_invite).catch(server);
  if (server){
    pass("Succesfully joined the test server.");
    passcount++;
    TestTTS();
    }
  if (!server){
    fail("Couldn't join the test server.");
    failcount++;
    EndTest();
    }
  }

function TestTTS(){
  bot.sendMessage(129581698953248768, "Hello, I'm a testing utility bot made for testing DougleyBot, please ignore me. I'm in this server on request of Dougley for the purpose of testing for CodeShip");
  setTimeout(continueExecution, Math.round(3 * 1000));
    function continueExecution(){
      bot.sendMessage(129581698953248768, "!tts test");
        console.log("TTS test");
        bot.on("message", function (msg){
          if (msg.tts){
            pass("TTS check successfull.");
            passcount++;
            TestMeme();
          }
          if (!msg.tts){
            fail("TTS check failed.");
            failcount++;
            EndTest();
          }
        }
    );}
}

function TestMeme(){
  bot.sendMessage(129581698953248768, '!meme doge "testing" "123"');
    console.log("Meme test");
    bot.on("message", function (msg){
      if (msg.content == "http://i.imgflip.com"){
        pass("Succesfully created a meme.");
        passcount++;
        TestPurge();
      }
      if (msg.content !== "http://i.imgflip.com"){
        fail("Invalid response.");
        failcount++;
        EndTest();
      }
  }
);}

function TestPurge(){
  bot.sendMessage(129581698953248768, "!purge 1");
    console.log("Purge test");
    bot.on("message", function (msg){
      if (msg.content == "Done! Deleted 1 messages."){
        pass("Purge test successfull");
        passcount++;
        TestGame();
      }
      if (msg.content == "Something went wrong while fetching logs."){
        fail("Log fetching failiure.");
        failcount++;
        EndTest();
      }
    }
);}

function TestGame(){
  bot.sendMessage(129581698953248768, "!game gtao");
    console.log("Game test");
    bot.on("message", function (msg){
      if (msg.content == "@everyone, " + bot.user + " would like to know if anyone is up for Grand Theft Auto: Online"){
        pass("Recieved correct response");
        passcount++;
        TestIff();
      }
      if (msg.content !== "@everyone, " + bot.user + " would like to know if anyone is up for Grand Theft Auto: Online"){
        fail("Recieved invalid response");
        failcount++;
        EndTest();
      }
    }
);}

function TestIff(){
  bot.sendMessage(129581698953248768, "!iff clubpenguin.jpeg");
  console.log("Iff test");
  bot.on("message", function (msg){
    if (msg.attachments){
      pass("Recieved attachment");
      passcount++;
      TestYouTube();
    }
    if (!msg.attachments){
      fail("Didn't recieve an attachment");
      failcount++;
      EndTest();
    }
  }
);}

function TestYouTube(){
  bot.sendMessage(129581698953248768, "!youtube cats");
  console.log("YouTube test");
  bot.on("message", function (msg){
    if (msg.content == "http://www.youtube.com/watch?v="){
      pass("Recieved YouTube video");
      passcount++;
      EndTest();
    }
    if (msg.content == "Error querying YouTube! (╯°□°）╯︵ ┻━┻" || msg.content == "No results! (╯°□°）╯︵ ┻━┻"){
      fail("Error querying YouTube, skipping test");
      EndTest();
    }
    if (msg.content !== "http://www.youtube.com/watch?v=" && msg.content !== "No results! (╯°□°）╯︵ ┻━┻"){
      fail("Didn't recieve a correct response");
      failcount++;
      EndTest();
    }
});}

function EndTest(){
  bot.sendMessage(129581698953248768, "Testing completed.");
  if (failcount > 0){
    bot.sendMessage(129581698953248768, "Some tests failed, check CodeShip for the logs.");
    bot.logout();
    process.exit(1); // Exit with error
  }
  if (failcount === 0){
    bot.sendMessage(129581698953248768, "All tests completed successfully, completed " + passcount + " tests.");
    bot.logout();
    process.exit(0); // Exit without error
  }
}
