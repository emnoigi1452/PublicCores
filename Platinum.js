var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");
var PreventHopper = Manager.getPlugin("PreventHopper-ORE");
var Host = Manager.getPlugin("PlaceholderAPI");
/* Deprecated, I don't need to use NMS
var HamsterAPI = Manager.getPlugin("HamsterAPI");
 */

var ChatColor = org.bukkit.ChatColor;
var Material = org.bukkit.Material;
var ItemStack = org.bukkit.Material;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;

var Runnable = java.lang.Runnable;
var Thread = java.lang.Thread;
var File = java.io.File
var System = java.lang.System;
var ArrayList = java.util.ArrayList;
var HashMap = java.util.HashMap;
var JavaString = java.lang.String;
var UUID = java.util.UUID;
var StringBuilder = java.lang.StringBuilder;
var BigInteger = java.math.BigInteger;
var MessageDigest = java.security.MessageDigest;
var Base64 = java.util.Base64;
var Calendar = java.util.Calendar;
var SimpleDateFormat = java.text.SimpleDateFormat;


var HashUtils = {
  formatter: function(bytes) {
    // Format code taken from AuthMe, thanks :D
    return JavaString.format("\u00250" + (bytes.length << 1) + "x", new BigInteger(1, bytes));
  },
  getAlgorithm: function(id) {
    var algorithm = null;
    try {
      algorithm = MessageDigest.getInstance(id);
    } catch(err) { print(err); }
    return algorithm;
  },
  hash: function(algorithm, input) {
    algorithm.reset(); algorithm.update(input.getBytes());
    var byteOutput = algorithm.digest();
    return HashUtils.formatter(byteOutput);
  },
  hashColorID: function(playerName) {
    var BaseBytes = playerName.getBytes();
    var HashAlgorithm = HashUtils.getAlgorithm("SHA-256");
    var FormatByteHeader = HashUtils.formatter(Base64.getEncoder().encode(BaseBytes));
    var PreHashLayout = playerName + "_" + FormatByteHeader;
    // Hashing process
    return HashUtils.hash(HashAlgorithm, PreHashLayout);
  },
  hashStarlightID: function(playerName) {
    var BaseBytes = Server.getOfflinePlayer(playerName).getUniqueId().toString().getBytes();
    var HashAlgorithm = HashUtils.getAlgorithm("SHA-256");
    var FormatByteHeader = HashUtils.formatter(Base64.getEncoder().encode(BaseBytes));
    var PreHashLayout = "$" + playerName + "$" + FormatByteHeader + "$";
    // Hashing process
    return HashUtils.hash(HashAlgorithm, PreHashLayout);
  },
  hashEventID: function(playerName) {
    function sha256(input) {
      var algorithm = HashUtils.getAlgorithm("SHA-256");
      return HashUtils.hash(algorithm, input);
    }
    function md5(input) {
      var algorithm = HashUtils.getAlgorithm("MD5");
      return HashUtils.hash(algorithm ,input);
    }
    var UID = Server.getOfflinePlayer(playerName).getUniqueId().toString();
    var Handle = new StringBuilder(); Handle.append(UID.replaceAll("-",""));
    Handle.reverse(); var Bytes = Handle.toString().getBytes();
    var StringifyBytes = HashUtils.formatter(Base64.getEncoder().encode(Bytes));
    var HashedName = md5(playerName);
    var Syntax = "$<1>$<2>".replace("<1>", HashedName).replace("<2>", StringifyBytes);
    return sha256(md5(Syntax).concat(sha256(UID)));
  },
  hashDonateKey: function(eventID) {
    var Layout = "D<$id>".replace("$id", eventID);
    var shaAlgorithm = HashUtils.getAlgorithm("SHA-256");
    var mdAlgorithm = HashUtils.getAlgorithm("MD5");
    var Base = HashUtils.hash(shaAlgorithm, HashUtils.hash(mdAlgorithm, eventID));
    return HashUtils.hash(shaAlgorithm, "$DONATE$<#h>".replace("#h", Base));
  },
  hashTradeKey: function(eventID) {
    var Layout = "T<$id>".replace("$id", eventID);
    var shaAlgorithm = HashUtils.getAlgorithm("SHA-256");
    var Base = HashUtils.hash(shaAlgorithm, Layout);
    return HashUtils.hash(shaAlgorithm, "$DONATE$<#h>".replace("#h", Base));
  }
}

