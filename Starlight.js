var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Host = Manager.getPlugin("PlaceholderAPI");
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");

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
    var BaseBytes = playerName.getBytes();
    var HashAlgorithm = null;
    try {
      HashAlgorithm = MessageDigest.getInstance("SHA-256");
    } catch(err) { print(err); }
    var FormatByteHeader = this.formatter(Base64.getEncoder().encode(BaseBytes));
    var PreHashLayout = playerName + "_" + FormatByteHeader;
    // Hashing process
    HashAlgorithm.reset(); HashAlgorithm.update(PreHashLayout.getBytes());
    var DigestedBytes = HashAlgorithm.digest();
    return this.formatter(DigestedBytes);
  },
}

function LoopList(original, startPos) {
  this.listObject = original.clone();
  this.index = startPos;
  this.size = this.listObject.size();
  this.getNextInstance = function() {
    this.index++;
    if(this.index == this.size)
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
  illegalAccess: '$n &fđã cố dùng tính năng trái phép! Nên bạn ấy đã bay acc &d:)',
  locationsAssigned: '&fĐã cập nhật các block xung quanh bạn!',
  noMetadata: '&fVui lòng cập nhật vị trí đứng để dùng skill!',
  taskStarting: '&fĐang chuẩn bị khởi động skill... &8(&e30s&8)',
  alreadyActivated: '&fKĩ năng đã được kích hoạt từ trước',
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
  }
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
  processPrice: function(player, type) {
    if(type == "COBBLESTONE")
      type = "STONE";
    var Prices = {
      COAL_ORE: 3,
      LAPIS_ORE: 3,
      REDSTONE_ORE: 4,
      IRON_ORE: 5,
      GOLD_ORE: 6,
      DIAMOND: 8,
      EMERALD: 10,
      STONE: 0.1,
    }
    if(Object.keys(Prices).indexOf(type) == -1)
      return new java.lang.Double('0');
    var Main = player.getInventory().getItemInMainHand().getEnchantments();
    var D = Main.containsKey(Enchantment.LOOT_BONUS_BLOCK) ? Main.get(Enchantment.LOOT_BONUS_BLOCKS) : 0;
    var Drops = (new SecureRandom()).nextInt(D+1) + 1;
    return new java.lang.Double((Prices[type]*Drops).toString());
  }  
}
 
function main() {
  try {
    if(Skyblock == null)
      throw Messenger.getError("noDepend");
    var Folder = new File(Database);
    if(!Folder.exists()) { Folder.mkdir(); return -1; }
    // Perform access control
    var HashName = Compressor.hashUserID(Player.getName());
    var File = new File(Folder, HashName.concat(".yml"));
    if(!File.exists()) {
      print(Utils.color(Messenger.getError("illegalAccess").replace("$p", Player.getName())));
      var KickModule = Java.extend(Runnable, {
        run: function() {
          // Bôi nhọ danh dự lmao
          Server.broadcastMessage(Utils.color(
            Messenger.getNotification("illegalAccess").replace("$p", Player.getName())));
          // Bay acc
          Player.kickPlayer(Utils.color(Messenger['noAccess']));
        }
      }); Scheduler.runTask(Host, new KickModule()); return -1;
    } else {
      var Config = YamlConfiguration.loadConfiguration(File);
      if(args.length == 0) {
        var TaskID = Config.get("Task.ID");
        if(TaskID != -1 && !Scheduler.isQueued(TaskID)) {
          var Handler = Java.extend(Runnable, {
            Config.set("Task.ID", new java.lang.Integer("-1"));
            Config.set("Task.Start", new java.lang.Long("-1"));
            Config.set("Task.Earned", new java.lang.Double("0"))l
            Config.save(File);
          }); Scheduler.runTask(Host, new Handler());
        }
        return 0;
      }
      switch(args[0].toLowerCase()) {
        case "assignLoc":
          var Center = Player.getLocation().clone(); var Block_Y = Center.getBlockY() + 2;
          var X_Start = Center.getBlockX() + 20; var X_End = Center.getBlockX() - 20;
          var Z_Start = Center.getBlockZ() + 20; var Z_End = Center.getBlockZ(); - 20;
          var Blocks = new ArrayList();
          var Assignment = Java.extend(Runnable, {
            run: function() {
              for(var i = X_Start; i >= X_End; i--) {
                for(var j = Z_Start; j >= Z_End; j--) {
                  var B = new Location(Center.getWorld(), i, Block_Y, j);
                  if(!Utils.checkOreGeneration(B) || !Utils.checkBlockLocation(Player, B));
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
                var Collection = Loop.listObject; var Processed = new ArrayList();
                Collection.stream.forEach(function(loc) {
                  if(Utils.checkOreGeneration(loc)) Processed.add(loc);
                });
                if(Processed.size() == 0)
                  Player.sendMessage(Utils.color(Messenger.getError("noMetadata")));
              }
            }
          }); Scheduler.runTask(Host, new RefreshTask()); 
          var HostID = Player.getName(); var Task = -1;
          var Execution = Java.extend(Runnable, {
            run: function() {
              if(!Server.getOfflinePlayer(HostID).isOnline()) {
                Task = Config.get("Task.ID");
                Config.set("Task.ID", new java.lang.Integer(-1));
                Config.set("Task.Start", new java.lang.Long(-1));
                Config.save(File);
                print(Utils.color(Messenger.getError("consoleNoteOffline").replace("$p", HostID)));
                Scheduler.cancelTask(Task);
              }
              if(!Utils.performIslandCheckup(Player)) {
                Task = Config.get("Task.ID");
                Config.set("Task.ID", new java.lang.Integer(-1));
                Config.set("Task.Start", new java.lang.Long(-1));
                Config.save(File);
                Player.sendMessage(Utils.color(Messenger.getNotification("notOnIsland")));
                Scheduler.cancelTask(Task);
              }
              var Post = Player.getMetadata("StarlightCore").get(0).value();
              var L = Post.getNextInstance(); var T = L.getBlock().getType().name();
              var Received = Utils.processPrice(Player, T);
              var Post = Config.get("Task.Earned"); Post += Received;
              VaultEco.depositPlayer(HostID, Received); Config.set("Task.Earned", Post);
              Config.save(); L.getBlock().setType(Material.AIR);
            }
          });
          if(Config.get("Task.ID") != -1)
            Player.sendMessage(Utils.color(Messenger.getError("alreadyActivated")));
          else {
            Player.sendMessage(Utils.color(Messenger.getNotification("taskStarting")));
            var Prep = new java.lang.Long("600"); var Interval = new java.lang.Long('4');
            var Instance = Scheduler.runTaskTimer(Host, new Execution(), Prep, Interval);
            Config.set("Task.ID", Instance.getTaskId());
            Config.set("Task.Start", System.currentTimeMillis());
            Config.set("Task.Earned", 0); Config.save(File);
            Config.save(0); return 0;
          }
          return -1;
      }
    }
  } catch(err) {
    Player.sendMessage(Utils.color(Messenger.getError("systemError")));
    return err;
  }
}
