var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Host = Manager.getPlugin("PlaceholderAPI");
var MyItems = Manager.getPlugin("MyItems");
var PreventHopper = Manager.getPlugin("PreventHopper-ORE");
var ScriptData = Host.getDataFolder().getAbsolutePath() + "/UpgradeStick.json";
var MyItemsSkillKey = "Auto-Compression";

var ChatColor = org.bukkit.ChatColor;
var ItemStack = org.bukkit.inventory.ItemStack;
var Material = org.bukkit.Material;
var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
// var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var ScriptParser = new org.json.simple.parser.JSONParser();
var JSONArray = org.json.simple.JSONArray;
var JSONObject = org.json.simple.JSONObject;

var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");
var File = Java.type("java.io.File");
var FileWriter = Java.type("java.io.FileWriter");
var FileReader = Java.type("java.io.FileReader");
var BufferedWriter = Java.type("java.io.BufferedWriter");
var BufferedReader = Java.type("java.io.BufferedReader");
var HashMap = Java.type("java.util.HashMap");
var ArrayList = Java.type("java.util.ArrayList");

var Language = {
  processInput: function(key, outputType) {
    var nodeIndex = (['error', 'note']).indexOf(outputType.toLowerCase());
    var prefix = "";
    if(nodeIndex == -1)
      throw this['invalidOperator'];
    else
      prefix = nodeIndex == 1 ? '&aGhi chú: &f' : '&cLỗi: &f';
    return prefix.concat(this[key]);
  },
  colorText: function(key, type) {
    return ChatColor.translateAlternateColorCodes('&', "&5Ultra &8&l| &f" + this.processInput(key, type));
  },
  invalidOperator: '&fThao tác được nhập vào không hợp lệ!',
  missingDepend: '&fMáy chủ không có đủ plugin để sử dụng script!',
  invalidType: '&fLoại khoáng sản không hợp lệ!',
  invalidInt: '&fSố nhập vào không phải số nguyên hợp lệ!',
  alreadyVerified: '&fBạn đã xác nhận quyền dùng đũa từ trước!',
  invalidItem: '&fVật phẩm không hợp lệ! Thiếu mã xác nhận!',
  invalidStack: '&fBạn chỉ được phép cầm tối đa &a1 &fvật phẩm!',
  wandVerified: '&fĐũa đã được kích hoạt! Bạn được phép dùng vật phẩm',
  noPermission: '&fBạn không có quyền sử dụng vật phẩm này!',
  invalidCast: "&fVật phẩm không thể dùng để kích hoạt skill!",
  noMineralFound: '&fĐũa không thể đổi một tí khoáng sản nào &c:(',
  notEnoughMinerals: '&fBạn không có đủ khoáng sản để trao đổi!',
  notEnoughXP: '&fBạn không có đủ &aXP &fđể trao đổi!',
  obtainCoin: '&fĐã đổi thành công &a1 &eXu Khoáng Sản&f!',
  noNewGem: '&fKhông nhận được ngọc khoáng sản mới nào &c:( &f&oXui thôi...',
  notEnoughCoins: '&fKhông có đủ &eXu Khoáng Sản &fđể tiến hành rút ngọc!',
  newGemUnlocked: '&fRút thành công! Bạn đã mở khóa &a$a &fngọc mới!',
  alreadyRegistered: '&fBạn đã đăng ký mua &eĐũa Nâng Cấp &ftừ trước rồi!',
  registerSuccess: '&fĐăng ký thành công! Chúc bạn cày cuốc vật phẩm vui vẻ!',
  invalidItem: "&fVật phẩm để rèn &eĐũa Nâng Cấp &fkhông hợp lệ!",
  sentXP: '&fĐã gửi &a%t XP &fvào việc rèn &eĐũa Nâng Cấp&f!'
  sentMineral: '&fĐã gửi &a%t %n &fvào cho &eĐũa Nâng Cấp&f!',
}

