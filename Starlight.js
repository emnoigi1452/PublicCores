var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Host = Manager.getPlugin("PlaceholderAPI");
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");
var OreGen = Manager.getPlugin("MineblaOreGenerator");

var ChatColor = org.bukkit.ChatColor;
var Material = org.bukkit.Material;
var Location = org.bukkit.Location;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var Enchantment = org.bukkit.enchantments.Enchantment;

var System = java.lang.System;
var Runnable = java.lang.Runnable;
var HashMap = java.util.HashMap;
var ArrayList = java.util.ArrayList;
var File = java.io.File;
var SecureRandom = java.security.SecureRandom;
var JavaString = java.lang.String;
var BigInteger = java.math.BigInteger;
var Base64 = java.util.Base64;
var MessageDigest = java.security.MessageDigest;

var Compressor = {
  formatter: function(bytes) {
    // Format code taken from AuthMe, thanks :D
    return JavaString.format("\u00250" + (bytes.length << 1) + "x", new BigInteger(1, bytes));
  },
  hashUserID: function(playerName) {
    var BaseBytes = Server.getOfflinePlayer(playerName).getUniqueId().toString().getBytes();
    var HashAlgorithm = null;
    try {
      HashAlgorithm = MessageDigest.getInstance("SHA-256");
    } catch(err) { print(err); }
    var FormatByteHeader = this.formatter(Base64.getEncoder().encode(BaseBytes));
    var PreHashLayout = "$" + playerName + "$" + FormatByteHeader + "$";
    // Hashing process
    HashAlgorithm.reset(); HashAlgorithm.update(PreHashLayout.getBytes());
    var DigestedBytes = HashAlgorithm.digest();
    return this.formatter(DigestedBytes);
  },
}

function LoopList(original, startPos) {
  this.listObject = original.clone();
  this.index = startPos;
  this.product = 0;
  this.mined = 0;
  this.size = this.listObject.size();
  this.getNextInstance = function() {
    this.index++;
    if(this.index >= this.size)
      this.index = 0;
    return this.listObject.get(this.index);
  }
  this.getPreviousInstance = function() {
    this.index--;
    if(this.index < 0)
      this.index = this.size - 1;
    return this.listObject.get(this.index);
  }
  this.getLoopProgress = function() {
    return Math.round((((this.index+1)/this.size)*100), 1);
  }
  this.getLoopSize = function() {
    return this.listObject.size();
  }
  this.reset = function() {
    this.listObject = null;
    this.index = -1;
    this.size = -1;
  }
  this.update = function(list, current) {
    this.listObject = list.clone();
    this.index = current;
    this.size = this.listObject.size();
  }
}

var Database = Host.getDataFolder().getAbsolutePath().concat("/StarlightDB");

var Messenger = {
  prefix: '&5Starlight &8&l| &f',
  getError: function(stringKey) {
    return this.prefix + "&cLỗi: " + this[stringKey];
  },
  getNotification: function(stringKey) {
    return this.prefix + "&aGhi chú: " + this[stringKey];
  },
  systemError: '&fHệ thống đã gặp lỗi! Hãy báo quản trị viên...',
  noDepend: '&fKhông có đủ plugin để triển khai skill!',
  noAccess: '&fBạn không có quyền sử dụng tính năng này!',
  invalidAction: '&fKhông thể triển khai tính năng khi skill đang chạy!',
  illegalAccess: '$n &fđã cố dùng tính năng trái phép! Nên bạn ấy đã bay acc &d:)',
  locationsAssigned: '&fĐã cập nhật các block xung quanh bạn!',
  noMetadata: '&fVui lòng cập nhật vị trí đứng để dùng skill!',
  taskStarting: '&fĐang chuẩn bị khởi động skill... &8(&e30s&8)',
  alreadyActivated: '&fKĩ năng đã được kích hoạt từ trước',
  noTaskRunning: '&fHệ thống không tìm thấy skill của bạn đang chạy!',
  taskDisabled: '&fHệ thống đã tắt skill của bạn!'
}

