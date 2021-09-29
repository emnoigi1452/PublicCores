var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Plugin = Manager.getPlugin("PlaceholderAPI");
var Fabled = Manager.getPlugin("FabledSkyblock");
var LuckPerms = Manager.getPlugin("LuckPerms");
var Scheduler = Server.getScheduler();
var Console = Server.getConsoleSender();

var ChatColor = org.bukkit.ChatColor;
var Colors = ["translateAlternateColorCodes", "stripColor"];
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var Material = org.bukkit.Material;

var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");
var System = Java.type("java.lang.System");
var DecimalFormat = Java.type("java.text.DecimalFormat");
var HashSet = Java.type("java.util.HashSet");
var HashMap = Java.type("java.util.HashMap");

function FabledData(database, gifts, uses) {
  this.database = database;
  this.gifts = gifts;
  this.uses = uses;
  this.getUses = function() return this.uses;
  this.setUses = function(param) {
    if(isNaN(param) || param < 0)
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fSố điền vào không hợp lệ!");
    else this.uses = param; // set value
  };
  this.getDatabase = function() return this.database;
  this.setDatabase = function() return; // doesn't allow to modify table layout
  this.setValue = function(key, value) {
    if(!this.database.keySet().contains(key))
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fLoại khoáng sản không hợp lệ!");
    else this.database.put(key, value); // update table
  };
  this.addToStorage = function(key, amount) {
    if(!this.database.keySet().contains(key))
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fLoại khoáng sản không hợp lệ!");
    else {
      var current = this.database.get(key); // get current data value
      this.database.put(key, Math.floor(key+current));
    }
  };
  this.removeFromStorage = function(key, amount) {
    if(!this.database.keySet().contains(key))
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fLoại khoáng sản không hợp lệ!");
    else {
      var current = this.database.get(key); // current amount;
      if(current < amount)
        throw ChatColor[Colors[0]]('&', "&cLỗi: &fKho của đũa không đủ khoáng sản!");
      else this.database.put(key, current-amount);
    }
  };
  this.resetStorage = function() {
    for each(var key in this.database.keySet())
      this.database.put(key, 0);
  };
  this.getGifts = function() return this.gifts;
  this.setGiftedList = function() return; // you can't modify the gifted list, sorry :'(
  this.addToGifted = function(receiver) this.gifts.add(receiver.getName());
};

// Main code for the wand begins here :)
function FabledCore() {
  try {
    if(Fabled == null || LuckPerms == null)
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fMáy chủ chưa cài đặt &aFabledSkyblock &fhoặc &aLuckPerms&f!");
    else {
      var IslandManager = Fabled.getIslandManager(); var StackManager = Fabled.getStackableManager();
      var TargetIsland = IslandManager.getIsland(Player);
      switch(args[0].toLowerCase()) {
        case "build": /* coming soon */ break;
        case "data": /* coming soon */ break;
        case "add": /* coming soon */ break;
        case "remove": /* coming soon */ break;
        case "deposit": /* coming soon */ break;
        case "withdraw": /* coming soon */ break;
        case "gift": /* coming soon */ break;
        default: throw ChatColor[Colors[0]]('&', "&cLỗi: &fCú pháp lệnh không tồn tại!");
      }
    }
  } catch(err) {
    return "&eScript &8&l| " + err.message;
  }
}
FabledCore();