var Messenger = {
  prefix: '&ePlatinum &8&l| &f',
  handleMessage: function(module, key) {
     switch(module.toLowerCase()) {
       case "error":
         if(Object.keys(this).indexOf(key) == -1) return "&cInvalid Key!";
         return this.prefix + "&cLỗi: &f" + this[key];
       case "note":
         if(Object.keys(this).indexOf(key) == -1) return "&cInvalid Key!";
         return this.prefix + "&aGhi chú: &f" + this[key];
     }
  },
  getError: function(key) {
    return this.handleMessage('error', key);
  },
  getNote: function(key) {
    return this.handleMessage('note', key);
  },
  notEnoughPlugins: '&fMáy chủ không có đủ plugin để bắt đầu &eEvent&f!',
  isBlacklistEntry: '&fBạn hiện bị cấm tham gia sự kiện! Liên hệ &eDucTrader &fđể giải quyết!',
  alreadyRegistered: '&fBạn đã đăng ký sự kiện từ trước rồi!',
  notRegistered: '&fBạn cần phải đăng ký trước khi dùng tính năng này!',
  registered: '&fĐã đăng ký thành công sự kiện &b&oSao Bạch Kim &f&8[&e$m&8]',
  noPermission: '&fBạn không có quyền sử dụng tính năng này!',
  mineralSent: '&fĐã gửi thành công &a$c $t&f. Nhận được &a$x &fXP khoáng sản!',
  noMinerals: '&fTrong kho của bạn không có khoáng sản để cống nạp!',
  notEnoughXP: '&fBạn không có đủ XP khoáng sản để thực hiện trao đổi!',
  alreadyClaimed: '&fBạn đã nhận điểm &eChuyên Cần &fcủa hôm nay rồi!',
  dailyClaimed: '&fĐã nhận thành công &a1 &eĐiểm Chuyên Cần &fcủa hôm nay!',
  pointsObtain: '&fTrao đổi hoàn tất! Bạn nhận được &a$a &eĐiểm Bạch Kim!',
  notEnoughPoints: '&fBạn không có đủ điểm để thực hiện giao dịch này!',
  autoUnlocked: '&fĐã mở khóa thành công tính năng tự động trao đổi!',
}

var Platinum = {
  KEYS: ['COAL','LAPIS_LAZULI','IRON_INGOT','GOLD_INGOT','DIAMOND','EMERALD'],
  formatNumber: function(i) {
    i = i.toString();
    var regex = /(-?\d+)(\d{3})/;
    while(regex.test(i))
      i = i.replace(regex, "$1,$2");
    return i;
  },
  colorHandler: function(param) {
    return ChatColor.translateAlternateColorCodes('&', param);
  },
  doNothing: function() { print(0); return 0; },
  getKey: function(request) {
    request = request.toLowerCase();
    var O = {
      coal: 'COAL', lapis: 'LAPIS_LAZULI', iron: 'IRON_INGOT', gold: 'GOLD_INGOT', diamond: 'DIAMOND', emerald: 'EMERALD'
    }
    return Object.keys(O).indexOf(request) == -1 ? "NONE" : O[request];
  },
  getTableValue: function(key) {
    var Table = {
      COAL: 1.5,
      LAPIS_LAZULI: 1,
      IRON_INGOT: 2,
      GOLD_INGOT: 2.5,
      DIAMOND: 5,
      EMERALD: 4
    }
    if(Object.keys(Table).indexOf(key) == -1)
      return -1;
    return Table[key];
  },
  translateKey: function(key) {
    var Translations = {
      COAL: '&8Than',
      LAPIS_LAZULI: '&9Lưu ly',
      IRON_INGOT: '&fSắt',
      GOLD_INGOT: '&6Vàng',
      DIAMOND: '&bKim cương',
      EMERALD: '&aNgọc lục bảo'
    }
    if(Object.keys(Translations).indexOf(key) == -1)
      return "null";
    return Translations[key];
  }
}