var Utils = {
  color: function(input) { return ChatColor.translateAlternateColorCodes('&', input); },
  formatNumber: function(num) {
     num = num.toString();
     var pattern = /(-?\d+)(\d{3})/;
     while (pattern.test(num))
         num = num.replace(pattern, "$1,$2");
     return num;
  },
  checkOreGeneration: function(block) {
    var x = block.getBlockX(); var z = block.getBlockZ();
    var y = block.getBlockY();
    var f1 = new Location(block.getWorld(), x, y-1, z);
    var w1 = new Location(block.getWorld(), x, y+1, z);
    var water_types = ['STATIONARY_WATER', 'WATER'];
    if(water_types.indexOf(w1.getBlock().getType().name()) == -1)
      return false;
    return f1.getBlock().getType().name() == "FENCE";
  },
  performIslandCheckup: function(user) {
    var Grid = Skyblock.getGrid();
    var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(user);
    return SuperiorPlayer.getIsland().equals(Grid.getIslandAt(user.getLocation()));
  },
  checkBlockLocation: function(player, loc) {
    if(loc.getWorld().getName() != "SuperiorWorld")
      return false;
    var LocIsland = Skyblock.getGrid().getIslandAt(loc);
    var SP = Skyblock.getPlayers().getSuperiorPlayer(player);
    return LocIsland.equals(SP.getIsland());
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
  },
  executeSellTask: function(player, type, api) {
    var Prices = {
      COAL_ORE: 3,
      LAPIS_ORE: 3,
      REDSTONE_ORE: 4,
      IRON_ORE: 5,
      GOLD_ORE: 6,
      DIAMOND_ORE: 8,
      EMERALD_ORE: 10,
      STONE: 0.4,
    }
    function getBase(type) {
      switch(type.toUpperCase()) {
        case "STONE":
        case "COAL_ORE":
        case "IRON_ORE":
        case "GOLD_ORE":
        case "DIAMOND_ORE":
        case "EMERALD_ORE":
          return 1;
        case "LAPIS_ORE":
        case "REDSTONE_ORE":
          return new SecureRandom().nextInt(5) + 4;
        default:
          return 0;
      }
    }
    if(type == "COBBLESTONE")
      type = "STONE";
    if(type == "GLOWING_REDSTONE_ORE")
      type = "REDSTONE_ORE";
    if(Object.keys(Prices).indexOf(type) == -1)
      return new java.lang.Double('0');
    var Main = player.getInventory().getItemInMainHand().getEnchantments();
    var D = Main.getOrDefault(Enchantment.LOOT_BONUS_BLOCKS, 0);
    var L = Main.getOrDefault(Enchantment.DIG_SPEED, 1);
    var Random = new SecureRandom();
    var Start = getBase(type)*(Random.nextInt(D+1)+1)*Prices[type];
    var Stacking = Generator.getGenerationCount(L);
    for(var i = 0; i < Stacking; i++) {
      var Key = Generator.generateType("member");
      Start += getBase(Key) * (Random.nextInt(D+1)+1) * Prices[Key];
    }
    api.depositPlayer(player.getName(), new java.lang.Double(Start.toString()));
    return [Start, Stacking];
  },
  formatTime: function(input) {
    var Seconds = Math.floor(input / 1000);
    var H = Math.floor(Seconds / 3600);
    var M = Math.floor((Seconds - (H*3600))/60);
    var S = Seconds % 60; var D = Math.floor(H / 24); H = H % 24;
    var Syntax = "$0d $1h $2m $3s";
    D = D.toString(); H = H.toString(); M = M.toString(); S = S.toString();
    return Syntax.replace("$0",D).replace("$1",H).replace("$2",M).replace("$3",S);
  }
}

var Generator = {
  mainConfig: OreGen.getConfig(),
  getNodeLevel: function(player) {
    var DevMode = true;
    var verify = 'member';
    ['vip1','vip2','vip3','vip4'].forEach(function(t) {
      var compact = "MineblaOreGenerator.".concat(t);
      if(player.hasPermission(compact))
        verify = t;
    }); return DevMode ? "member" : verify;
  },
  generateType: function(node) {
    var Section = this.mainConfig.get('Generator.'.concat(node));
    if(Section == null)
      print('lmao');
    var A = ['STONE','COAL_ORE','LAPIS_ORE','REDSTONE_ORE','IRON_ORE','GOLD_ORE','DIAMOND_ORE','EMERALD_ORE'];
    var TotalStack = new java.lang.Double('0');
    A.forEach(function(n) {
      var F = new java.lang.Double(Section.get(n).toString());
      TotalStack += F;
    }); var SecureGeneration = (new SecureRandom()).nextInt(TotalStack);
    var TaskResult = 'STONE';
    for(var x = 0; x < A.length; x++) {
      var N = new java.lang.Double(Section.get(A[x]).toString());
      if(N > SecureGeneration) { TaskResult = A[x]; break; }
      SecureGeneration -= N;
    }
    return TaskResult;
  },
  getGenerationCount: function(ef) {
    var Speed = 8 + (1 + ef*ef);
    var S = (3*1.5) / Speed;
    return Math.round(Math.sqrt(1/S/5));
  }
}

