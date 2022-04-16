var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Messenger = Server.getMessenger();
var Host = Manager.getPlugin("PlaceholderAPI");
var PreventHopper = Manager.getPlugin("PreventHopper-ORE");
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");

var ChatColor = org.bukkit.ChatColor;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;

var System = java.lang.System;
var Thread = java.lang.Thread;
var Runnable = java.lang.Runnable;
var HashMap = java.lang.HashMap;
var ArrayList = java.lang.ArrayList;
var File = java.io.File;
/*
var BufferedWriter = java.io.BufferedWriter;
var FileWriter = java.io.FileWriter;
var BufferedReader = java.io.BufferedReader;
var FileReader = java.io.FileWriter;
*/

var DataContainer = Host.getDataFolder().getAbsolutePath().concat("/Color_Drops");
load('https://pastebin.com/raw/k4XhJdff'); // Import CompressorAPI

function main() {
  try {
    if(Skyblock == null || PreventHopper == null)
      throw Language.getError('missingDepend');
    // Check and initialize pickaxe's database file
    var Database = new File(DataContainer);
    if(!Database.exists()) { Database.mkdir(); return -1; }
    /* -------------------------------------------------- */
    var FileID = Compressor.hashUserID(Player.getName()).concat(".yml");
    if(!(new File(Database, FileID).exists())) {
      Player.sendMessage(Utils.color(Language.getError("noPermission")));
      Player.kickPlayer(Utils.color(Language.getError("invalidUsage")));
      return -1;
    } else {
      var userData = new File(FileID); var config = YamlConfiguration.loadConfiguration(userData);
      switch(args[0].toLowerCase()) {
        case "skill":
          var PlayerData = Player.getMetadata("playerData").get(0).value();
          var Vault_Economy = Utils.getVaultComponent(); var Setup = false;
          Utils.typeArray.forEach(function(type) {
            var FormattedKey = Utils.getPHKey(type);
            if(config.get("Nodes.".concat(FormattedKey)) != "none")
              Setup = true;
          });
          if(!Setup) Player.sendMessage(Utils.color(Language.getError("notSetup")));
          else {
            var Economy = new ArrayList(); var Compression = new ArrayList(); var Skipped = 0;
            Utils.typeArray.forEach(function(type) {
              switch(config.get("Nodes.".concat(Utils.getPHKey(type)))) {
                case "sell": Economy.add(Utils.getPHKey(type)); break;
                case "craft": Compression.add(Utils.getPHKey(type)); break;
                default: Skipped++; break;
              }
            });
            if(Skipped > 0) 
              Player.sendMessage(Utils.color(Language.getNotification("skippedMinerals").replace("$n", Skipped.toString())));
            var SkillExecutorName = Player.getName();
            var SkillTask = Java.extend(Runnable, {
              run: function() {
                /* Nếu người dùng không online, tắt skill */
                if(!BukkitServer.getOfflinePlayer(SkillExecutorName).isOnline())
                  Scheduler.cancelTask(config.get("Task.ID"));
                /* Nếu người dùng không có trên đảo của mình, tắt skill */
                if(!Utils.performIslandCheckup(Player)) {
                  Player.sendMessage(Utils.color(Language.getNotification("notOnIsland")));
                  Scheduler.cancelTask(config.get("Task.ID"));
                }
                config.set("Task.Upcoming", System.currentTimeMillis()+(Utils.delay*1000)); config.save(userData);
                if(!Economy.isEmpty()) {
                  var TotalDeposit = 0; var Prices = Utils.getPriceTable();
                  Economy.stream().forEach(function(economyType) {
                    TotalDeposit += PlayerData.getBlock(economyType)*Prices.get(economyType);
                    PlayerData.setBlock(economyType, new java.lang.Integer(0));
                  });
                  Player.sendMessage(Utils.color(
                    Language.getNotification('soldSelected').replace("$a", Utils.formatNumber(TotalDeposit))));
                  Vault_Economy.depositPlayer(SkillExecutorName, TotalDeposit);
                }
                if(!Compression.isEmpty()) {
                  Compression.stream().forEach(function(type) {
                    var ParsingParam = type.split("_")[0].toLowerCase();
                    var Syntax = "javascript_prevent-block_condense,$t";
                    PlaceholderAPI.static.setPlaceholders(Player, "%" + Syntax.replace("$t", ParsingParam) + "%");
                  });
                }
              }
            }); return 0;
          }; return -1;
        case "task-check":
          var SavedID = config.get("Task.ID");
          if(!(Scheduler.isQueued(SavedID)) || !(Scheduler.isCurrentRunning(SavedID))) {
            config.set("Task.ID", -1); config.set("Task.Upcoming", -1);
            config.save(userData); return false;
          } else return true;
      } 
    }
  } catch(err) {
    Player.sendMessage(Language.getError("globalError"));
    return err;
  }
}