var UltraCore = {
  getHopperKey: function(param) {
    switch(param) {
      case "coal":
      case "redstone":
      case "diamond":
      case "emerald":
        return param.toUpperCase();
      case "iron":
      case "gold":
        return param.toUpperCase().concat("_INGOT");
      case "lapis":
        return param.toUpperCase().concat("_LAZULI");
    } throw Language['invalidType'];
  },
  colorRecognition: function(type) {
    switch(type.toLowerCase()) {
      case "black": return "coal";
      case "blue": return "lapis";
      case "red": return "redstone";
      case "white": return "iron";
      case "yellow": return "gold";
      case "light_blue": return "diamond";
      case "lime": return "emerald";
      default: return null;
    }
  },
  translateKey: function(node) {
    switch(node.toLowerCase()) {
      case "coal": return "&8Than";
      case "lapis": return "&9Lưu ly";
      case "redstone": return "&4Đá đỏ";
      case "iron": return "&fSắt";
      case "gold": return "&6Vàng";
      case "diamond": return "&bKim cương";
      case "emerald": return "&aLục bảo";
    }
  },
  processInventoryTable: function(slotID) {
    var Hotbar = [1,2,3,4,5,6,7,8,9];
    if(Hotbar.indexOf(slotID) != -1)
      return "&fHotbar - Slot &a" + slotID.toString();
    else
      return "&fHàng &e$r &f- Slot &a$s"
            .replace("$r", (Math.floor(slotID/9)-1).toString())
            .replace("$s", (slotID%9).toString());
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
  },
  calculateContent: function(source, value) {
    // Return value: Array[<Level>, <Progress to Next Level>]
    var Current = source + value;
    var T1 = 0; var T2 = 353; var T3 = 1508;
    var Level = 0 // Type: Int
    // Using inverse formula provided by the Minecraft wiki :3
    if(Current >= T3)
      Level = Math.floor((325/18) + Math.sqrt((2/9) * (Current - (54215/72))));
    else if(Current >= T2 && Current < T3)
      Level = Math.floor((81/10) + Math.sqrt((2/5) * (Current - (7839/40))));
    else
      Level = Math.floor(Math.sqrt(Current+9) - 3);
    function formatTotalEXP(param) {
      if(Level >= 32)
        return Math.round((4.5*(param*param)) - (162.5*param) + 2220);
      else if(Level >= 17)
        return Math.round((2.5*(param*param)) - (40.5*param) + 360);
      else
        return Math.round((Level*param) + (6*param));
    }
    function getRequiredLevelUp(param) {
      if(param >= 31)
        return (9*param) - 158;
      else if(param >= 16)
        return (5*param) - 38;
      else
        return (2*param) + 7;
    }
    var Progress = Math.floor(Current - formatTotalEXP(Level));
    return [Level, Progress/getRequiredLevelUp(Level)];
  }
}

