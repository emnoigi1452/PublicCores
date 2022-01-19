var Player = BukkitPlayer;
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var Host = Manager.getPlugin("PlaceholderAPI");
var HostDatabase = Host.getDataFolder().getAbsolutePath().concat("/TetPickaxe");
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");

var File = Java.type("java.io.File");
var System = Java.type("java.lang.System");
var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");
var Calendar = Java.type("java.util.Calendar");
var ArrayList = Java.type("java.util.ArrayList");
var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");

if(!new File(HostDatabase).exists()) new File(HostDatabase).mkdir();

var ChatColor = org.bukkit.ChatColor;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var Material = org.bukkit.Material;
var Enchantment = org.bukkit.enchantments.Enchantment;

var FileFormatter = new SimpleDateFormat("dd_MM_yyyy");
var MaxPerDay = 500000; var DefaultPerDay = 10000;

var SkillHandle = {
  verifiedLore: ChatColor.translateAlternateColorCodes('&', "&8&l[&bĐã khóa sử dụng&8&l]"),
  generateNewDate: function(dateFile, info) {
    var list = YamlConfiguration.loadConfiguration(info); var DataKey = "Usage.";
    var newUsage = YamlConfiguration.loadConfiguration(dateFile);
    for each(var key in list.getConfigurationSection("Limits").getKeys(false)) {
      newUsage.set(DataKey.concat(key), 0);
    }; newUsage.save(dateFile); return dateFile;
  },
  handleTranslation: function(param) {
    switch(param.toLowerCase()) {
      case "coal": return "&8Khối Than";
      case "lapis": return "&9Khối Lưu Ly";
      case "redstone": return "&4Khối Đá Đỏ";
      case "iron": return "&fKhối Sắt";
      case "gold": return "&6Khối Vàng";
      case "diamond": return "&bKhối Kim Cương";
      case "emerald": return "&2Khối Lục Bảo";
      default: throw "&fLoại khoáng sản không hợp lệ!";
    }
  },
  reloadKeys: function(param) {
    switch(param.toLowerCase()) {
      case "coal_block":
      case "redstone_block":
      case "diamond_block":
      case "emerald_block":
        return param.split("_")[0].toUpperCase();
      case "iron_block":
      case "gold_block":
        return param.split("_")[0].concat("_INGOT").toUpperCase();
      case "lapis_block":
        return "LAPIS_LAZULI";
      default: throw "&fLoại khoáng sản không hợp lệ!";
    }
  },
  calculatedXP: function(target) {
    var Level = target.getLevel(); var XPPoints = 0;
    if(Level >= 32)
      XPPoints = Math.round((4.5*(Level*Level)) - (162.5*Level) + 2220);
    else if(Level >= 17 && Level <= 31)
      XPPoints = Math.round((2.5*(Level*Level)) - (40.5*Level) + 360);
    else
      XPPoints = Math.round((Level*Level) + (6*Level));
    var Progress = target.getExp(); var RequiredUp = 0;
    if(Level >= 31)
      RequiredUp = (9 * Level) - 158;
    else if(Level >= 16 && Level <= 30)
      RequiredUp = (5 * Level) - 38;
    else
      RequiredUp = (2 * Level) + 7;
    XPPoints += Math.round(RequiredUp * Progress);
    return Math.floor(XPPoints);
  }
}

