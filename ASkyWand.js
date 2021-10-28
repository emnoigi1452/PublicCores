var Player = BukkitPlayer;
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var Skyblock = Manager.getPlugin("ASkyblock");
var PlayerPoints = Manager.getPlugin("PlayerPoints");
var LuckPerms = Manager.getPlugin("LuckPerms");
var MyItems = Manager.getPlugin("MyItems");
var Plugin = Manager.getPlugin("PlaceholderAPI");
var Database = Plugin.getDataFolder().getAbsolutePath().concat("\\SkyWandData.json");

var ChatColor = org.bukkit.ChatColor;
var JSONParser = org.json.simple.parser.JSONParser;
var JSONObject = org.json.simple.JSONObject;
var JSONArray = org.json.simple.JSONArray;
var Location = org.bukkit.Location;
var Vector = org.bukkit.util.Vector;
var Material = org.bukkit.Material;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;

var Runnable = Java.type("java.lang.Runnable");
var File = Java.type("java.io.File");
var FileReader = Java.type("java.io.FileReader");
var FileWriter = Java.type("java.io.FileWriter");
var HashMap = Java.type("java.util.HashMap");
var ArrayList = Java.type("java.util.ArrayList");
var UUID = Java.type("java.util.UUID");
var Calendar = Java.type("java.util.Calendar");
var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var DecimalFormat = Java.type("java.text.DecimalFormat");

function SkyWandPlayer(dataMap, gifts, usageMap, status) {
   this.dataMap = dataMap;
   if(this.dataMap.class.getName() != "java.util.HashMap")
      throw "&cLỗi: &fKiểu dữ liệu không chính xác! Đây phải là &aHashMap";
   this.gifts = gifts;
   if(this.gifts.class.getName() != "java.util.ArrayList")
      throw "&cLỗi: &fKiểu dữ liệu không chính xác! Đây phải là &aArrayList";
   this.usageMap = usageMap;
   if(this.usageMap.class.getName() != "java.util.HashMap")
      throw "&cLỗi: &fKiểu dữ liệu không chính xác! Đây phải là &aHashMap";
   this.wandSwitch = status;
   if(typeof status != "boolean")
      throw "&cLỗi: &fKiểu dữ liệu sai! Đây phải là một &aBoolean&f!";
   this.getWandMode = function() {
      return this.wandSwitch;
   }
   this.toggleWand = function() {
      this.wandSwitch = !this.wandSwitch;
   }
   this.setWandMode = function(newWandMode) {
      if(typeof newWandMode != "boolean")
         throw "&cLỗi: &fKiểu dữ liệu không hợp lệ!";
      else this.wandSwitch = newWandMode;
   }
   this.getGifted = function() {
      return this.gifts;
   }
   this.addToGifted = function(user) {
      this.gifts.add(user.getUniqueId().toString());
   }
   this.resetGifts = function() {
      this.gifts.clear();
   }
   this.getDataInstance = function() {
      return this.dataMap.clone();
   }
   this.getBlockAmount = function(key) {
      key = key.toUpperCase();
      if(!this.dataMap.keySet().contains(key))
         throw "&cLỗi: &fMã block không hợp lệ! Hãy thử lại!";
      else return this.dataMap.get(key);
   }
   this.setBlockAmount = function(key, value) {
      key = key.toUpperCase();
      if(!this.dataMap.keySet().contains(key))
         throw "&cLỗi: &fMã block không hợp lệ! Hãy thử lại!";
      else {
         if(typeof value != "int" || value < 0)
            throw "&cLỗi: &fSố nhập vào không hợp lệ!";
         else this.dataMap.put(key, value);
      }
   }
   this.resetDatabase = function() {
      for each(var key in this.dataMap.keySet())
         this.dataMap.put(key, 0);
   }
   this.getUsageInstance = function() {
      return this.usageMap.clone();
   }
   this.getBlockUsage = function(key) {
      key = key.toUpperCase();
      if(!this.dataMap.keySet().contains(key))
         throw "&cLỗi: &fMã block không hợp lệ! Hãy thử lại!";
      else return this.dataMap().get(key)[0];
   }
   this.getBlocksPlaced = function(key) {
      key = key.toUpperCase();
      if(!this.dataMap.keySet().contains(key))
         throw "&cLỗi: &fMã block không hợp lệ! Hãy thử lại!";
      else return this.dataMap.get(key)[1];
   }
}