var FileManager = {
  ModuleWatcher: null,
  Donate: null,
  Date: new SimpleDateFormat("dd-MM-yyyy").format(Calendar.getInstance().getTime()),
  Trade: null,
  BL: null,
  perPoint: {
    Trade: 100000,
    Donate: 1000000,
  },
  initializeFiles: function() {
    var Path = Host.getDataFolder().getAbsolutePath().concat("//Platinum");
    var Instance = new File(Path);
    if(!Instance.exists()) Instance.mkdir();
    var Donate = new File(Instance, "Donate");
    var Trade = new File(Instance, "Trade");
    [Donate, Trade].forEach(function(f) { if(!f.exists()) f.mkdir(); });
    this.Donate = Donate; this.Trade = Trade;
    var Regs = new File(Instance, "Regs.yml");
    if(!Regs.exists()) {
      Regs.createNewFile();
      var CF = YamlConfiguration.loadConfiguration(Regs);
      CF.set("Modules.null@dev@donate", 'Donate');
      CF.set("Modules.null@dev@trade", 'Trade');
      CF.save(Regs);
    }
    this.ModuleWatcher = Regs;
    var BlackList = new File(Instance, "Blacklist.yml");
    if(!BlackList.exists()) {
      var C = YamlConfiguration.loadConfiguration(BlackList);
      var List = new ArrayList(); List.add("null@dev@blacklist");
      C.set("Blacklist", List); C.save(BlackList);
    }
    this.BL = BlackList;
  },
  setupComponents: function(mainFolder) {
    ['Daily','Database'].forEach(function(k) {
      var Folder = new File(mainFolder, k);
      if(!Folder.exists()) Folder.mkdir();
    });
    var HandleID = mainFolder.getName();
    var Algorithm = FileManager.getHashFunction(HandleID);
    var Database = new File(mainFolder, "Database");
    var ModuleConfig = YamlConfiguration.loadConfiguration(this.ModuleWatcher);
    var Keys = ModuleConfig.getConfigurationSection("Modules").getKeys(false);
    for each(var uid in Keys) {
      if(['null@dev@trade','null@dev@donate'].indexOf(uid) != -1)
        continue;
      if(ModuleConfig.get("Modules.".concat(uid)) == HandleID) {
        var Name = Server.getOfflinePlayer(UUID.fromString(uid)).getName();
        var UserKey = Algorithm(HashUtils.hashEventID(Name));
        var DataFile = new File(Database, UserKey.concat(".yml"));
        if(!DataFile.exists())
          FileManager.generateDataFile(DataFile);
      }
    }
  },
  setupDailyMonitor: function(mainFolder) {
    var Present = FileManager.Date;
    var Monitor = new File(mainFolder, "Daily/" + Present.concat(".yml"));
    if(!Monitor.exists()) Monitor.createNewFile();
    var MC = YamlConfiguration.loadConfiguration(Monitor);
    MC.set("Base", FileManager.perPoint[mainFolder.getName()]);
    var TypeFunc = FileManager.getHashFunction(mainFolder.getName());
    var Registrations = YamlConfiguration.loadConfiguration(this.ModuleWatcher);
    var Table = new ArrayList();
    for each(var keyUID in Registrations.getConfigurationSection("Modules").getKeys(false)) {
      if(['null@dev@donate','null@dev@trade'].indexOf(keyUID) != -1)
        continue;
      if(Registrations.get("Modules.".concat(keyUID)) == mainFolder.getName())
        Table.add(TypeFunc(HashUtils.hashEventID(Server.getOfflinePlayer(UUID.fromString(keyUID)).getName())));
    };
    Table.stream().forEach(function(hash) {
      if(!MC.contains("Daily." + hash)) {
        Platinum.KEYS.forEach(function(e) {
          var V = "Daily." + hash + "." + e;
          MC.set(V, new java.lang.Integer(0));
        }); MC.set("Daily." + hash + ".Claimed", false);
      }
    }); MC.save(Monitor);
  },
  generateDataFile: function(source) {
    var Config = YamlConfiguration.loadConfiguration(source);
    Config.set("Points", 0); Config.set("Daily_Points", 0);
    Platinum.KEYS.forEach(function(k) {
      Config.set("XP.".concat(k), 0);
      Config.set("Given.".concat(k), 0);
    });
    Config.save(source);
  },
  getHashFunction: function(key) {
    switch(key) {
      case "Trade": return HashUtils.hashTradeKey;
      case "Donate": return HashUtils.hashDonateKey;
      default: throw "Invalid key!";
    }
    return null;
  },
  checkBlackList: function(playerName) {
    var Config = YamlConfiguration.loadConfiguration(this.BL);
    var Listing = Config.get("Blacklist");
    return Listing.contains(Server.getOfflinePlayer(playerName).getUniqueId().toString());
  },
  getPlayerModule: function(playerName) {
    var T = FileManager.Trade; var D = FileManager.Donate;
    var Counter = 0; var Status = [[T, false],[D, false]];
    Status.forEach(function(base) {
      var DataCore = new File(base[0], "Database");
      var HashAlgo = FileManager.getHashFunction(base[0].getName());
      var Hashed = HashAlgo(HashUtils.hashEventID(playerName));
      if(new File(DataCore, Hashed.concat(".yml")).exists()) {
        Counter++;
        base[1] = true;
      }
    }); print(Counter);
    switch(Counter) {
      case 0: return "NONE";
      case 1:
        var E = null;
        Status.forEach(function(x) {
          if(x[1]) E = x[0].getName();
        }); return E
      case 2:
        var BLC = YamlConfiguration.loadConfiguration(this.BL);
        var L = BLC.get("Blacklist");
        if(L.contains(Server.getOfflinePlayer(playerName).getUniqueId().toString()))
          return "BLACKLIST";
        L.add(Server.getOfflinePlayer(playerName).getUniqueId().toString());
        BLC.set("Blacklist", L); BLC.save(this.BL);
        return "BLACKLIST";
      default: throw "Invalid output code";
    }
  },
  getDataFile: function(playerName, module) {
    if(['Trade','Donate'].indexOf(module) == -1)
      throw "Invalid module";
    var EventKey = HashUtils.hashEventID(playerName);
    var HashFunction = FileManager.getHashFunction(module);
    var Hash = HashFunction(EventKey);
    var P = new File(FileManager[module], "Database/" + Hash.concat(".yml"));
    if(!P.exists)
      throw "Invalid file";
    return P;
  } 
}