function main() {
  try {
    if(MyItems == null || PreventHopper == null)
      throw Language['missingDepend'];
    var ItemManager = MyItems.getGameManager().getItemManager(); var Database = new File(ScriptData);
    if(!Database.exists()) Database.createNewFile();
    var DataWatcher = ScriptParser.parse(new BufferedReader(new FileReader(Database)));
    if(DataWatcher == null) { DataWatcher = new JSONObject(); DataWatcher.put("null", null); }
    switch(args[0].toLowerCase()) {
      case "verify":
        var UID = Player.getUniqueId().toString();
        if(!DataWatcher.keySet().contains(UID)) {
          var RequestVefifyTarget = Player.getInventory().getItemInMainHand();
          if(RequestVefifyTarget.getAmount() == 1) {
            var NMSItemStack = CraftItemStack.asNMSCopy(RequestVefifyTarget);
            if(NMSItemStack.hasTag()) {
              var NMSItemTag = NMSItemStack.getTag();
              switch(NMSItemTag.getInt("Wand-Status")) {
                case -1:
                  var VefificationTask = Java.extend(Runnable, {
                    run: function() {
                      var JSONLogger = new JSONObject();
                      JSONLogger.put("Name", Player.getName());
                      JSONLogger.put("GachaCoins", parseInt(0));
                      JSONLogger.put("Unlocked" , new JSONArray());
                      DataWatcher.put(UID, JSONLogger);
                      var WriterObject = new BufferedWriter(new FileWriter(Database));
                      WriterObject.write(DataWatcher.toJSONString());
                      WriterObject.flush(); WriterObject.close();
                      // Set new status code for the wand using its NBT Tag
                      NMSItemTag.setInt("Wand-Status", 
                        new java.lang.Integer(Math.floor(1)));
                      NMSItemStack.setTag(NMSItemTag);
                      var BukkitVersion = CraftItemStack.asBukkitCopy(NMSItemStack);
                      // Update new item stack to inventory
                      Player.getInventory().setItemInMainHand(BukkitVersion);
                      Player.sendMessage(Language.colorText('wandVerified', 'note'));
                    }
                  }); Scheduler.runTask(Host, new VefificationTask()); return 0;
                case 1:
                  Player.sendMessage(Language.colorText('wandLocked', 'error')); break;
                default:
                  Player.sendMessage(Language.colorText('invalidItem', 'error')); break;
              }
            } else {
              Player.sendMessage(Language.colorText("invalidItem", 'error'))
            }
          } else {
            Player.sendMessage(Language.colorText('invalidStack', 'error'));
          }
        } else {
          Player.sendMessage(Language.colorText("alreadyVerified", 'error'));
        }
        return -1;
      case "skill":
        var UID = Player.getUniqueId().toString().trim().toLowerCase();
        if(DataWatcher.keySet().contains(UID)) {
          var BoxMap = new HashMap(); // HashMap<BoxLocation(Integer=SlotID), Type(String)>
          var Inventory = Player.getInventory();
          for(var j = 0; j < 36; j++) {
            if(Inventory.getItem(j) == null) continue;
            var BoxID = Inventory.getItem(j).getType().name();
            if(!BoxID.endsWith("SHULKER_BOX")) continue;
            var Color = BoxID.replace("_SHULKER_BOX","");
            if((['BLACK','BLUE','RED','WHITE','YELLOW','LIGHT_BLUE','LIME'])
                .indexOf(Color) != -1) {
              var CaptureState = Inventory.getItem(j).getItemMeta().getBlockState();
              var CapturedInventory = CaptureState.getInventory(); var Invalidity = false;
              var ItemNode = ItemManager.getItem(UltraCore.colorRecognition(Color).concat("1"));
              for(var x = 0; x < 27; x++) {
                var CapturedItem = CapturedInventory.getItem(x);
                if(CapturedItem == null) continue;
                CapturedItem = CapturedItem.clone();
                CapturedItem.setAmount(1);
                if(!CapturedItem.equals(ItemNode)) { 
                  Invalidity = true; break;
                }
              }
              if(Invalidity) continue;
              else {
                BoxMap.put(parseInt(j), UltraCore.colorRecognition(Color));
              }
            }
          }
          if(BoxMap.isEmpty()) {
            Player.sendMessage(Language.colorText('noValidBox', 'error'));
            var PlayerCooldown = MyItems.getPlayerManager().
              getPlayerPowerManager().getPlayerPowerCooldown(Player);
            PlayerCooldown.removePowerCommandCooldown(MyItemsSkillKey);
          } else {
            var PlayerStorageData = Player.getMetadata("playerData").get(0).value();
            var ScheduledEvolutionTask = Java.extend(Runnable, {
              run: function() {
                var CastedWand = CraftItemStack.asNMSCopy(Player.getInventory().getItemInMainHand());
                if(CastedWand.hasTag() && CastedWand.getTag().getInt("Wand-Status") == 1) {
                  for each(var matchIndex in BoxMap.keySet()) {
                    var DataMonitorObject = DataWatcher.get(UID);
                    var UnlockedNodes = DataMonitorObject.get("Unlocked");
                    var HopperKeyValue = UltraCore.getHopperKey(BoxMap.get(matchIndex));
                    if(UnlockedNodes.contains(HopperKeyValue)) {
                      var BoxMeta = Inventory.getItem(matchIndex).getItemMeta(); var BoxStatic = BoxMeta.getBlockState();
                      var Container = BoxStatic.getInventory(); var Net = parseInt(0);
                      for each(var Stack in Container.getContents()) {
                        if(Stack == null) continue;
                        Net += parseInt(Stack.getAmount());
                      }
                      var Balance = PlayerStorageData.getBlock(HopperKeyValue);
                      if(Balance > 576) {
                        var Prod = Math.floor(Balance/576); Net += Prod; Balance = Balance % 576;
                        var NetControl = Net > 1728 ? Net - 1728 : 0;
                        if(NetControl != 0) Net = Net - 1728; Container.clear();
                        Balance = Math.floor(Balance + parseInt(NetControl * 576));
                        PlayerStorageData.setBlock(HopperKeyValue, Balance);
                        var StackVal = Math.floor(Net / 64); var StackRem = Net % 64;
                        var SetStack = ItemManager.getItem(BoxMap.get(matchIndex).concat("1")).clone();
                        SetStack.setAmount(64);
                        for(var z = 0; z < StackVal; z++)
                          Container.setItem(z, SetStack);
                        SetStack.setAmount(StackRem); Container.setItem(z, SetStack);
                        BoxStatic.update(); BoxMeta.setBlockState(BoxStatic);
                        Inventory.getItem(matchIndex).setItemMeta(BoxMeta);
                      }
                    }
                  }
                } else {
                  Player.sendMessage(Language.colorText("invalidCast", 'error'));
                }
                var WriterObject = new BufferedWriter(new FileWriter(Database));
                WriterObject.write(DataWatcher.toJSONString());
                WriterObject.flush(); WriterObject.close();
                // What else is there to say ? :L
              }
            }); Scheduler.runTask(Host, new ScheduledEvolutionTask()); return 0;
          }
        } else {
          Player.sendMessage(Language.colorText("noPermission", 'error'));
        }; return -1;
      case "gacha":
        var UserUID = Player.getUniqueId().toString().trim().toLowerCase();
        var RollCount = parseInt(args[1].toLowerCase());
        if(isNaN(RollCount) || RollCount < 1) throw Language['invalidInt'];
        if(DataWatcher.keySet().contains(UserUID)) {
          var UserDataLog = DataWatcher.get(UserUID);
          function randomizeTable() {
            var coal,lapis,redstone,iron,gold,diamond,emerald;
            // Initialize chance stack
            coal = 1; lapis = 21; redstone = 41;
            iron = 61; gold = 76;
            diamond = 91; emerald = 97;
            var outputArray = [];
            for(var j = 0; j < 100; j++) {
                var Control = Math.floor(Math.random() * 100) + 1;
                if(Control >= emerald)
                    outputArray.push('emerald');
                else if(Control >= diamond)
                    outputArray.push('diamond');
                else if(Control >= gold)
                    outputArray.push('gold');
                else if(Control >= iron)
                    outputArray.push('iron');
                else if(Control >= redstone)
                    outputArray.push('redstone');
                else if(Control >= lapis)
                    outputArray.push('lapis')
                else
                    outputArray.push('coal');
            }
            return outputArray;
          };
          var GachaFunction = Java.extend(Runnable, {
            run: function() {
              var Coins = parseInt(UserDataLog.get("GachaCoins"));
              var CollectedEntries = new ArrayList();
              if(Coins < 1 || Coins < RollCount) {
                Player.sendMessage(Language.colorText("notEnoughCoins", 'error'));
              } else {
                for(var z = 0; z < RollCount; z++) {
                  var Result = randomizeTable()[Math.floor(Math.random() * 100)];
                  var HopperRes = UltraCore.getHopperKey(Result);
                  if(!UserDataLog.get("Unlocked").contains(HopperRes)) {
                    var UnlockedList = UserDataLog.get("Unlocked");
                    UnlockedList.add(HopperRes); CollectedEntries.add(HopperRes);
                    UserDataLog.put("Unlocked", UnlockedList); 
                    UserDataLog.put("GachaCoins", new java.lang.Integer(Coins-1));
                  }
                }
                if(CollectedEntries.isEmpty())
                  Player.sendMessage(Language.colorText("noNewGem", 'note'));
                else {
                  DataWatcher.put(UID, UserDataLog);
                  var DataWriter = new BufferedWriter(new FileWriter(Database));
                  DataWriter.write(DataWatcher.toJSONString());
                  DataWriter.flush(); DataWriter.close();
                  Player.sendMessage(Language.colorText("newGemUnlocked", 'note').replace(
                    "$a", CollectedEntries.size().toString()).concat("\n"));
                  CollectedEntries.stream.forEach(function(unlocked) {
                    var Painter = function(param) {
                      return ChatColor.translateAlternateColorCodes('&', param);
                    }
                    var Name = Painter("&5Ngọc &f" + UltraCore.translateKey(unlocked.split("_")[0]));
                    Player.sendMessage(Painter("&f &f &a+ ") + Name);
                  });
                }
              }
            }
          }); Scheduler.runTask(Host, new GachaFunction()); return 0;
        } else {
          Player.sendMessage(Language.colorText('noPermission', 'error'));
        }
        return -1;
      case "buy-coins":
        var UID = Player.getUniqueId().toString();
        if(DataWatcher.keySet().contains(UID)) {
          var StorageDataObject = Player.getMetadata("playerData").get(0).value();
          var UserDataObject = DataWatcher.get(UID);
          var OreReq = 10000; var ExpReq = 10000; var OreNode = true;
          ['coal','lapis','redstone','iron','gold','diamond','emerald'].forEach(function(e) {
            if(StorageDataObject.getBlock(UltraCore.getHopperKey(e)) < OreReq)
              OreNode = false;
          });
          if(OreNode) {
            if(UltraCore.calculatedXP(Player) >= ExpReq) {
              var PurchaseFunction = Java.extend(Runnable, {
                run: function() {
                  ['coal','lapis','redstone','iron','gold','diamond','emerald'].forEach(function(e) {
                    var KeyValue = UltraCore.getHopperKey(e);
                    var SRem = StorageDataObject.getBlock(KeyValue) - OreReq;
                    StorageDataObject.setBlock(KeyValue, SRem);
                  });
                  var XPRem = UltraCore.calculateContent(UltraCore.calculatedXP(Player), -ExpReq);
                  var IntInstance = new java.lang.Integer(XPRem[0].toString());
                  var FloatInstance = new java.lang.Float(XPRem[1].toString());
                  Player.setExp(FloatInstance); Player.setLevel(IntInstance);
                  UserDataObject.put("GachaCoins", UserDataObject.get("GachaCoins")+1);
                  DataWatcher.put(UID, UserDataObject);
                  var WriterObject = new BufferedWriter(new FileWriter(Database));
                  WriterObject.write(DataWatcher.toJSONString());
                  WriterObject.flush(); WriterObject.close();
                  Player.sendMessage(Language.colorText("obtainCoin", 'note'));
                }
              }); Scheduler.scheduleSyncDelayedTask(Host, new PurchaseFunction(), new java.lang.Long(20)); return 0;
            } else {
              Player.sendMessage(Language.colorText("notEnoughXP", 'error'));
            }
          } else {
            Player.sendMessage(Language.colorText("notEnoughMinerals", 'error'));
          }
        } else {
          Player.sendMessage(Language.colorText("noPermission", 'error'));
        }
        return -1;
      case "purchase":
        var StickProgress = new File(Host.getDataFolder().getAbsolutePath() + "/StickProgress.json");
        if(!StickProgress.exists()) StickProgress.createNewFile();
        var Progress = ScriptParser.parse(new BufferedReader(new FileReader(StickProgress)));
        var TotalEXPReq = 15000000; var PerMineralReq = 2000000; var UID = Player.getUniqueId().toString();
        return 0;
        function saveData() {
          var Writer = new BufferedWriter(new FileWriter(StickProgress));
          Writer.write(Progress.toJSONString());
          Writer.flush(); Writer.close();
        }
        switch(args[1].toLowerCase()) {
          case "register":
            if(!Progress.keySet().contains(UID) && !DataWatcher.keySet().contains(UID)) {
              var RegisteredDataObject = new JSONObject();
              RegisteredDataObject.put("Name", Player.getName());
              RegisteredDataObject.put("XP", Player.getName());
              var MineralArray = new JSONObject();
              ['coal','lapis','redstone','iron','gold','diamond','emerald'].forEach(function(e) {
                var AlternateHopperKeyValue = UltraCore.getHopperKey(e);
                MineralArray.put(AlternateHopperKeyValue, 0);
              }); RegisteredDataObject.put("Minerals", MineralArray);
              Progress.put(UID, RegisteredDataObject);
              saveData(); return 0;
            } else {
              Player.sendMessage(Language.colorText("alreadyRegistered", 'error'));
            }
            return -1;
          case "increment":
            if(!Progress.keySet().contains(UID))
              Player.sendMessage(Language.colorText('noPermission', 'error'));
            else {
              var PurchaseProgress = Progress.get(UID);
              var Nodes = ['coal','lapis','redstone','iron','gold','diamond','emerald','exp'];
              if(Nodes.indexOf(args[2].toLowerCase()) != -1) {
                var SwitchObjectModule = args[2].toLowerCase() == "exp" ? "XP" : "Mineral";
                switch(SwitchObjectModule) {
                  case "XP":
                    var ConvertEXPPoints = UltraCore.calculatedXP(Player);
                    var FixedValue = args[3].toLowerCase() == "all" ? ConvertEXPPoints : parseInt(args[3]);
                    if(isNaN(FixedValue)) {
                      Player.sendMessage(Language.colorText("invalidInt"));
                    } else {
                      FixedValue = FixedValue > ConvertEXPPoints ? ConvertEXPPoints : FixedValue;
                      var ProcessedContent = UltraCore.calculateContent(ConvertEXPPoints, -FixedValue);
                      var LevelOutput = new java.lang.Integer(ProcessedContent[0].toString());
                      var ProgressOutput = new java.lang.Float(ProcessedContent[1].toString());
                      Player.setLevel(LevelOutput); Player.setExp(ProgressOutput);
                      var LimitOutput = TotalEXPReq - PurchaseProgress.get("XP");
                      FixedValue = FixedValue > LimitOutput ? LimitOutput : FixedValue;
                      PurchaseProgress.put("XP", PurchaseProgress.get("XP") + FixedValue);
                      Progress.put(UID, PurchaseProgress);
                      saveData();
                      Player.sendMessage(Language.colorText("sentXP", 'note').replace(
                        "%t", FixedValue.toString()));
                      return 0;
                    }
                    break;
                  case "Mineral":
                    Nodes.pop(); var Format = args[2].toLowerCase();
                    if(Nodes.indexOf(Format) != -1) {
                      var Storage = Player.getMetadata("playerData").get(0).value();
                      var HopperAccess = UltraCore.getHopperKey(Format);
                      var Withdraw = args[3].toLowerCase() == "all" ? Storage.getBlock(HopperAccess) : parseInt(args[3]);
                      if(isNaN(Withdraw))
                        Player.sendMessage(Language.colorText("invalidInt", 'error')); 
                      else {
                        Withdraw = Withdraw > Storage.getBlock(HopperAccess) ? Storage.getBlock(HopperAccess) : Withdraw;
                        var Aftermath = Storage.getBlock(HopperAccess) - Withdraw;
                        Storage.setBlock(HopperAccess, Aftermath);
                        var MineralTable = PurchaseProgress.get("Mineral");
                        var LimitControl = Math.floor(PerMineralReq - MineralTable.get(HopperAccess));
                        Withdraw = Withdraw > LimitControl ? LimitControl : Withdraw;
                        MineralTable.put(HopperAccess, MineralTable.get(HopperAccess) + Withdraw);
                        PurchaseProgress.put("Mineral", MineralTable); Progress.put(UID, PurchaseProgress);
                        saveData();
                        Player.sendMessage(Language.colorText("sentMineral", 'note').replace(
                          "%t", Withdraw.toString()).replace("%n", UltraCore.translateKey(Format)));
                        return 0;
                      }
                    } else Player.sendMessage(Language.colorText("invalidType", 'error'));
                    return -1;
                }
                return 0;
              } else Player.sendMessage(Language.colorText("invalidItem").replace("%t", args[2].toLowerCase()));
            }
            return -1;
        }
        break;
    }
  } catch(err) {
    return "&5Ultra &8&l| &cLỗi: &f" + err.message;
  }
}
main();
