/* SuperiorCore - A tool system to help players manipulate SuperiorSkyblock's stack block
 * 
 * I. Introduction
 * [-] Hi there, it's been a while since my last major project, SuperiorCore. Ever since that project, I've been
 * expanding my knowledge on how to fully grasp control of the SpigotAPI. And today, I'm taking on the challenge
 * to recode my SuperiorCore with more advanced techniques.
 * [-] So, what's different for this time? This version of SuperiorCore has block-recognition. Meaning the same
 * code can execute for multiple types of blocks. Also, multi-threading and task-scheduling are implemented, so
 * the server can handle tasks much easier.
 * [-] PreventHopper manipulating is vastly improved since the last version. This version offers to code to
 * directly edit the player's metadata (Which is where the playerData class of PreventHopper stores its
 * data for each individual player). This allows the code to directly manipulate the storage without requiring
 * the player to relog for data-editting.

 * Modes currently available within Superior.js:
 *   - build: Execute the building process to the block the executor is targetting
 *   - deposit/withdraw (@params: 1): Deposit/Withdraw minerals from the database
 *   - status (@params: 2-3): Check/Toggle the status of the player's wand
 *   - logs: Displays a list of all SuperiorWand users on the server
 *   - phm: An updated version of PreventHopper's block-compression task
 */

// PlaceholderAPI objects
var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var Plugin = Manager.getPlugin("PlaceholderAPI");
var Database = Plugin.getDataFolder() + "\\SuperiorWand";
// SpigotAPI classes
var ChatColor = org.bukkit.ChatColor;
var Material = org.bukkit.Material;
var ItemStack = org.bukkit.inventory.ItemStack;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
// Java classes
var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");
var HashMap = Java.type("java.util.HashMap");
var ArrayList = Java.type("java.util.ArrayList");
var File = Java.type("java.io.File");
var HashSet = Java.type("java.util.HashSet");
var System = Java.type("java.lang.System");
var DecimalFormat = Java.type("java.text.DecimalFormat");
var HashMap = Java.type("java.util.HashMap");
var UUID = Java.type("java.util.UUID");

/* This is the Script Manager, the collections of all functions used in the main code */

var ScriptManager = {
  CONFIG_PATH: function(mode_input) {
    return "Storage." + mode_input.toUpperCase();
  },
  getMaterial: function(node) {
    switch(node.toLowerCase()) {
      case "gold": return Material.GOLD_BLOCK;
      case "diamond": return Material.DIAMOND_BLOCK;
      case "emerald": return Material.EMERALD_BLOCK;
      default: return null;
    }
  },
  validBlock: function(block_name) {
    switch(block_name.toUpperCase()) {
      case "GOLD_BLOCK":
      case "DIAMOND_BLOCK":
      case "EMERALD_BLOCK":
        return true;
      default: return false;
    }
  },
  errorList: function(type) {
    switch(type.toLowerCase()) {
      case "no-permission": return "&eSuperior &8&l| &cLỗi: &fBạn không có quyền được sử dụng lệnh này!";
      case "not-enough-plugin": return "&eScript &8&l| &cLỗi: &fKhông có đủ phần mềm để chạy script này!";
      case "invalid-block": return "&eSuperior &8&l| &cLỗi: &fKhối bạn nhắm vào là khối không hợp lệ!";
      case "invalid-material": return "&eSuperior &8&l| &cLỗi: &fLoại khối không hợp lệ!"
      case "not-owner": return "&eSuperior &8&l| &cLỗi: &fBạn không có quyền sử dụng đũa này!";
      case "not-enabled": return "&eSuperior &8&l| &cLỗi: &fĐũa của bạn chưa được &aBật&f!";
      case "invalid-world": return "&eSuperior &8&l| &cLỗi: &fBạn chỉ được phép dùng đũa ở đảo bay!";
      case "insufficient-balance": return "&eSuperior &8&l| &cLỗi: &fKho chứa khoáng sản của đũa không đủ khoáng sản!";
      case "invalid-node": return "&eScript &8&l| &cLỗi: &fTuỳ chọn lệnh không hợp lệ!";
      case "insufficient-arguments": return "&eScript &8&l| &cLỗi: &fCú pháp lệnh bị thiếu! Vui lòng kiểm tra lại!";
      case "no-shulker-box": return "&eSuperior &8&l| &cLỗi: &fTrong túi đồ của bạn không có hộp shulker trống!";
      case "invalid-inputs": return "&eScript &8&l| &cLỗi: &fNhận được cú pháp không hợp lệ! Hãy thử lại!";
    }
  },
  generateFile: function(id) {
    var unique_file_id = id.getUniqueId().toString() + ".yml";
    var path = Database + "\\" + unique_file_id;
    var file_instance = new File(path);
    if(!file_instance.exists()) {
      var config = YamlConfiguration.loadConfiguration(file_instance);
      config.set("Player", id.getName());
      config.set("Enabled", false);
      config.set("Storage.GOLD", 0);
      config.set("Storage.DIAMOND", 0); 
      config.set("Storage.EMERALD", 0);
      config.save(file_instance);
    }
    return file_instance;  
  },
  transparentSet: function() {
    var defaultSet = new HashSet();
    var list = [Material.WATER, Material.STATIONARY_WATER, Material.LAVA, Material.STATIONARY_LAVA, Material.AIR];
    defaultSet.addAll(list); return defaultSet;
  },
  translatedName: function(node) {
    switch(node.toLowerCase()) {
      case "gold": return "&6Khối Vàng";
      case "diamond": return "&bKhối Kim Cương";
      case "emerald": return "&aKhối Ngọc Lục Bảo";
    }
  },
  colorHandler: function(param) {
    return ChatColor.translateAlternateColorCodes('&', param);
  }
}; // Object