// Main core function of the event
function main() {
  try {
    if(Skyblock == null || PreventHopper == null)
      throw Messenger.getError("notEnoughPlugins");
    FileManager.initializeFiles();
    var TaskSetup = Java.extend(Runnable, {
      run: function() {
        FileManager.setupComponents(FileManager.Trade);
        FileManager.setupComponents(FileManager.Donate);
        FileManager.setupDailyMonitor(FileManager.Trade);
        FileManager.setupDailyMonitor(FileManager.Donate);
      }
    }); new Thread(new TaskSetup()).start();
    var Module = FileManager.getPlayerModule(Player.getName());
    if(FileManager.checkBlackList(Player.getName())) {
     Player.sendMessage(Platinum.colorHandler(Messenger.getError('isBlacklistEntry')));
     print(Player.getName() + " was blacklisted."); return -1;
    }; 
    var DataFile = null;
    switch(args[0].toLowerCase()) {
      case "info":
        switch(args[1].toLowerCase()) {
          case "kho-size": return Platinum.formatNumber(Player.getMetadata("playerData").get(0).value().getLimit("STONE"));
          case "type":
            var B = Player.getMetadata("playerData").get(0).value().getLimit("STONE") < 1000000;
            return B ? "Trade" : "Donate";
          default: return "null";
        }; return false;
      case "register":
        var Registrations = YamlConfiguration.loadConfiguration(FileManager.ModuleWatcher);
        var UID = Player.getUniqueId().toString();
        if(Registrations.contains("Modules.".concat(UID))) {
          Player.sendMessage(Platinum.colorHandler(Messenger.getError("alreadyRegistered")));
          return -1;
        }
        var RegTask = Java.extend(Runnable, {
          run: function() {
            var Storage = Player.getMetadata("playerData").get(0).value().getLimit("STONE");
            var Module_Key = Storage >= 1000000 ? "Donate" : "Trade";
            var Folder = FileManager[Module_Key]; var DB = new File(Folder, "Database");
            var HashFunc = FileManager.getHashFunction(Module_Key); var EventID = HashUtils.hashEventID(Player.getName());
            var DataSource = new File(DB, HashFunc(EventID).concat(".yml"));
            FileManager.generateDataFile(DataSource);
            Registrations.set("Modules.".concat(Player.getUniqueId().toString()), Module_Key);
            Registrations.save(FileManager.ModuleWatcher);
            var DailyConfig = new File(FileManager[Module_Key], "Daily/" + FileManager.Date.concat(".yml"));
            var C = YamlConfiguration.loadConfiguration(DailyConfig);
            Platinum.KEYS.forEach(function(k) {
              var Format = "Daily." + HashFunc(EventID) + "." + k;
              C.set(Format, new java.lang.Integer(0));
            }); C.set("Daily." + HashFunc(EventID) + ".Claimed", false); C.save(DailyConfig);
            Player.sendMessage(Platinum.colorHandler(Messenger.getNote("registered").replace("$m", Module_Key)));
          }
        }); Scheduler.runTask(Host, new RegTask()); return 0;
      case "gui-check":
      case "send":
      case "claim-daily":
      case "claim-point":
      case "register-auto":
      case "placeholder":
        if(Module == "NONE") {
          Player.sendMessage(Platinum.colorHandler(Messenger.getError("notRegistered")));
          return false;
        }
        else DataFile = FileManager.getDataFile(Player.getName(), Module); break;
      case "auto":
        if(Module == "NONE")
          Player.sendMessage(Platinum.colorHandler(Messenger.getError("notRegistered")));
        else {
          var TempF = FileManager.getDataFile(Player.getName(), Module);
          var Config = YamlConfiguration.loadConfiguration(TempF);
          if(!Config.contains("Auto"))
            Player.sendMessage(Platinum.colorHandler(Messenger.getError('noPermission')));
          else { DataFile = TempF; return true; }
        }
        return false;
      default: throw "&eInvalid module";
    }
    if(DataFile == null) return -1;
    var DataConfig = YamlConfiguration.loadConfiguration(DataFile);
    switch(args[0].toLowerCase()) {
      case "send":
        var FormatKey = Platinum.getKey(args[1]);
        if(FormatKey == "NONE") throw "Invalid key!";
        var DailyModule = new File(FileManager[Module], "Daily/" + FileManager.Date.concat(".yml"));
        var DataSendTask = Java.extend(Runnable, {
          run: function() {
            var Storage = Player.getMetadata("playerData").get(0).value();
            var Balance = Storage.getBlock(FormatKey);
            if(Balance > 0) {
              var DataConfig = YamlConfiguration.loadConfiguration(DataFile);
              var MonitorConfig = YamlConfiguration.loadConfiguration(DailyModule);
              var XP_Value = Platinum.getTableValue(FormatKey) * Balance;
              function x(main, sub) { return main + "." + sub }
              DataConfig.set(x("XP", FormatKey), DataConfig.get(x("XP", FormatKey)) + XP_Value);
              DataConfig.set(x("Given", FormatKey), DataConfig.get(x("Given", FormatKey)) + Balance);
              var UserHash = DataFile.getName().replace(".yml",'');
              var MonitorKey = x("Daily", UserHash) + "." + FormatKey;
              MonitorConfig.set(MonitorKey, MonitorConfig.get(MonitorKey)+XP_Value);
              DataConfig.save(DataFile); MonitorConfig.save(DailyModule);
              Storage.setBlock(FormatKey, new java.lang.Integer('0'));
              Player.sendMessage(Platinum.colorHandler(
                Messenger.getNote("mineralSent").replace(
                  "$c", Platinum.formatNumber(Balance)).replace(
                  "$x", Platinum.formatNumber(XP_Value)).replace(
                  "$t", Platinum.translateKey(FormatKey))));
            } else Player.sendMessage(Platinum.colorHandler(Messenger.getError("noMinerals")));
          }
        });
        // Scheduler.runTask(Host, new DataSendTask()) 
        new Thread(new DataSendTask()).start(); return 0;
      case "claim-daily":
        var DailyModule = new File(FileManager[Module], "Daily/" + FileManager.Date.concat(".yml"));
        var DailyClaimTask = Java.extend(Runnable, {
          run: function() {
            var UserHashKey = DataFile.getName().replace(".yml", ""); var NotMax = false;
            var PlayerConfig = YamlConfiguration.loadConfiguration(DataFile);
            var MonitorConfig = YamlConfiguration.loadConfiguration(DailyModule);
            if(MonitorConfig.get("Daily." + UserHashKey + ".Claimed")) {
              Player.sendMessage(Platinum.colorHandler(Messenger.getError("alreadyClaimed")));
              return;
            }
            var Section = MonitorConfig.getConfigurationSection("Daily." + UserHashKey);
            var Base = MonitorConfig.get("Base");
            Platinum.KEYS.forEach(function(x) {
              if(Section.get(x) < Base) NotMax = true;
            });
            if(NotMax) Player.sendMessage(Platinum.colorHandler(Messenger.getError("notEnoughXP")));
            else {
              MonitorConfig.set("Daily." + UserHashKey + ".Claimed", true); MonitorConfig.save(DailyModule);
              PlayerConfig.set("Daily_Points", PlayerConfig.get("Daily_Points")+1);
              PlayerConfig.save(DataFile);
              Player.sendMessage(Platinum.colorHandler(Messenger.getNote("dailyClaimed")));
            }
          }
        }); Scheduler.runTask(Host, new DailyClaimTask()); return 0;
      case "claim-point":
        var PointTradingTask = Java.extend(Runnable, {
          run: function() {
            var DataConfig = YamlConfiguration.loadConfiguration(DataFile);
            var Min = 0; var Values = []; var Req = FileManager.perPoint[Module];
            Platinum.KEYS.forEach(function(x) {
              Values.push(DataConfig.get("XP.".concat(x)));
            }); Values.sort(function(x,y){return x-y;}); Min = Values[0];
            if(Min < Req) {
              Player.sendMessage(Platinum.colorHandler(Messenger.getError("notEnoughXP")));
              return;
            }
            var O = Math.floor(Min / Req); var Sub = O * Req;
            Platinum.KEYS.forEach(function(e) {
              var KeyXP = "XP." + e;
              DataConfig.set(KeyXP, DataConfig.get(KeyXP)-Sub);
            }); DataConfig.set("Points", DataConfig.get("Points")+O);
            DataConfig.save(DataFile);
            Player.sendMessage(Platinum.colorHandler(Messenger.getNote("pointsObtain").replace("$a", O.toString())));
          }
        }); new Thread(new PointTradingTask()).start(); return 0;
      case "register-auto":
        var AutoRegistration = Java.extend(Runnable, {
          run: function() {
            var Config = YamlConfiguration.loadConfiguration(DataFile);
            if(Config.get("Points") < 20 || Config.get("Daily_Points") < 10) {
              Player.sendMessage(Platinum.colorHandler(Messenger.getError("notEnoughPoints")));
              return;
            }
            Config.set("Auto.Task.ID", new java.lang.Integer(-1));
            Config.set("Auto.Task.Start", new java.lang.Integer(-1));
            Platinum.KEYS.forEach(function(z) {
              Config.set("Auto.Handler." + z, false);
            });
            Config.set("Points", Config.get("Points")-20); Config.set("Daily_Points", Config.get("Daily_Points")-10);
            Config.save(DataFile);
            Player.sendMessage(Platinum.colorHandler(Messenger.getNote("autoUnlocked")));
          }
        }); Scheduler.runTask(Host, new AutoRegistration()); return 0;
      case "placeholder":
        var DataConfig = YamlConfiguration.loadConfiguration(DataFile);
        switch(args[1].toLowerCase()) {
          case "stats":
            var T = args[2].toLowerCase() == "xp" ? "XP." : "Given.";
            var Key = Platinum.getKey(args[3]);
            if(Key == "NONE")
              return -1;
            return Platinum.formatNumber(DataConfig.get(T.concat(Key)));
          case "daily-points": return DataConfig.get("Daily_Points").toString();
          case "points": return DataConfig.get("Points").toString();
        }; break;
      case "auto":
        // Cái này để code sau xd
    }
  } catch(err) { return err; }
}
main();
