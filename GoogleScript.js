// Initialize Google Spreadsheet with data, commands, messages, and stats
var spreadsheetURL = 'https://docs.google.com/spreadsheets/yourSpreadsheetHere'; //fill your URL here
var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetURL);

// Main group info
var mainBotName = "<yourMainBotName>"; //fill in the following  3 lines
var mainGroupID = <123>;
var mainBotID = "loremIpsum123523ewdfds";

// Test group info
var testBotName = "<yourTestBotName>"; //fill in the following  3 lines
var testGroupID = 51898340;
var testBotID = "loremIpsum12347654w";

// User token access key required to retrieve more powerful APIs from GroupMe
var tokenID = "loremIpsum1234e";

// Initialize variables
var botId = mainBotID; // mainBotID;
var botName = mainBotName; // mainBotName;
var mcServerID = "12.345.56.78:25565";
var chatAsk = false;

// Initialize each sheet in workbook
var users = new getUsers();
var commandList = new getCommands();

function sendText(text){
  if (text.length > 999) {
    text = text.substring(0,995) + "...";
  }

  var payload = {
    "bot_id" : botId,
    "text" : text
  };
  var options = {
    "method" : "post",
    "payload" : payload
  };

  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", options);
}

function sendImage(caption, url) {
  var payload = {
    "bot_id" : botId,
    "text" : caption,
    "attachments" : [
      {
        "type" : "image",
        "url" : url
      }
    ]
  };
  var options = {
    "method" : "post",
    "payload" : JSON.stringify(payload)
  };

  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", options);
}

function sendVideo(text, url, previewUrl) {
  var payload = {
    "bot_id" : botId,
    "text" : text,
    "attachments" : [
      {
        "type" : "video",
        "preview_url" : previewUrl,
        "url" : url
      }
    ]
  };
  var options = {
    "method" : "post",
    "payload" : JSON.stringify(payload),
  };

  UrlFetchApp.fetch("https://api.groupme.com/v3/bots/post", options);
}

function doGet(e){

}

//respond to messages sent to the group. Recieved as POST
//this method is automatically called whenever the Web App's (to be) URL is called
function doPost(e){
  console.log({message: 'Called doPost'});
  console.log({message: e});
  console.log(e);
  //sendText("This is a test");
  var post = JSON.parse(e.postData.getDataAsString());
  var text = post.text;
  var name = post.name;
  var id = post.id;
  var sender_id = post.sender_id;
  var user_id = post.user_id;
  var group_id = post.group_id;
  var attachments = post.attachments;
  console.log({message: 'This is a test ' + post.sender_id});

  var mentionedUserIDs = [];
  for (i in attachments) {
    if (attachments[i].type == "mentions") {
      mentionedUserIDs = attachments[i].user_ids;
    }
  } console.log({message: 'Post User ID'});

  // Change which bot replies depending on the group where the message was sent
  if (group_id == mainGroupID) {
    botId = mainBotID;
    botName = mainBotName;
  }
  if (group_id == testGroupID) {
    botId = testBotID;
    botName = testBotName;
  }

  //sendText("This is a test - post ID");

  //Logger.log(text + '-' + name + '-'  + id + '-'  + sender_id + '-'  + user_id);

  if(text.toLowerCase().substring(0, 3) == "!hi"){sendText("Hello, " + name);};

  if (text.toLowerCase().indexOf(" added ") != -1 && name == "GroupMe") {
    var names = text.substring(text.toLowerCase().indexOf("added") +6, text.toLowerCase().indexOf("to the group") - 1);
    sendText("Welcome " + names + "!");
  }
  if (text.toLowerCase().indexOf("!help") == 0) {
    var msg = 'Commands:\n';
    msg += '!status - gets the server status\n';
    msg += '!hi - say hello to the bot\n';
    msg += '!mcName set [yourName]- Set your minecraft name\n';
    msg += '!mcName all - list all stored players on the server\n';
    msg += '!mcName me - show your MC name\n';
    msg += '!kick [@mention users] - Kick mentioned users\n';
    msg += '!help - Displays this message\n';
    sendText(msg);
  }
  // !status - gets the server's status - uses API from https://api.mcsrvstat.us/
  if (text.toLowerCase().indexOf("!status") == 0) {
    chatAsk = true;
    checkServer();
  }
  //adds user
  if (text.toLowerCase().indexOf("!add") == 0 && name == "<yourNameHere>") {
    var addCommand = text.substring(5);
    commandList.sheet.appendRow(addCommand.split(','));
  }else if(text.toLowerCase().indexOf("!add") == 0){sendText("Sorry, you don't have permission for this command.");}

  //set username
  if (text.toLowerCase().indexOf("!mcname set") == 0) {
    var tagMessage = text.substring(12);
    setMcName(name, tagMessage);
  } else if (text.toLowerCase().indexOf("!mcname me") == 0) {
    var msg = getMcName(name);
    sendText(name + ": " + msg);
  } else if (text.toLowerCase().indexOf("!mcname all") == 0) { //sendText("Checking everyone with a total of " + users.size + " rows");
    var msg = "";
    for (var x = 0; x < users.size; x++) { //sendText("Checking row " + x);
      msg += users.values[x][0] + ": " + users.values[x][2] + "\n";
    }
    sendText(msg);
  }
   //kicks user
  if (text.toLowerCase().indexOf("!kick") == 0 && name == "<yourNameHere>"){
    // Get the list of members in the group and their ids (not user ids) using access token
    var url = "https://api.groupme.com/v3/groups/" + group_id + "?token=" + tokenID;
    var result = UrlFetchApp.fetch(url);
    var data = JSON.parse(result.getContentText());
    var members = data.response.members;

    // Loop through all of the mentioned users and kick them
    for (i in mentionedUserIDs) {
      var memberID = null;
      for (j in members) {
        if (members[j].user_id == mentionedUserIDs[i]) {
          memberID = members[j].id;
          break;
        }
      }
      var url = "https://api.groupme.com/v3/groups/" + group_id + "/members/" + memberID + "/remove?token=" + tokenID;
      var options = {"method" : "post",};
      var result = UrlFetchApp.fetch(url, options);
    }
  }else if(text.toLowerCase().indexOf("!kick") == 0){sendText("Sorry, you don't have permission for this command.");}
}