function main() {
  try {
    var Skyblock = Manager.getPlugin("SuperiorSkyblock2"); 
    var Essentials = Manager.getPlugin("Essentials");
    var LuckPerms = Manager.getPlugin("LuckPerms");
    if(Skyblock == null || Essentials == null || LuckPerms == null)
      throw ScriptManager.errorList("not-enough-plugin");
    var Home_Folder = new File(Database); if(!Home_Folder.exists()) Home_Folder.mkdir();
    var Player_Main_File = ScriptManager.generateFile(Player);
    switch(args[0].toLowerCase()) {
      case "build":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("not-owner")));
          return;
        }
        if(Player.getWorld().getName() != "SuperiorWorld") {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("invalid-world")));
          return;
        }
        var block = Player.getTargetBlock(ScriptManager.transparentSet(), 3);
        if(ScriptManager.validBlock(block.getType().name())) {
          var mode = block.getType().name().replaceAll("_BLOCK", "");
          var config = YamlConfiguration.loadConfiguration(Player_Main_File);
          if(!config.get("Enabled")) {
            Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("not-enabled")));
            return;
          }
          else {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fĐang tiến hành đặt tất cả " + ScriptManager.translatedName(mode) + " &ftrong kho!"));
            var block_balance = config.get(ScriptManager.CONFIG_PATH(mode));
            if(block_balance < 1) {
              Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("insufficient-balance")));
              return;
            }
            var Task = Java.extend(Runnable, {
              run: function() {
                var recalc = "is admin recalc " + Player.getName();
                Skyblock.getGrid().setBlockAmount(block, Skyblock.getGrid().getBlockAmount(block)+block_balance);
                Server.dispatchCommand(Console, recalc);
                config.set(ScriptManager.CONFIG_PATH(mode), 0);
                config.save(Player_Main_File);
              }
            });
            var start = System.nanoTime(); Scheduler.runTask(Plugin, new Task()); var end = System.nanoTime();
            var formatter = new DecimalFormat("#0.0"); var time = formatter.format((end-start)/1000000);
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fĐã đặt &a" + block_balance.toString() + " " + ScriptManager.translatedName(mode) + " &ftrong vòng &a" + time + "ms"));
            return "&7";
          }
        } else Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("invalid-block")));
        break;
      case "withdraw":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("not-owner")));
          return;
        }
        var type = args[1].charAt(0).toUpperCase() + args[1].substring(1);
        var block_type = args[1].toUpperCase() + "_BLOCK";
        if(ScriptManager.validBlock(block_type)) {
          var config_instance = YamlConfiguration.loadConfiguration(Player_Main_File);
          var balance = config_instance.get(ScriptManager.CONFIG_PATH(type));
          if(balance < 1) {
            Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("insufficient-balance")));
            return balance;
          }
          var available_slots = 0; var given = 0;
          for(var j = 0; j < 36; j++) {
            var slot = Player.getInventory().getItem(j);
            if(slot == null) {
              available_slots += 64;
              continue;
            }
            if(slot.getType().name() == block_type) {
              available_slots += (64 - slot.getAmount());
              continue;
            }
          } var given = available_slots > balance ? balance : available_slots; balance -= given;
          var command = "give " + Player.getName() + " " + block_type.toLowerCase() + " " + given.toString();
          Server.dispatchCommand(Console, command);
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fBạn đã rút &a" + given.toString() + " " + ScriptManager.translatedName(type) + " &ftừ kho của đũa ma thuật!"));
          config_instance.set(ScriptManager.CONFIG_PATH(type), balance);
          config_instance.save(Player_Main_File);
          return "&7";
        } else
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("invalid-material")));
        return "&7";
        break;
      case "deposit":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("not-owner")));
          return;
        }
        var config = YamlConfiguration.loadConfiguration(Player_Main_File);
        var type = args[1].charAt(0).toUpperCase() + args[1].substring(1);
        var block_type = args[1].toUpperCase() + "_BLOCK";
        var deposit_amount = 0;
        if(ScriptManager.validBlock(block_type)) {
          for(var k = 0; k < 36; k++) {
            var slot = Player.getInventory().getItem(k);
            if(slot != null && slot.getType() == block_type) {
              deposit_amount += slot.getAmount();
              slot.setAmount(0);
            }
          }
          if(deposit_amount < 1) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fTrong túi của bạn không có " + ScriptManager.translatedName(args[1]) + " &fđể gửi vào đũa!"));
            return;
          } else {
            config.set(ScriptManager.CONFIG_PATH(type), config.get(ScriptManager.CONFIG_PATH(type)) + deposit_amount);
            config.save(Player_Main_File);
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fĐã gửi thành công &a" + deposit_amount.toString() + " &fvào kho chứa " + ScriptManager.translatedName(args[1])));
            return "&7";
          }
        }
        break;
      case "status":
        var player_manager = YamlConfiguration.loadConfiguration(Player_Main_File);
        var status = player_manager.get("Enabled"); // path to check enable status
        if(args.length < 2) throw ScriptManager.errorList("insufficient-arguments");
        else {
          if(args[1].toLowerCase() == "toggle") {
            status = !status; player_manager.set("Enabled", status); player_manager.save(Player_Main_File);
            var action = status ? "&aBật" : "&cTắt";
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fBạn đã " + action + " &ftính năng của đũa!"));
            return "&7";
          } else if(args[1].toLowerCase() == "display") {
            if(args.length == 3 && args[2] == "change") {
              return status ? "&cTắt" : "&aBật"; // ?
            } else {
              return status ? "&aBật" : "&cTắt"; // :v
            }
          } else throw ScriptManager.errorList("invalid-node"); // Invalid sub-command
        }
        break;
      case "storage":
        var config = YamlConfiguration.loadConfiguration(Player_Main_File); // Config instance
        if(args.length < 2) throw ScriptManager.errorList("insufficient-arguments");
        return config.get(ScriptManager.CONFIG_PATH(args[1])).toString();
        /* break; */
      case "add":
        var type = args[1]; var amount = parseInt(args[2]); // verified inputs
        if(isNaN(amount) || !ScriptManager.validBlock(type.toUpperCase() + "_BLOCK"))
          throw ScriptManager.errorList("invalid-inputs");
        else {
          var config = YamlConfiguration.loadConfiguration(Player_Main_File);
          config.set(ScriptManager.CONFIG_PATH(type), config.get(ScriptManager.CONFIG_PATH(type)) + amount);
          config.save(Player_Main_File);
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fBạn đã nhận được &a+" + amount.toString() + " " + ScriptManager.translatedName(type) + " &ftừ hệ thống!")); return;
        }; return 0;
      case "reset":
        for each(var f in new File(Database).listFiles()) {
          if(!f.isDirectory()) {
            var config = YamlConfiguration.loadConfiguration(f);
            config.set("Storage.GOLD", 0);
            config.set("Storage.DIAMOND", 0);
            config.set("Storage.EMERALD", 0);
            config.save(f);
          }
        }
        return "&eSuperior &8&l| &aThông báo: &fĐã hoàn tất reset cơ sở dữ liệu của các đũa ma thuật!"; // message
        break;
      case "logs":
        var uids = new ArrayList();
        for each(var f in new File(Database).listFiles()) {
          if(!f.isDirectory())
            uids.add(f.getName().replaceAll(".yml", ""));
        }
        var message = "&eSuperior &8&l| &fSố người đã mua đũa ma thuật: &a" + uids.size();
        Player.sendMessage(ScriptManager.colorHandler(message));
        for each(var id in uids) {
          var buyer = Server.getOfflinePlayer(UUID.fromString(id))
          Player.sendMessage(ScriptManager.colorHandler("&f &f &8[&a+&8] &f" + buyer.getName()));
        } // done
        return;
        break;
      case "purchase":
        var price = 30000; var balance = Manager.getPlugin("PlayerPoints").getAPI().look(Player.getUniqueId());
        var sufficient = balance >= price; var has_slot = false;
        for(var i = 0; i < 36; i++) { if(Player.getInventory().getItem(i) == null) { has_slot = true; break; }};
        var errors = sufficient && has_slot ? 0 : sufficient != has_slot ? 1 : 2;
        if(errors != 0) {
          var message = "&eSuperior &8&l| &cLỗi: &fĐã xảy ra &c" + errors.toString() + " &fvấn đề khi cố thực hiện giao dịch";
          if(!sufficient) message += "\n&f &8&l[&a+&8&l] &fBạn không có đủ &6Xu &fđể tiến hành giao dịch! Yêu cầu &a30000 &6Xu";
          if(!has_slot) message += "\n&f &8&l[&a+&8&l] &fTúi đồ bạn không có chỗ để nhận vật phẩm!";
          Player.sendMessage(ScriptManager.colorHandler(message)); return; // done
        } else {
          var Purchase = Java.extend(Runnable, {
            run: function() {
              var Give = "mi load custom superiorwand " + Player.getName() + " 1";
              var MessageInfo = "&eSuperior &8&l| &aThông báo: &fĐã mua thành công &5Đũa Ma Thuật&f.";
              var Broadcast = "&eSuperior &8&l| &a" + Player.getName() + " &fđã trở thành chủ nhân của &5Đũa Ma Thuật&f.";
              if(!Player.hasPermission("superiorwand.universal"))
                Server.dispatchCommand(Console, "lp user " + Player.getName() + " permission set superiorwand.universal");
              Manager.getPlugin("PlayerPoints").getAPI().take(BukkitPlayer.getUniqueId(), price);
              Server.dispatchCommand(Console, Give);
              Server.broadcastMessage(ScriptManager.colorHandler(Broadcast));
              Player.sendMessage(ScriptManager.colorHandler(MessageInfo)); 
            }
          }); Scheduler.runTask(Plugin, new Purchase()); return 0; // execute task
        }
        break;
      case "phm":
        var type = args[1]; var metadata = Player.getMetadata("playerData").get(0).value(); // instance of playerData
        var config = YamlConfiguration.loadConfiguration(Player_Main_File);
        if(!ScriptManager.validBlock(type.toUpperCase() + "_BLOCK")) {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("invalid-block"))); return;
        } else {
          var balance = metadata.getBlock(type == "gold" ? type.toUpperCase() + "_INGOT" : type.toUpperCase());
          if(balance > 9) {
            var Compression = Java.extend(Runnable, {
              run: function() {
                var block_count = Math.floor(balance/9); balance -= (block_count*9); 
                metadata.setBlock(type == "gold" ? type.toUpperCase() + "_INGOT" : type.toUpperCase(), balance) 
                config.set(ScriptManager.CONFIG_PATH(type), config.get(ScriptManager.CONFIG_PATH(type))+block_count);
                config.save(Player_Main_File); // save
                Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fChuyển đổi thành công vật phẩm từ kho khoáng sản, bạn nhận được &a" + block_count.toString() + " " + ScriptManager.translatedName(type)));
              }
            }); new Thread(new Compression()).start(); // execute on seperate thread
          } else {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fKho chứa khoáng sản không có đủ vật phẩm để tiến hành chuyển đổi!")); return;
          }
        } return 0;
        break;
      case "update":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler(ScriptManager.errorList("no-permission"))); return;
        } else {
          var item = Player.getInventory().getItemInMainHand(); if(item == null) return;
          var meta = item.getItemMeta();
          if(!meta.hasDisplayName() || !ChatColor.stripColor(meta.getDisplayName().contains("SuperiorWand |"))) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fBạn cần phải cầm bản cũ của &5Đũa Ma Thuật &ftrên tay để tiến hành update!")); return;
          } else {
            var Task = Java.extend(Runnable, {
              run: function() {
                var Give = "mi load custom superiorwand " + Player.getName() + " 1";
                Player.getInventory().setItemInMainHand(null);
                Server.dispatchCommand(Console, Give);
                Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fĐã cập nhật thành công đũa!"));
              }
            }); Scheduler.runTask(Plugin, new Purchase()); return 0;
          }
        }
        break;
      case "gift":
        var sendTo = args[1]; var receiverInstance = Server.getPlayer(sendTo);
        if(receiverInstance == null) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fNgười chơi này hiện không trực tuyến!")); return;
        } else {
          var has_slot = false; var c = 0; var take_slot = -1;
          for(var j = 0; j < 36; j++) { if(receiverInstance.getInventory().getItem(j) == null) { has_slot = true; break; } }
          for(var i = 0; i < 36; i++) {
             var is = Player.getInventory().getItem(i);
             if(is != null) {
              var meta = is.getItemMeta();
              if(meta.hasDisplayName() && ChatColor.stripColor(meta.getDisplayName()).contains("SuperiorWand |"))
              { c++; take_slot = i; }
             } else continue;
          } var has_wands = c >= 2 && take_slot != -1;
          if(!has_wands) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fPhải có tối thiểu &a2 &5Đũa Ma Thuật &fbản mới trong túi đồ để tiến hành gửi tặng!")); return;
          }
          if(!has_slot) {
            receiverInstance.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &a" + Player.getName() + " &fđã gửi tặng bạn &a1 &5Đũa Ma Thuật&f, nhưng túi của bạn không có chỗ nên đã bị huỷ!"));
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &fTúi đồ của &a" + receiverInstance.getName() + " &fhiện không đủ chỗ để nhận đũa!")); return;
          }
          if(receiverInstance.hasPermission("superiorwand.universal")) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cLỗi: &a" + receiverInstance.getName() + " &fđã có &5Đũa Ma Thuật &frồi!")); return;
          } else {
            var lp = "lp user " + receiverInstance.getName() + " permission set superiorwand.universal true";
            var give = "mi load superiorwand " + receiverInstance.getName() + " 1";
            Player.getInventory().setItem(take_slot, null);
            Server.dispatchCommand(Console, lp); Server.dispatchCommand(Console, give);
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &dGhi chú: &fBạn đã gửi tặng &a" + receiverInstance.getName() + " &5Đũa Ma Thuật &fthành công!"));
            var config = YamlConfiguration.loadConfiguration(Player_Main_File);
            var gifts = config.contains("Gifts") ? config.get("Gifts") : new ArrayList();
            gifts.add(receiverInstance.getName()); config.set("Gifts", gifts);
            config.save(Player_Main_File);
            receiverInstance.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aThông báo: &fBạn đã nhận được &5Đũa Ma Thuật &ftừ &a" + Player.getName() + "&f. Một món quà đắt đỏ, nhỉ? &d<3"));
          }
        } return 0;
        break;
      default: throw ScriptManager.errorList("invalid-node"); // Invalid sub-command
    }
  } catch(err) {
    var error = err.name + " - " + err.message;
    if(error.indexOf("Lỗi") == -1)
      return "&eScript &8&l| &cLỗi: &f" + error;
    else return error; 
  }
}

main();