var ScriptUtils = {
   getMaterial: function(name) {
      switch(name) {
         case "IRON": return Material.IRON_BLOCK;
         case "GOLD": return Material.GOLD_BLOCK;
         case "DIAMOND": return Material.DIAMOND_BLOCK;
         case "EMERALD": return Material.EMERALD_BLOCK;
         default:
           throw "&cLỗi: &fLoại khoáng sản không hợp lệ!";
      }
   },
   getMaterialKey: function(mat) {
     switch(mat) {
       case IRON_BLOCK: return "IRON";
       case GOLD_BLOCK: return "GOLD";
       case DIAMOND_BLOCK: return "DIAMOND";
       case EMERALD_BLOCK: return "EMERALD";
     }
   },
   getTranslatedName: function(key) {
     switch(key) {
       case "IRON": return "&fKhối Sắt";
       case "GOLD": return "&6Khối Vàng";
       case "DIAMOND": return "&bKhối Kim Cương";
       case "EMERALD": return "&aKhối Lục Bảo";
     }
   },
   getLocationMap: function(loc1, loc2) {
      var locations = new ArrayList();
      var x1 = loc1.getBlockX(); var x2 = loc2.getBlockX();
      var z1 = loc2.getBlockZ(); var z2 = loc2.getBlockZ();
      for(; x1 <= x2; x1++) {
         for(; z1 <= z2; z1++) {
            locations.add([x1, z1]);
         }
      } return locations;
   },
   timeCalc: function(ticks) {
      return ticks / 20;
   },
   validateLoc: function(offset, baseIslandLoc) {
     var IslandAt = Skyblock.getGrid().getIslandAt(offset);
     return IslandAt.center().equals(baseIslandLoc);
   }
};

