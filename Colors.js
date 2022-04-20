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
var Runnable = java.lang.Runnable;
var HashMap = java.util.HashMap;
var ArrayList = java.util.ArrayList;
var File = java.io.File;
/*
var BufferedWriter = java.io.BufferedWriter;
var FileWriter = java.io.FileWriter;
var BufferedReader = java.io.BufferedReader;
var FileReader = java.io.FileWriter;
*/

var DataContainer = Host.getDataFolder().getAbsolutePath().concat("/Color_Drops");
load('https://pastebin.com/raw/k4XhJdff'); // Import CompressorAPI

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
    return SuperiorPlayer.getIsland().equals(Grid.getIslandAt(user.getLocation()));
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
      default: return "invalid";
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
  prefix: '&dColors &8&l| &f',
  getNotification: function(key) {
    return this.prefix + "&aGhi chú: &f".concat(this[key]);
  },
  getError: function(key) {
    return this.prefix + "&cLỗi: &f".concat(this[key]);
  },
  globalError: '&fHệ thống đã xảy ra trục trặc! Vui lòng liên hệ quản trị viên!',
  missingDepend: '&fMáy chủ đang thiếu plugin để dùng lệnh!',
  noPermission: '&fBạn không có quyền dùng tính năng này',
  invalidUser: '&fNgười chơi &a$p &fđang cố dùng &dColors &f- &6Vividly &ftrái phép!',
  invalidUsage: '&fKhông có quyền dùng vật phẩm đặc biệt...',
  notSetup: '&fBạn phải chọn loại khoáng sản muốn bán/nén block để dùng skill!',
  alreadyActivated: '&fSkill của bạn đã kích hoạt từ trước rồi!',
  skillExecuted: '&6&o"Sắc Hoàng Kim" &fđã được triển khai!',
  skippedMinerals: '&fĐã bỏ qua &a$n &fkhoáng sản chưa được chọn!',
  notOnline: '&fSkill của &a$p &ftự động tắt do người chơi đã thoát!',
  notOnIsland: '&fBạn không còn ở trên đảo! Skill tự động tắt...',
  soldSelected: '&fĐã bán hết khoáng sản! Bạn nhận được &a$a$&f!',
  noActiveTask: '&fHiện tại skill của bạn chưa được kích hoạt &d:)',
  skillDeactivated: '&fĐã tắt kĩ năng &f- &6&oGolden &d&oHaze&f&o...',
  invalidType: '&fLoại khoáng sản không hợp lệ!',
  invalidNode: '&fBộ xử lý không hợp lệ! Hãy thử lại'
}

