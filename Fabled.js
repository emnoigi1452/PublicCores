var Player = BukkitPlayer;
var World = Player.getWorld();
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

function FabledData(database, gifts, use_graph) {
  this.build = false;
  this.database = database;
  this.gifts = gifts;
  this.use_graph = use_graph;
  this.getTotalUses = function() {
    var total = 0;
    for each(var key in this.use_graph.keySet())
      total += this.use_graph.get(key)[0];
    return total;
  };
  this.getTypeUsage = function(key) {
    if(!this.use_graph.keySet.contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
    else this.use_graph.get(key)[0];
  };
  this.getTotalBuildedBlocks = function() {
    var combined = 0;
    for each(var key in this.use_graph.keySet())
      combined += this.use_graph.get(key)[1];
    return total;
  };
  this.getBuildedBlockType = function(key) {
    if(!this.use_graph.keySet.contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
    else this.use_graph.get(key)[1];
  };
  this.getAverageUsage = function(key) {
    if(!this.use_graph.keySet.contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
    else
      return Math.floor(this.getBuildedBlockType(key) / this.getTypeUsage(key));
  }
  this.getDatabase = function() return this.database;
  this.setDatabase = function() return; // doesn't allow to modify table layout
  this.setValue = function(key, value) {
    if(!this.database.keySet().contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!"
    else this.database.put(key, value); // update table
  };
  this.addToStorage = function(key, amount) {
    if(!this.database.keySet().contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!"
    else {
      var current = this.database.get(key); // get current data value
      this.database.put(key, Math.floor(key+current));
    }
  };
  this.removeFromStorage = function(key, amount) {
    if(!this.database.keySet().contains(key))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!"
    else {
      var current = this.database.get(key); // current amount;
      if(current < amount)
        throw "&cLỗi: &fKho của đũa không đủ khoáng sản!"
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
  this.getBuildMode = function() return this.build;
  this.toggleBuildMode = function() {
    this.build = !this.build;
  };
  this.setBuildMode = function(value) {
    if(typeof value != "boolean")
      throw "&cLỗi: &fLoại dữ liệu nhập vào không hợp lệ!";
    this.build = value;
  }
};

// Object responsible for global functions
var Script = {
  formatNumber: function(num) {
     num = num.toString();
     var pattern = /(-?\d+)(\d{3})/;
     while (pattern.test(num))
         num = num.replace(pattern, "$1,$2");
     return num;
  },
  createData: function(p) {
    var dataMap = new HashMap();
    dataMap.put("IRON", 0);
    dataMap.put("GOLD", 0);
    dataMap.put("DIAMOND", 0);
    dataMap.put("EMERALD", 0);
    var graph = new HashMap();
    graph.put("IRON", Java.to([0 ,0], "int[]"));
    graph.put("GOLD", Java.to([0 ,0], "int[]"));
    graph.put("DIAMOND", Java.to([0 ,0], "int[]"));
    graph.put("EMERALD", Java.to([0 ,0], "int[]"));
    var dataInstance = new FabledData(dataMap, new ArrayList(), graph);
    p.setMetadata("fabledData", new FixedMetadataValue(Plugin, dataInstance));
  },
  getIgnoreBlocks: function() {
    var ignore_set = new HashSet;
    ignore_set.add(Material.WATER);
    ignore_set.add(Material.STATIONARY_WATER);
    ignore_set.add(Material.LAVA);
    ignore_set.add(Material.STATIONARY_LAVA);
    ignore_set.add(Material.AIR);
    return ignore_set;
  },
  getDataDirectory: function(key) {
    var metadata = Player.getMetadata("fabledData").get(0).value();
    return metadata.getDatabase().get(key);
  },
  getTranslatedName: function(key) {
    switch(key.toLowerCase()) {
      case "iron": return "&fKhối Sắt";
      case "gold": return "&6Khối Vàng";
      case "diamond": return "&bKhối Kim Cương";
      case "emerald": return "&aKhối Lục Bảo";
      default: throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
    }
  }
};

// Main code for the wand begins here :)
function FabledCore() {
  try {
    if(Fabled == null || LuckPerms == null)
      throw ChatColor[Colors[0]]('&', "&cLỗi: &fMáy chủ chưa cài đặt &aFabledSkyblock &fhoặc &aLuckPerms&f!");
    else {
      var IslandManager = Fabled.getIslandManager(); var StackManager = Fabled.getStackableManager(); var LevelManager = Fabled.getLevellingManager();
      var TargetIsland = IslandManager.getIsland(Player);
      var fabledPlayerData = Player.getMetadata("fabledData").get(0).value();
      switch(args[0].toLowerCase()) {
        case "build":
          if(!Player.hasMetadata("fabledData")) {
            Player.sendMessage(ChatColor[Colors[0]]('&',
              "&eFabled &8&l| &cLỗi: &fBạn không có quyền sử dùng vật phẩm này!"));
            return -1;
          } else {
            var ignore_blocks = Script.getIgnoreBlocks(); var target = Player.getTargetBlock(ignore_blocks, 5);
            if(!IslandManager.getIslandAtLocation(target.getLocation()).equals(TargetIsland)) {
              Player.sendMessage(ChatColor[Colors[0]]('&',
                "&eFabled &8&l| &cLỗi: &fBạn chỉ có thể dùng đũa ở đảo của mình!"));
              return -1;
            }
            var type_key = target.getType().name().replace("_BLOCK", "");
            if(!fabledPlayerData.getDatabase().keySet().contains(type_key)) {
              Player.sendMessage(ChatColor[Colors[0]]('&',
                "&eFabled &8&l| &cLỗi: &fLoại khối nhắm vào không hợp lệ!"));
              return 1;
            }
            var balance = Script.getDataDirectory(type_key);
            if(balance < 1) {
              Player.sendMessage(ChatColor[Colors[0]]('&',
                "&eFabled &8&l| &cLỗi: &fTrong kho khoáng sản không đủ vật phẩm!"));
            } else {
              var Build = Java.extend(Runnable {
                run: function() {
                  var aimed = StackManager.getStacks().get(target.getLocation());
                  aimed.setSize(aimed.getSize() + balance); LevelManager.startScan(Player, TargetIsland);
                  fabledPlayerData.setValue(type_key, 0);
                }
              }); var start = System.nanoTime(); Scheduler.runTask(Plugin, new Build()); var end = System.nanoTime();
              var formatter = new DecimalFormat("#0.0"); var time = formatter.format((end-start)/1000000);
              Player.sendMessage(ChatColor[Colors[0]]('&',
                "&eFabled &8&l| &fĐã đặt thành công &a%a %b&f. Thời gian triển khai: &a%tms")
              .replace("%a", Script.formatNumber(balance))
              .replace("%b", Script.getTranslatedName(type_key))
              .repalce("%t", time)); return -1;
            }
          }
          break;
        case "data": /* coming soon */ break;
        case "is-fabled-user": /* maybe l8r */ break;
        case "status": /* not yet */ break;
        case "add": /* coming soon */ break;
        case "remove": /* coming soon */ break;
        case "deposit": /* coming soon */ break;
        case "withdraw": /* coming soon */ break;
        case "purchase": /* yea l8r */ break;
        case "gift": /* coming soon */ break;
        default: throw ChatColor[Colors[0]]('&', "&cLỗi: &fCú pháp lệnh không tồn tại!");
      }
    }
  } catch(err) {
    return "&eScript &8&l| " + err.message;
  } finally {
    Player.setMetadata("fabledData", fabledPlayerData);
  }
}
FabledCore();