function main() {
  try {
    if(Skyblock == null || OreGen == null)
      throw Messenger.getError("noDepend");
    var Folder = new File(Database);
    if(!Folder.exists()) { Folder.mkdir(); return -1; }
    // Perform access control
    var HashName = Compressor.hashUserID(Player.getName()); var Name = Player.getName();
    var FileMain = new File(Folder, HashName.concat(".yml"));
    if(!FileMain.exists()) {
      var KickModule = Java.extend(Runnable, {
        run: function() {
          // Bay acc
          Player.kickPlayer(Utils.color(Messenger['noAccess']));
        }
      }); Scheduler.runTask(Host, new KickModule()); return -1;
    } else {
      var Config = YamlConfiguration.loadConfiguration(FileMain);
      if(args.length == 0) {
        var TaskID = Config.get("Task.ID");
        if(TaskID != -1 && !Scheduler.isQueued(TaskID)) {
          var Handler = Java.extend(Runnable, {
            run: function() {
              Config.set("Task.ID", new java.lang.Integer("-1"));
              Config.set("Task.Start", new java.lang.Long("-1"));
              Config.save(FileMain);
            }
          }); Scheduler.runTask(Host, new Handler());
        }
        return 0;
      }
      switch(args[0].toLowerCase()) {
        case "assign-loc":
          var Center = Player.getLocation().clone(); var Block_Y = Center.getBlockY() + 1;
          var X_Start = Center.getBlockX() + 20; var X_End = Center.getBlockX() - 20;
          var Z_Start = Center.getBlockZ() + 20; var Z_End = Center.getBlockZ() - 20;
          var Blocks = new ArrayList();
          var Assignment = Java.extend(Runnable, {
            run: function() {
              for(var i = X_Start; i >= X_End; i--) {
                for(var j = Z_Start; j >= Z_End; j--) {
                  var B = new Location(Center.getWorld(), i, Block_Y, j);
                  if(!Utils.checkOreGeneration(B) || !Utils.checkBlockLocation(Player, B))
                    continue
                  else Blocks.add(B);
                }
              }
              var Meta = new FixedMetadataValue(Host, new LoopList(Blocks, Blocks.size() - 1));
              Player.setMetadata("StarlightCore", Meta);
              Player.sendMessage(Utils.color(Messenger.getNotification("locationsAssigned")));
            }
          }); Scheduler.runTask(Host, new Assignment()); return 0;
        case "skill":
          var VaultEco = Utils.getVaultComponent();
          var RefreshTask = Java.extend(Runnable, {
            run: function() {
              if(!Player.hasMetadata("StarlightCore"))
                Player.sendMessage(Utils.color(Messenger.getError("noMetadata")));
              else {
                var Loop = Player.getMetadata("StarlightCore").get(0).value();
                Loop.product = 0; Loop.mined = 0;
                var Collection = Loop.listObject; var Processed = new ArrayList();
                Collection.stream().forEach(function(loc) {
                  if(Utils.checkOreGeneration(loc) && Utils.checkBlockLocation(Player, loc));
                    Processed.add(loc);
                });
                if(Processed.size() == 0)
                  Player.sendMessage(Utils.color(Messenger.getError("noMetadata")));
                Loop.update(Processed, Processed.size());
              }
            }
          }); Scheduler.runTask(Host, new RefreshTask());
          var HostID = Player.getName(); var Task = -1;
          var Execution = Java.extend(Runnable, {
            run: function() {
              if(Player.getMetadata("StarlightCore").get(0).value().getLoopSize() == 0) {
                Player.sendMessage(Utils.color(Messenger.getNotification("noMetadata")));
                Task = Config.get("Task.ID");
                Config.set("Task.ID", new java.lang.Integer(-1));
                Config.set("Task.Start", new java.lang.Long(-1));
                Config.save(FileMain);
                Scheduler.cancelTask(Task);
              }
              if(!Server.getOfflinePlayer(HostID).isOnline()) {
                Task = Config.get("Task.ID");
                Config.set("Task.ID", new java.lang.Integer(-1));
                Config.set("Task.Start", new java.lang.Long(-1));
                Config.save(FileMain);
                print(Utils.color(Messenger.getError("consoleNoteOffline").replace("$p", HostID)));
                Scheduler.cancelTask(Task);
              }
              if(!Utils.performIslandCheckup(Player)) {
                Task = Config.get("Task.ID");
                Config.set("Task.ID", new java.lang.Integer(-1));
                Config.set("Task.Start", new java.lang.Long(-1));
                Config.save(FileMain);
                Player.sendMessage(Utils.color(Messenger.getNotification("notOnIsland")));
                Scheduler.cancelTask(Task);
              }
              var Post = Player.getMetadata("StarlightCore").get(0).value();
              var L = Post.getNextInstance(); var T = L.getBlock().getType().name();
              var Received = Utils.executeSellTask(Player, T, VaultEco);
              Post.product += Received[0]; Post.mined += Received[1];
              var GenType = Generator.generateType(Generator.getNodeLevel(Player));
              L.getBlock().setType(Material.getMaterial(GenType));
            }
          });
          if(([0,-1]).indexOf(Config.get("Task.ID")) == -1)
            Player.sendMessage(Utils.color(Messenger.getError("alreadyActivated")));
          else {
            Player.sendMessage(Utils.color(Messenger.getNotification("taskStarting")));
            var Prep = new java.lang.Long("20"); var Interval = new java.lang.Long('4');
            var Instance = Scheduler.runTaskTimer(Host, new Execution(), Prep, Interval);
            Config.set("Task.ID", Instance.getTaskId());
            Config.set("Task.Start", System.currentTimeMillis());
            Config.save(FileMain);
            return 0;
          }
          return -1;
        case "stop-task":
          var ID = Config.get("Task.ID");
          if(ID == -1 || ID == 0)
            Player.sendMessage(Utils.color(Messenger.getError("noTaskRunning")));
          else {
            Scheduler.cancelTask(ID); var Source = Player.getMetadata("StarlightCore").get(0).value()
            Source.product = 0; Source.mined = 0; Source.index = Source.getLoopSize();
            var Handler = Java.extend(Runnable, {
              run: function() {
                ['ID', 'Start'].forEach(function(k) {
                  Config.set("Task.".concat(k), new java.lang.Long('0'));
                }); Config.save(FileMain);
                Player.sendMessage(Utils.color(Messenger.getNotification("taskDisabled")));
              }
            }); Scheduler.runTask(Host, new Handler());
          }; return 0;
        case "placeholder":
          switch(args[1].toLowerCase()) {
              case "id":
                return Config.get("Task.ID");
              case "start-time":
                if(([0, -1]).indexOf(Config.get("Task.ID")) != -1)
                  return "&c----";
                var DateFormat = new java.text.SimpleDateFormat("HH:mm:ss dd/MM/yyyy");
                var Time = new java.util.Date(new java.lang.Long(Config.get("Task.Start").toString()));
                return "&a" + DateFormat.format(Time);
              case "runtime":
                if(([0, -1]).indexOf(Config.get("Task.ID")) != -1)
                  return 0;
                var Uptime = (System.currentTimeMillis() - Config.get("Task.Start"));
                return Utils.formatTime(Uptime);
              case "block-count":
                if(!Player.hasMetadata("StarlightCore"))
                  return 0;
                return Utils.formatNumber(Player.getMetadata("StarlightCore").get(0).value().getLoopSize());
              case "sold":
                if(([0, -1]).indexOf(Config.get("Task.ID")) != -1)
                  return 0;
                else
                  return Utils.formatNumber(Math.round(Player.getMetadata("StarlightCore").get(0).value().product));
              case "mined":
                if(([0, -1]).indexOf(Config.get("Task.ID")) != -1)
                  return 0;
                else
                  return Utils.formatNumber(Math.round(Player.getMetadata("StarlightCore").get(0).value().mined));
              case "running": return ([0,-1]).indexOf(Config.get("Task.ID")) == -1;
              case "assigned": return Player.hasMetadata("StarlightCore");

          }
      }
    }
  } catch(err) {
    Player.sendMessage(Utils.color(Messenger.getError("systemError")));
    return err;
  }
}
main();