function main() {
   try {
      var DatabaseFile = new File(Database); if(!DatabaseFile.exists()) DatabaseFile.createNewFile();
      var ASkyData = new JSONParser().parse(new FileReader(DatabaseFile));
      var ASkyPlayerInstance = null;
      if(ASkyData.keySet().contains(Player.getUniqueId().toString())) {
         var playerParse = ASkyData.get(Player.getUniqueId().toString());
         var databaseInstance = playerParse.get("Storage");
         var gifts = playerParse.get("Gifts");
         var usageMap = playerParse.get("Usage");
         ASkyPlayerInstance = new ASkyPlayer(databaseInstance, gifts, usageMap, playerParse.get("Status"));
      }
      if(Skyblock == null || LuckPerms == null || MyItems == null)
         throw "&cLỗi: &fKhông có đủ plugin. Cần có: &aASkyblock&f, &aLuckPerms &fvà &aMyItems";
      switch(args[0].toLowerCase()) {
         case "build":
           var GridManager = Skyblock.getGrid(); var Players = Skyblock.getPlayers();
           if(Players.hasIsland(Player.getUniqueId().toString())) {
              var PlayerInstance = Players.get(Player.getUniqueId());
              if(GridManager.getIslandAt(Player.getLocation()) == null ||
                 GridManager.getIslandAt(Player.getLocation()).center().equals(PlayerInstance.getIslandLocation()))
                throw "&cLỗi: &fBạn đang không ở trên đảo của mình! Hãy thử lại ở đảo của mình!";
              else {
                if(ASkyPlayerInstance == null) throw "&cLỗi: &fBạn không có quyền sử dụng vật phẩm này!";
                if(!Player.hasMetadata("buildRegion")) throw "&fBạn chưa đặt vùng tiến hành xây dựng!";
                else {
                  var PlayerIslandLocation = PlayerInstance.getIslandLocation();
                  var coords = Player.getMetadata("buildRegion").get(0).value(0); var placed = 0;
                  var p1 = coords.get("pos1"); var p2 = coords.get("pos2"); var World = Player.getWorld();
                  var loc1 = new Location(World, p1[0], p1[1], p1[2]);
                  var loc2 = new Location(World, p2[0], p2[1], p2[2]);
                  if(!ScriptUtils.validateLoc(loc1, PlayerIslandLocation) || !ScriptUtils.validateLoc(loc2, PlayerIslandLocation))
                    throw "&cLỗi: &fMột trong hai vị trí của vùng xây dựng không nằm trên đảo bạn!";
                  var buildType = coords.get("blockType"); var balance = ASkyPlayerInstance.getBlockAmount(buildType);
                  if(balance < 1) throw "&cLỗi: &fTrong kho chứa khối không có đủ khoáng sản!";
                  else {
                     var blocks = ScriptUtils.getLocationMap(loc1, loc2); var current; var y = loc1.getBlockY();
                     var PlacedBlockType = ScriptUtils.getMaterial(buildType); var ticks = 0;
                     var ChangeType = Java.extend(Runnable, {
                        run: function() {
                           var currentBlock = current.getBlock();
                           if(currentBlock.getType().equals(Material.AIR)) {
                              currentBlock.setType(PlacedBlockType);
                              placed++;
                           }
                        }
                     });
                     var FloorHandler = Java.extend(Runnable, {
                        run: function() {
                           for each(var blockLoc in blocks) {
                              current = new Location(blockLoc[0], y, blockLoc[1]);
                              if(balance == 0)
                                 throw "&fĐã hoàn tất xây dựng! Đặt &a" + placed.toString() + " &ftrong vòng &a" + ScriptUtils.timeCalc(ticks).toFixed(1) + "s&f!";
                              else {
                                 Scheduler.runTaskLater(Plugin, new ChangeType(), 2);
                                 balance--; ticks += 2;
                              }
                           }
                        }
                     });
                     var MainBuildTask = Java.extend(Runnable, {
                        run: function() {
                           for(; y <= loc2.getBlockY(); y++) {
                              Scheduler.runTaskLater(Plugin, new FloorHandler(), 20);
                              ticks += 20;
                           }
                           throw "&fĐã hoàn tất xây dựng! Đặt &a" + placed.toString() + " &ftrong vòng &a" + ScriptUtils.timeCalc(ticks).toFixed(1) + "s&f!";
                        }
                     });
                     Scheduler.runTask(Plugin, new MainBuildTask()); break;
                  }
                }
              }
           } else throw "&cLỗi: &fKhông có đảo mà đòi dùng đũa hả -.-"; break;
         case "setPos":
           var fixedId = parseInt(args[1]);
           if(isNaN(fixedId) && !(fixedId == 1 || fixedId == 2))
             throw "&cLỗi: &fSố ID vị trí không hợp lệ!";
           else {
              var GridManager = Skyblock.getGrid(); var APlayer = Skyblock.getPlayers().get(Player.getUniqueId());
              if(GridManager.getIslandAt(Player.getLocation()) == null ||
                 !GridManager.getIslandAt(Player.getLocation()).center().equals(APlayer.getIslandLocation()))
                throw "&cLỗi: &fBạn chỉ được quyền đặt điểm xây dựng tại đảo của mình!";
              else {
                 var fixedPositions; var PlayerLoc = Player.getLocation();
                 if(!Player.hasMetadata("buildRegion")) {
                    var hashPos = new HashMap(); hashPos.put('pos1', [0, 0, 0]); hashPos.put('pos2', [0, 0, 0]);
                    fixedPositions = hashPos; Player.setMetadata("buildRegion", new FixedMetadataValue(Plugin, hashPos));
                 } else fixedPositions = Player.getMetadata("buildRegion").get(0).value();
                 var x = PlayerLoc.getBlockX(); var y = PlayerLoc.getBlockY(); var z = PlayerLoc.getBlockZ();
                 if(y < 1 || y > 255)
                   throw "&cLỗi: &fBạn chỉ được đặt điểm trong tầng y từ &a1-255&f!";
                 var main = 'pos'.concat(fixedId.toString()); var other = 'pos'.concat(main.contain('1') ? '2' : '1');
                 var presetArray = fixedPositions.get(other);
                 if([x, y, z] == presetArray)
                   throw "&cLỗi: &fBạn không thể đặt hai điểm trùng nhau!";
                 else {
                   fixedPositions.put(main, [x,y,z]);  Player.setMetadata('buildRegion', new FixedMetadataValue(Plugin, fixedPositions));
                   throw "&fĐã đặt vị trí &a" + fixedId.toString() + " &ftại &a" + x.toString() + " " + y.toString() + " " + z.toString(); 
                 }
              }
           }
        case "deposit":
          var playerInv = Player.getInventory(); var depositted = 0;
          var type = ScriptUtils.getMaterial(args[1.toUpperCase());
          var Deposit = Java.extend(Runnable, {
            run: function() {
              for(var j = 0; j < 36; j++) {
                var itemStack = playerInv.getItem(j);
                var stackType = itemStack.getType();
                if(!stackType.equals(type)) continue;
                else {
                  var MaterialKey = ScriptUtils.getMaterialKey(type);
                  ASkyPlayerInstance.setBlockAmount(MaterialKey, ASkyPlayerInstance.getBlockAmount(MaterialKey) + itemStack.getAmount());
                  playerInv.setItem(j, null); continue;
                }
              }  
            }
          }); Scheduler.runTask(Plugin, new Deposit()); 
          throw "&fĐã bỏ vào kho khối &a%a &f%name%&f!".replace("%a", depositted.toString())
          .replace("%name%", ScriptUtils.getTranslatedName(ScriptUtils.getMaterialKey(type)));
      }
   } catch(err) {
      return "&bASkyWand &8&l| " + err.message;
   } finally {
      var dataMap = new JSONObject(ASkyPlayerInstance.getDataInstance());
      var usageMap = new JSONObject(ASASkyPlayerInstance.getUsageInstance());
      var giftArray = new JSONArray(ASkyPlayerInstance.getGifted());
      var userMap = new JSONObject();
      userMap.put("Storage", dataMap); userMap.put("Gifts", giftArray); userMap.put("Usage", usageMap);
      ASkyData.put(Player.getUniqueId().toString(), userMap);
      var JSONWriter = new FileWriter(Database);
      JSONWriter.write(ASkyData.toJSONString()); JSONWriter.flush(); JSONWriter.close();
   }
}
