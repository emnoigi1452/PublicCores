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
var ItemStack = org.bukkit.inventory.ItemStack;

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
    if(!this.database.keySet().contains(key) || isNaN(amount))
      throw "&cLỗi: &fLoại khoáng sản không hợp lệ!"
    else {
      var current = this.database.get(key); // get current data value
      this.database.put(key, Math.floor(key+current));
    }
  };
  this.removeFromStorage = function(key, amount) {
    if(!this.database.keySet().contains(key) || isNaN(amount))
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
    graph.put("IRON", [0,0]);
    graph.put("GOLD", [0,0]);
    graph.put("DIAMOND", [0,0]);
    graph.put("EMERALD", [0,0]);
    var dataInstance = new FabledData(dataMap, new ArrayList(), graph);
    p.setMetadata("fabledData", new FixedMetadataValue(Plugin, dataInstance));
  },
  getMaterial: function(param, block) {
    if(typeof block != "boolean")
      throw "&cLỗi: &fLoại dữ liệu không hợp lệ!";
    switch(param.toLowerCase()) {
      case "iron": return block ? Material.IRON_BLOCK : Material.IRON_INGOT;
      case "gold": return block ? Material.GOLD_BLOCK : Material.GOLD_INGOT;
      case "diamond": return block ? Material.DIAMOND_BLOCK : Material.DIAMOND;
      case "emerald": return block ? Material.EMERALD_BLOCK : Material.EMERALD;
      default:
        throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
    }
  },
  inventoryHandler: function(type, action) {
    var valid = new ArrayList(["clear", "amount", "empty"]);
    var empties = new HashMap(); var container = 0;
    if(!valid.contains(action))
      throw "&cLỗi: &fHình thức xử lí túi đồ không hợp lệ!";
    else {
      for(var j = 0; j < 36; j++) {
        var slot = Player.getInventory().getItem(j);
        if(slot == null)
          empties.put(j, 64);
        else {
          if(!slot.getType().equals(type)) continue;
          else {
            if(slot.getAmount() < 64) empties.put(j, 64 - slot.getAmount());
            container += slot.getAmount();
            if(action == "clear") slot.setAmount(0);
          }
        }
      }
      if(action == "empty") return empties;
      else return container;
    }
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
        case "data":
          var mode = args[1].toLowerCase(); var modeMap = new ArrayList(['storage', 'usage', 'gifts']);
          if(!modeMap.contains(mode))
            throw "&cLỗi: &fLoại dữ liệu &e" + mode + " &fkhông tồn tại!";
          else {
            switch(mode) {
              case "storage":
                var type = args[2].toUpperCase();
                if(Boolean(args[3]))
                  return Script.formatNumber(fabledPlayerData.getDatabase().get(type));
                else return fabledPlayerData.getDatabase().get(type).toString();
              case "usage":
                if(Boolean(args[2]))
                  return Script.formatNumber(fabledPlayerData.getTotalUses());
                else return fabledPlayerData.getTotalUses().toString();
              case "usage-type":
                var type = args[2].toUpperCase();
                if(Boolean(args[3]))
                  return Script.formatNumber(fabledPlayerData.getTypeUsage(type));
                else return fabledPlayerData.getTypeUsage(type).toString();
              case "builded":
                if(Boolean(args[2]))
                  return Script.formatNumber(fabledPlayerData.getTotalBuildedBlocks());
                else return fabledPlayerData.getTotalBuildedBlocks().toString();
              case "type-builded":
                var type = args[2].toUpperCase();
                if(Boolean(args[3]))
                  return Script.formatNumber(fabledPlayerData.getBuildedBlockType(type));
                else return fabledPlayerData.getBuildedBlockType(type).toString();
              case "gifted":
                var display = ""; var gifts = fabledPlayerData.getGifts();
                for(var j = 0; j < (gifts.size()-1); j++)
                  display += gifts.get(j).concat(", ");
                display += gifts.get(j).concat(".");
                return display; // list of gifted players
              case "avg-usage":
                var type = args[2].toLowerCase();
                var uses = fabledPlayerData.getTypeUsage(type); var builded = fabledPlayerData.getBuildedBlockType(type);
                return Script.formatNumber(Math.floor(builded/uses));
              default: throw "&cLỗi: &fLoại thông tin không hợp lệ!";
            }
          }
        case "status":
          var node = args[1].toLowerCase();
          if(node != "toggle" && node != "display")
            throw "&cLỗi: &fCú pháp lệnh không phù hợp!";
          else {
            if(node == "toggle") {
              fabledPlayerData.toggleBuildMode(); var tag = fabledPlayerData.getBuildMode() ? "&aBật" : "&cTắt";
              Player.sendMessage(ChatColor[Colors[0]]('&',
                "&eFabled &8&l| &aThông báo: &fBạn đã " + tag + " &fchế độ xây dựng của đũa!"));
              return -1;
            } else
              return fabledPlayerData.getBuildMode() ? "&aBật" : "&cTắt";
          }
          break;
        case "add":
          fabledPlayerData.addToStorage(args[1].toUpperCase(), parseInt(args[2]));
          return -1;
        case "remove":
          fabledPlayerData.addToStorage(args[1].toUpperCase(), parseInt(args[2]));
          return -1;
        case "deposit":
          var key = args[1].toUpperCase(); var isBlock = Boolean(args[2]);
          var handler = Script.inventoryHandler(Script.getMaterial(key, isBlock), "clear");
          var trueBlock = isBlock ? handler : Math.floor(handler/9);
          fabledPlayerData.addToStorage(key, trueBlock);
          Player.sendMessage(ChatColor[Colors[0]]('&', 
            "&eFabled &8&l| &aThông báo: &fĐã gửi &a%a %name &fvào kho của đũa!")
            .replace("%a", Script.formatNumber(trueBlock))
            .replace("%name", Script.getTranslatedName(key)));
          return 0;
        case "withdraw":
          var key = args[1].toUpperCase(); var type = Script.getMaterial(key, true);
          var handler = Script.inventoryHandler(type, "empty");
          var received = 0;
          for each(var slot in handler.keySet()) {
            var givable = handler.get(slot); var bal = fabledPlayerData.getDatabase().get(key);
            // amount giving...
            if(bal >= givable) bal -= givable;
            else { givable = bal; bal = 0 }
            // item stack format
            var stack = null; received += givable;
            if(handler.get(slot) == 64)
              stack = new ItemStack(type, 64);
            else
              stack = new ItemStack(type, (64-(handler.get(slot)))+givable);
            Player.getInventory().setItem(slot, stack);
            if(bal == 0) break;
          }
          Player.sendMessage(ChatColor[Colors[0]]('&', 
            "&eFabled &8&l| &aThông báo: &fĐã nhận được &a%a %name &ftừ kho của đũa!")
            .replace('%a', Script.formatNumber(received))
            .replace('%name', Script.getTranslatedName(key)));
          return 0;
        case "reset": /* waiting for later implementation */
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