var Utils = {
  typeArray: ['coal','lapis','redstone','iron','gold','diamond','emerald'],
  delay: 300,
  color: function(input) { return ChatColor.translateAlternateColorCodes('&', input); },
  getStartupTime: function() {
    var ManagementFactory = java.lang.management.ManagementFactory;
    return ManagementFactory.getRuntimeMXBean().getStartTime();
  },
  performIslandCheckup: function(user) {
    var Grid = Skyblock.getGrid();
    var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(user);
    return Grid.getIslandAt(user.getLocation()).equals(SuperiorPlayer.getIsland());
  },
  getPHKey: function(param) {
    switch(param.toLowerCase()) {
      case "coal": return "COAL";
      case "lapis": return "LAPIS_LAZULI";
      case "redstone": return "REDSTONE";
      case "iron": return "IRON_INGOT";
      case "gold": return "GOLD_INGOT";
      case "diamond": return "DIAMOND";
      case "emerald": return "EMERALD";
    }
    return -1;
  },
  getPriceTable: function() {
    var PriceMap = new HashMap();
    PriceMap.put("COAL", 3);
    PriceMap.put("LAPIS_LAZULI", 3);
    PriceMap.put("REDSTONE", 4);
    PriceMap.put("IRON_INGOT", 5);
    PriceMap.put("GOLD_INGOT", 6);
    PriceMap.put("DIAMOND", 8);
    PriceMap.put("EMERALD", 10);
    return PriceMap;
  },
  getVaultComponent: function() {
    var ServiceManager = Server.getServicesManager();
    var Vault = Manager.getPlugin("Vault");
    if(Vault == null) return -1;
    else {
      var RegArray = ServiceManager.getRegistrations(Vault).toArray();
      for(var x = 0; x < RegArray.length; x++) {
        var Component = RegArray[x].getProvider();
        if(Component.class.getName().contains("Economy"))
          return Component;
      }
      return 0;
    }
  },
  formatNumber: function(num) {
     num = num.toString();
     var pattern = /(-?\d+)(\d{3})/;
     while (pattern.test(num))
         num = num.replace(pattern, "$1,$2");
     return num;
  }
}

var Messages = {
  prefix: '&eColors &8&l| &f',
  getNotification: function(key) {
    return this.prefix + "&aGhi chú: &f".concat(this[key]);
  },
  getError: function(key) {
    return this.prefix + "&cLỗi: &f".concat(this[key]);
  },
  globalError: '&fHệ thống đã xảy ra trục trặc! Vui lòng liên hệ quản trị viên!',
  missingDepend: '&fMáy chủ đang thiếu plugin để dùng lệnh!',
  noPermission: '&fBạn không có quyền dùng vật phẩm này',
  invalidUsage: '&fKhông có quyền dùng vật phẩm đặc biệt...',
  notSetup: '&fBạn phải chọn loại khoáng sản muốn bán/nén block để dùng skill!',
  skippedMinerals: '&Đã bỏ qua &a$n &fkhoáng sản chưa được chọn!',
  notOnIsland: '&fBạn không còn ở trên đảo! Skill tự động tắt...',
  soldSelected: '&fĐã bán hết khoáng sản! Bạn nhận được &a$a$&f!',
}