function main() {
  try {
    if(Skyblock == null || PreventHopper == null)
      throw Messages.getError('missingDepend');
    // Check and initialize pickaxe's database file
    var Database = new File(DataContainer);
    if(!Database.exists()) { Database.mkdir(); return -1; }
    /* -------------------------------------------------- */
    var FileID = Compressor.hashUserID(Player.getName()).concat(".yml");
    if(!(new File(Database, FileID).exists())) {
      print(Utils.color(Messages.getNotification("invalidUser").replace("$p", Player.getName())));
      var KickTask = Java.extend(Runnable, {
        run: function() {
          Player.kickPlayer(Utils.color(Messages.getError("invalidUsage")));
        }
      }); Scheduler.runTask(Host, new KickTask());
      return false;
    } else {
      if(args.length == 0) {
        var ScheduledSavedTaskID = config.get("Task.ID");
        if(ScheduledSavedTaskID != -1 && !(Scheduler.isQueued(ScheduledSavedTaskID))) {
          (['ID','Start','Upcoming']).forEach(function(e) {
            config.set("Task.".concat(e), new java.lang.Long("-1"));
          }); config.save(userData);
          Scheduler.cancelTask(ScheduledSavedTaskID);
        } 
      }
      var userData = new File(DataContainer, FileID); var config = YamlConfiguration.loadConfiguration(userData);
      switch(args[0].toLowerCase()) {
        case "skill":
          var PlayerData = Player.getMetadata("playerData").get(0).value();
          var Vault_Economy = Utils.getVaultComponent(); var Setup = false;
          Utils.typeArray.forEach(function(type) {
            var FormattedKey = Utils.getPHKey(type);
            if(config.get("Nodes.".concat(FormattedKey)) != "none")
              Setup = true;
          });
          if(!Setup) Player.sendMessage(Utils.color(Messages.getError("notSetup")));
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
              Player.sendMessage(Utils.color(Messages.getNotification("skippedMinerals").replace("$n", Skipped.toString())));
            var SkillExecutorName = Player.getName();
            var SkillTask = Java.extend(Runnable, {
              run: function() {
                /* Nếu người dùng không online, tắt skill */
                if(!BukkitServer.getOfflinePlayer(SkillExecutorName).isOnline()) {
                  var TaskID = config.get("Task.ID");
                  config.set("Task.ID", new java.lang.Long(-1)); 
                  config.set("Task.Upcoming", new java.lang.Long(-1));
                  config.set("Task.Start", new java.lang.Long(-1));
                  config.save(userData);
                  print(Utils.color(Messages.getNotification("notOnline").replace("$p", SkillExecutorName)));
                  Scheduler.cancelTask(TaskID); return;
                }
                /* Nếu người dùng không có trên đảo của mình, tắt skill */
                if(!Utils.performIslandCheckup(Player)) {
                  var TaskID = config.get("Task.ID");
                  Player.sendMessage(Utils.color(Messages.getNotification("notOnIsland")));
                  config.set("Task.ID", new java.lang.Long(-1)); 
                  config.set("Task.Upcoming", new java.lang.Long(-1));
                  config.save(userData);
                  Scheduler.cancelTask(TaskID); return;
                }
                config.set("Task.Upcoming", new java.lang.Long(System.currentTimeMillis()+(Utils.delay*1000))); config.save(userData);
                if(!Economy.isEmpty()) {
                  var TotalDeposit = 0; var Prices = Utils.getPriceTable();
                  Economy.stream().forEach(function(economyType) {
                    TotalDeposit += PlayerData.getBlock(economyType)*Prices.get(economyType);
                    PlayerData.setBlock(economyType, new java.lang.Integer(0));
                  });
                  Player.sendMessage(Utils.color(
                    Messages.getNotification('soldSelected').replace("$a", Utils.formatNumber(TotalDeposit))));
                  Vault_Economy.depositPlayer(SkillExecutorName, TotalDeposit);
                }
                if(!Compression.isEmpty()) {
                  Compression.stream().forEach(function(type) {
                    var ParsingParam = type.split("_")[0].toLowerCase();
                    var Syntax = "javascript_prevent-block_condense,$t".replace("$t", ParsingParam);
                    PlaceholderAPI.static.setPlaceholders(Player, "%" + Syntax + "%");
                  });
                }
              }
            });
            if(config.get("Task.ID") == -1) {
              var Delay = new java.lang.Long("60"); var Cooldown = new java.lang.Long((Utils.delay*20).toString())
              var StartedTask = Scheduler.runTaskTimer(Host, new SkillTask(), Delay, Cooldown);
              config.set("Task.ID", StartedTask.getTaskId()); config.set("Task.Start", System.currentTimeMillis());
              config.set("Task.Upcoming", new java.lang.Long(System.currentTimeMillis()+(3*1000)));
              config.save(userData);
              Player.sendMessage(Utils.color(Messages.getNotification("skillExecuted"))); return 0;
            } else {
              Player.sendMessage(Utils.color(Messages.getError("alreadyActivated")));
            }
          }; return -1;
        case "placeholders":
          switch(args[1].toLowerCase()) {
            case "status":
              var runningID = config.get("Task.ID");
              var running = "&fĐang hoạt động &a&l✔"
              var stopped = "&fKhông hoạt động &c&l✘";
              return runningID == -1 ? stopped : running;
            case "id": return config.get("Task.ID");
            case "start":
              if(config.get("Task.ID") == -1) return "&c----";
              var DateFormat = new java.text.SimpleDateFormat("HH:mm:ss dd/MM/yyyy");
              var Time = new java.util.Date(new java.lang.Long(config.get("Task.Start").toString()));
              return "&a" + DateFormat.format(Time);
            case "upcoming":
              if(config.get("Task.Upcoming") == -1) return "&a0s";
              var Current = System.currentTimeMillis(); var Upcoming = config.get("Task.Upcoming");
              var Seconds = Math.round((Upcoming - Current) / 1000);
              var Min = Math.floor(Seconds / 60); var Secs = Seconds % 60;
              if(Min < 0) return "&f&oĐang xử lí...";
              return "&a$mm $ss".replace("$m", Min.toString()).replace("$s", Secs.toString());
            case "handle":
              var handleProcess = Utils.getPHKey(args[2]);
              switch(config.get("Nodes.".concat(handleProcess))) {
                case "craft": return "&fNén khối &b◈";
                case "sell": return "&fBán &a&l$";
                default: return "&7Bỏ qua";
              }
            default: return -1;
          }
          return 0;
        case "cancel-task":
          if(config.get("Task.ID") == -1) {
            Player.sendMessage(Utils.color(Messages.getError("noActiveTask")));
          } else {
            var SyncID = config.get("Task.ID");
            (['ID','Start','Upcoming']).forEach(function(param) {
              config.set("Task.".concat(param), new java.lang.Long("-1"));
            }); config.save(userData);
            Scheduler.cancelTask(new java.lang.Integer(SyncID.toString()));
            Player.sendMessage(Utils.color(Messages.getNotification("skillDeactivated"))); return 0;
          }
          return -1;
        case "switch-handle":
          var type = args[1].toLowerCase(); var handler = args[2].toLowerCase();
          var TrueKey = Utils.getPHKey(type);
          if(TrueKey == "invalid") throw Messages.getError("invalidType");
          if((['craft','sell','none']).indexOf(handler) == -1) throw Messages.getError("invalidNode");
          switch(handler) {
            case "sell": config.set("Nodes.".concat(TrueKey), handler); config.save(userData); return 0;
            case "craft":
              if(!Player.hasPermission("viewer.daituong")) {
                Player.sendMessage(Utils.color(Messages.getError("noPermission")));
                return -1;
              } else {
                config.set("Nodes.".concat(TrueKey), handler); config.save(userData); return 0;
              }
            default: config.set("Nodes.".concat(TrueKey), handler); config.save(userData); return 0;
          };
      }
      return 0;
    }
  } catch(err) {
    Player.sendMessage(Utils.color(Messages.getError("globalError")));
    return err;
  }
}


main();