function main() {
  try {
    var UserInfo = new File(HostDatabase + "/Users.yml");
    var Logs = new File(HostDatabase.concat("/Logs"));
    var ShardManager = new File(HostDatabase.concat("/Shards.yml"));
    var XPVault = new File(HostDatabase.concat("/XPVault.yml"))
    if(!UserInfo.exists()) {
      UserInfo.createNewFile();
      var TempConfig = YamlConfiguration.loadConfiguration(UserInfo);
      // Default creator value :)
      TempConfig.set("Limits.DucTrader", DefaultPerDay);
      TempConfig.save(UserInfo);
    }
    if(!ShardManager.exists()) {
      ShardManager.createNewFile();
      var ShardConfig = YamlConfiguration.loadConfiguration(ShardManager);
      // Set default creator value
      ShardConfig.set("Database.DucTrader", 0); ShardConfig.set("Progress.DucTrader", 0);
      ShardConfig.save(ShardManager);
    }
    if(!XPVault.exists()) {
      XPVault.createNewFile();
      var VaultConfig = YamlConfiguration.loadConfiguration(XPVault);
      VaultConfig.set("Vault.DucTrader", 0);
      VaultConfig.save(XPVault);
    }
    if(!Logs.exists()) Logs.mkdir();
    var Time = Calendar.getInstance().getTime();
    var LogName = FileFormatter.format(Time).concat(".yml");
    var TodayLog = new File(Logs.getAbsolutePath(), LogName);
    if(!TodayLog.exists())
      TodayLog = SkillHandle.generateNewDate(TodayLog, UserInfo);
    switch(args[0].toLowerCase()) {
      case "verify":
        var Hand = Player.getInventory().getItemInMainHand();
        if(Hand == null) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fBạn phải cầm vật phẩm muốn xác nhận!"));
          return -1;
        }
        var Meta = Hand.getItemMeta(); 
        if(Meta == null) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fVật phẩm không thể tiến hành xác nhận skill!"));
          return -1;
        }   
        var Enchs = Meta.getEnchants();
        if(!Enchs.keySet().contains(Enchantment.LUCK) || Enchs.get(Enchantment.LUCK) != 727) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fVật phẩm không thể tiến hành xác nhận skill!"));
          return -1;
        }
        var ItemLore = Meta.getLore();
        if(ItemLore != null && ItemLore.contains(SkillHandle.verifiedLore)) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fVật phẩm đã bị khóa sử dụng!"));
          return -1;
        }
        if(ItemLore == null) ItemLore = new ArrayList();
        ItemLore.add(SkillHandle.verifiedLore);
        Meta.setLore(ItemLore); Hand.setItemMeta(Meta);
        var UserConfig = YamlConfiguration.loadConfiguration(UserInfo);
        UserConfig.set("Limits.".concat(Player.getName()), DefaultPerDay);
        UserConfig.save(UserInfo);
        Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
          "&eLucky&cVN &8&l| &fĐã xác nhận vật phẩm thành công!"));
        return 0;
      case "skill":
        var Configuration = YamlConfiguration.loadConfiguration(UserInfo); var Grid = Skyblock.getGrid();
        if(!Configuration.getConfigurationSection("Limits.").getKeys(false).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền sử dụng vật phẩm này!"));
          return -1;
        }
        var Hand = Player.getInventory().getItemInMainHand();
        if(Hand == null || Hand.getItemMeta() == null || Hand.getItemMeta().getLore() == null ||
          !Hand.getItemMeta().getLore().contains(SkillHandle.verifiedLore)) {
            Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
              "&eLucky&cVN &8&l| &cLỗi: &fVật phẩm không hợp lệ! Vui lòng nhấn &a/kichhoat &fđể kích hoạt cúp!"));
          return -1;
        }
        if(!Player.hasMetadata("AutoBuild")) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLuckyVN &8&l| &cLỗi: &fBạn chưa chọn khối để tiến hành dùng skill!"));
          return -1;
        }
        var LogConfig = YamlConfiguration.loadConfiguration(TodayLog);
        var LimitControl = YamlConfiguration.loadConfiguration(UserInfo);
        var LimitPerDay = LimitControl.get("Limits.".concat(Player.getName()));
        var CurrentBuild = LogConfig.get("Usage.".concat(Player.getName()));
        var ProgressConfig = YamlConfiguration.loadConfiguration(ShardManager);
        if(CurrentBuild >= LimitPerDay) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
            "&eLucky&cVN &8&l| &cLỗi: &fBạn đã đạt giới hạn sử dụng cho hôm nay!"));
          return -1;
        }
        //return CurrentBuild >= LimitPerDay;
        var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(Player);
        var AutoBuildTask = Java.extend(Runnable, {
          run: function() {
            var Storage = Player.getMetadata("playerData").get(0).value();
            var BuildType = Player.getMetadata("AutoBuild").get(0).value();
            var NewKey = SkillHandle.reloadKeys(BuildType);
            var BlockValue = Math.floor(Storage.getBlock(NewKey) / 9);
            if(BlockValue == 0) {
              Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
                "&eLucky&cVN &8&l| &cLỗi: &fBạn không có đủ " + SkillHandle.hanhandleTranslation(BuildType.split("_")[0])
                + " &ftrong kho để dùng skill!")); return;
            }
            var CanBuild = LimitPerDay - CurrentBuild;
            BlockValue = BlockValue > CanBuild ? CanBuild : BlockValue;
            var Tracker = ProgressConfig.get("Progress.".concat(Player.getName()));
            var Increment = [Math.floor((Tracker + BlockValue) / 1000), (Tracker + BlockValue) % 1000];
            var UpdateDatabase = ProgressConfig.get("Database.".concat(Player.getName())) + Increment[0];
            if(Increment[0] > 0)
              Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
                "&eLucky&cVN &8&l| &fBạn đã nhận được &a" + Increment[0].toString() + " &eMảnh vỡ&f!"));
            ProgressConfig.set("Progress.".concat(Player.getName()), Increment[1]);
            ProgressConfig.set("Database.".concat(Player.getName()), UpdateDatabase);
            ProgressConfig.save(ShardManager); var Build = false; var Default = Storage.getBlock(NewKey);
            Storage.setBlock(NewKey, Default - (BlockValue*9));
            for each(var BlockLocation in Grid.getStackedBlocks()) {
              if(Grid.getIslandAt(BlockLocation).equals(SuperiorPlayer.getIsland())) {
                var Type = BlockLocation.getBlock().getType().name();
                if(Type != BuildType) continue;
                else {
                  var Amount = Grid.getBlockAmount(BlockLocation);
                  Grid.setBlockAmount(BlockLocation.getBlock(), Amount + BlockValue);
                  LogConfig.set("Usage.".concat(Player.getName()), Math.floor(CurrentBuild + BlockValue));
                  LogConfig.save(TodayLog); Build = true;
                  Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
                    "&eLucky&cVN &8&l| &fĐã đặt &a" + BlockValue.toString().concat(" ") +
                    SkillHandle.handleTranslation(BuildType.split("_")[0]) + " &flên đảo của bạn!"));
                  break;
                }
              } else continue;
            }
            if(!Build) {
              Player.sendMessage(ChatColor.translateAlternateColorCodes('&', 
                "&eLucky&cVN &8&l| &cLỗi: &fKhông tìm thấy bất kì " + SkillHandle.handleTranslation(BuildType.split("_")[0])
                + " &ftrên đảo của bạn!"));
              Storage.setBlock(NewKey, Default);
            }
          }
        }); Scheduler.runTask(Host, new AutoBuildTask()); return 0;
      case "usage-check":
        if(!YamlConfiguration.loadConfiguration(UserInfo).getConfigurationSection("Limits").getKeys(true).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
          return -1;
        }
        var Limit = YamlConfiguration.loadConfiguration(UserInfo).get("Limits.".concat(Player.getName()));
        var Usage = YamlConfiguration.loadConfiguration(TodayLog).get("Usage.".concat(Player.getName()));
        Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
          "&eLucky&cVN &8&l| &fCúp hôm nay đã đặt: &a" + Usage.toString() + "&f/&e" + Limit.toString() + " &fblock"));
        return -1;
      case "set-block":
        if(!YamlConfiguration.loadConfiguration(UserInfo).getConfigurationSection("Limits").getKeys(true).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
          return -1;
        }
        var Valid = ['coal', 'lapis', 'redstone', 'iron', 'gold', 'diamond', 'emerald'];
        if(Valid.indexOf(args[1].toLowerCase()) == -1) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fLoại khối không hợp lệ!"));
          return -1;
        }
        var Meta = new FixedMetadataValue(Host, args[1].toUpperCase().concat("_BLOCK"));
        Player.setMetadata("AutoBuild", Meta);
        Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
          "&eLucky&cVN &8&l| &fĐã chuyển cúp sang chế độ xử lí " + SkillHandle.handleTranslation(args[1].toLowerCase())));
        return 0;
      case "deposit-xp":
        if(!YamlConfiguration.loadConfiguration(UserInfo).getConfigurationSection("Limits").getKeys(true).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
          return -1;
        }
        var PlayerXPPoints = SkillHandle.calculatedXP(Player);
        var Vault = YamlConfiguration.loadConfiguration(XPVault); var Base = Vault.get("Vault.".concat(Player.getName()));
        Vault.set("Vault.".concat(Player.getName()), Base + PlayerXPPoints);
        Player.setLevel(0); Player.setExp(0.0); Vault.save(XPVault);
        Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
          "&eLucky&cVN &8&l| &fĐã gửi &a" + PlayerXPPoints.toString() + " &fvào thùng XP của cúp!"));
        return 0;
      case "upgrade":
        if(!YamlConfiguration.loadConfiguration(UserInfo).getConfigurationSection("Limits").getKeys(true).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
          return -1;
        }
        var UpgradePurse = YamlConfiguration.loadConfiguration(ShardManager);
        var VaultInstance = YamlConfiguration.loadConfiguration(XPVault);
        var Level = Math.floor(YamlConfiguration.loadConfiguration(UserInfo).get("Limits.".concat(Player.getName())) / 10000);
        if(Level == 50 || YamlConfiguration.loadConfiguration(UserInfo).get("Limits.".concat(Player.getName())) >= MaxPerDay) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fCúp đã đạt tới giới hạn nâng cấp!"));
          return -1;
        }
        // Requirements to upgrade includes shards and player exp, try to write a formula that's hard to grind
        var BitWriter = function(num) {
          var bitArray = [];
          while([0,1].indexOf(num) == -1) {
            bitArray.push((num % 2).toString());
            num = Math.floor(num / 2);
          }; bitArray.push(num.toString());
          return bitArray.reverse();
        }
        var XP = (Math.floor(Math.sqrt((Level+1)*Math.pow(10, BitWriter(Level).length >> 1))) << BitWriter(Level+1).length) * 1000;
        var Shards = (Math.floor(Math.sqrt((Level+1)*8)) << BitWriter((Level+1)*3).length);
        var ShardBalance = UpgradePurse.get("Database.".concat(Player.getName()));
        var XPBalance = VaultInstance.get("Vault.".concat(Player.getName()));
        var ErrorCount = 0; var ErrorLog = [/* Shards */ true, /* XP */ true];
        if(ShardBalance < Shards) { ErrorCount++; ErrorLog[0] = false; }
        if(XPBalance < XP) { ErrorLog++; ErrorLog[1] = false; }
        if(ErrorCount == 0) {
          var Upgrade = Java.extend(Runnable, {
            run: function() {
              var SubXP = XPBalance - XP; var SubShards = ShardBalance - Shards;
              VaultInstance.set("Vault.".concat(Player.getName()), SubXP);
              UpgradePurse.set("Database.".concat(Player.getName()), SubShards);
              VaultInstance.save(XPVault); UpgradePurse.save(ShardManager);
              var InfoConfig = YamlConfiguration.loadConfiguration(UserInfo);
              InfoConfig.set("Limits.".concat(Player.getName()), (Level+1)*10000);
              InfoConfig.save(UserInfo);
              Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
                "&eLucky&cVN &8&l| &fNâng cấp cúp thành công! Giới hạn hiện tại: &a" + ((Level+1)*10000).toString()));
            }
          }); Scheduler.runTask(Host, new Upgrade()); return 0;
        } else {
          var Logger = Java.extend(Runnable, {
            run: function() {
              var Message = "&eLucky&cVN &8&l| &fĐã gặp &c" + ErrorCount.toString() + " &flỗi khi nâng cấp:\n";
              if(!ErrorLog[0]) Message += "&f &f &e- &fBạn không có đủ &eMảnh vỡ &fđể nâng cấp!\n";
              if(!ErrorLog[1]) Message += "&f &f &e- &fBạn không có đủ &eXP &fđể nâng cấp!\n"
              Message += "&8[&a+&8] &fĐể kiểm tra tình trạng nâng cấp, bấm &b/checkup";
              Player.sendMessage(ChatColor.translateAlternateColorCodes('&', Message));
            }
          }); Scheduler.runTask(Host, new Logger()); return 1;
        }
      case "check":
        if(!YamlConfiguration.loadConfiguration(UserInfo).getConfigurationSection("Limits").getKeys(true).contains(Player.getName())) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes("&",
            "&eLucky&cVN &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
          return -1;
        }
        var BitWriter = function(input) {
          var bits = [];
          while([0,1].indexOf(input) == -1) {
            bits.push((input % 2).toString());
            input = Math.floor(input / 2);
          }; bits.push(input.toString());
          return bits.reverse();
        }
        var UpgradeArray = function(Level) {
          var XP = (Math.floor(Math.sqrt((Level+1)*Math.pow(10, BitWriter(Level).length >> 1))) << BitWriter(Level+1).length) * 1000;
          var Shards = (Math.floor(Math.sqrt((Level+1)*8)) << BitWriter((Level+1)*3).length);
          return [XP, Shards];
        }
        var CurrentLevel = Math.floor(YamlConfiguration.loadConfiguration(UserInfo).get("Limits.".concat(Player.getName())) / 10000);
        if(CurrentLevel >= 50) {
          Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&eLucky&cVN &8&l| &cLỗi: &fCúp đã đạt tới giới hạn nâng cấp!"));
          return -1;
        }
        var Shards = parseInt(YamlConfiguration.loadConfiguration(ShardManager).get("Database.".concat(Player.getName())));
        var XPCount = parseInt(YamlConfiguration.loadConfiguration(XPVault).get("Vault.".concat(Player.getName())));
        var UpgradePrice = UpgradeArray(CurrentLevel); var ShardPrice = UpgradePrice[1]; var XPPrice = UpgradePrice[0];
        var Counter = [Shards >= ShardPrice, XPCount >= XPPrice];
        var ErrorCount = Counter.filter(function(element) {
          return !element;
        }).length;
        var StatusCode = ErrorCount == 0 ? "&acó" : "&ckhông";
        var Color = ErrorCount == 0 ? "&a" : "&c";
        var SHColor = Counter[0] ? "&a" : "&c"; var XPColor = Counter[1] ? "&a" : "&c";
        var Message = "&eLucky&cVN &8&l| &fTình trạng nâng cấp hiện tại của cúp:\n";
        Message += "&f &f &f- &fSố &eMảnh vỡ &fhiện đang có: " + SHColor + Shards.toString() + "&f/" + "&e".concat(ShardPrice.toString()) + "\n";
        Message += "&f &f &f- &fSố &eXP &fcó trong kho: &a" + XPColor + XPCount.toString() + "&f/" + "&e".concat(XPPrice.toString()) + "\n";
        Message += "&f--------------------------------------------\n";
        Message += "Hiện tại " + StatusCode + " thể &ftiến hành nâng cấp!";
        Player.sendMessage(ChatColor.translateAlternateColorCodes('&', Message)); return 0;
    }
  } catch(err) {
    return "&eLucky&cVN &8&l| &cLỗi: &f" + err.message;
  }
}
main();