//check the status of the server
function checkServer() {
  var url = "https://api.mcsrvstat.us/2/" + mcServerID;
  var result = UrlFetchApp.fetch(url);
  var data = JSON.parse(result.getContentText());
  var online = data.online;
  var msg = mcServerID + " ";

  if(online){
    msg += "is online.\n";
    var playerCount = data.players.online;
    if(playerCount > 0){
      msg += "Current Players: (" + playerCount +" total)\n";
      var playerList = data.players.list;
      for(var i = 0; i < playerList.length; i++){//sendText("Check logic " + getIrlName(playerList[i]));
        if(getIrlName(playerList[i]) != 0){
          msg += playerList[i]+ " (" + getIrlName(playerList[i]) + ")\n";
        } else {msg += playerList[i] + "\n";}
      }
      sendText(msg);
    }
    if(chatAsk && playerCount == 0){
      sendText(msg);
      chatAsk = false;
    }
  }else{
    msg += "is offline. Please fix the server Admin.";
    sendText(msg);
  }
  console.log({message: 'Ran script. Message was:\n'+msg});
}

//sets the player's minecraft name
function setMcName(name, tag) {
  var tagAdded = 0;
  for (var x = 0; x < users.size; x++) {
    if((users.values[x][0] == name)){
      users.sheet.getRange(x+1, 3).setValue(tag);
      tagAdded = 1;
      sendText("MC Name updated to " + tag);
    }
  }
  if (tagAdded == 0) {
    createPerson(name, 0, tag);
    sendText("MC Name set to " + tag);
  }
}

function getMcName(name) {
  for (var x = 0; x < users.size; x++) {//var tempName = users.values[x][0].toString(); sendText("Does " + tempName.toLowerCase() + " = " + name.toLowerCase() + "?");
    if((users.values[x][0].toLowerCase() == name.toLowerCase())){ //sendText("Yes they do!");
      return users.values[x][2];
    }//else{sendText("No they don't!");}
  }
  return 0;
}

function getIrlName(mcname) {
  for (var x = 0; x < users.size; x++) {//tempName = users.values[x][2].toString(); sendText("Does " + tempName.toLowerCase() + " = " + mcname.toLowerCase() + "?");
    if((users.values[x][2].toLowerCase() == mcname.toLowerCase())){
      return users.values[x][0];
    }
  }
  return 0;
}

function createPerson(name, karma, tag) {
  users.sheet.appendRow([name, karma, tag]);
}

function getUsers(){
  this.sheet = spreadsheet.getSheetByName("Users");
  this.range = this.sheet.getRange(1, 1, this.sheet.getMaxRows(), 3);
  this.values = this.range.getValues();
  this.size = this.sheet.getLastRow();
}

function getCommands() {
  this.sheet = spreadsheet.getSheetByName("Commands");
  this.range = this.sheet.getRange(2, 1, this.sheet.getMaxRows(), 6);
  this.values = this.range.getValues();
  this.size = this.sheet.getLastRow();
}
