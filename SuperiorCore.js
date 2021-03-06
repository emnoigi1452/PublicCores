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
      case "no-permission": return "&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n ???????c s??? d???ng l???nh n??y!";
      case "not-enough-plugin": return "&eScript &8&l| &cL???i: &fKh??ng c?? ????? ph???n m???m ????? ch???y script n??y!";
      case "invalid-block": return "&eSuperior &8&l| &cL???i: &fKh???i b???n nh???m v??o l?? kh???i kh??ng h???p l???!";
      case "invalid-material": return "&eSuperior &8&l| &cL???i: &fLo???i kh???i kh??ng h???p l???!"
      case "not-owner": return "&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n s??? d???ng ????a n??y!";
      case "not-enabled": return "&eSuperior &8&l| &cL???i: &f????a c???a b???n ch??a ???????c &aB???t&f!";
      case "invalid-world": return "&eSuperior &8&l| &cL???i: &fB???n ch??? ???????c ph??p d??ng ????a ??? ?????o bay!";
      case "insufficient-balance": return "&eSuperior &8&l| &cL???i: &fKho ch???a kho??ng s???n c???a ????a kh??ng ????? kho??ng s???n!";
      case "invalid-node": return "&eScript &8&l| &cL???i: &fTu??? ch???n l???nh kh??ng h???p l???!";
      case "insufficient-arguments": return "&eScript &8&l| &cL???i: &fC?? ph??p l???nh b??? thi???u! Vui l??ng ki???m tra l???i!";
      case "no-shulker-box": return "&eSuperior &8&l| &cL???i: &fTrong t??i ????? c???a b???n kh??ng c?? h???p shulker tr???ng!";
      case "invalid-inputs": return "&eScript &8&l| &cL???i: &fNh???n ???????c c?? ph??p kh??ng h???p l???! H??y th??? l???i!";
    }
  },
  generateFile: function(id) {
    if(!Player.hasPermission("superiorwand.universal"))
      return null;
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
      case "gold": return "&6Kh???i V??ng";
      case "diamond": return "&bKh???i Kim C????ng";
      case "emerald": return "&aKh???i Ng???c L???c B???o";
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
    if(Player_Main_File == null)
      return -1;
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
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &f??ang ti???n h??nh ?????t t???t c??? " + ScriptManager.translatedName(mode) + " &ftrong kho!"));
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
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &f???? ?????t &a" + block_balance.toString() + " " + ScriptManager.translatedName(mode) + " &ftrong v??ng &a" + time + "ms"));
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
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &fB???n ???? r??t &a" + given.toString() + " " + ScriptManager.translatedName(type) + " &ft??? kho c???a ????a ma thu???t!"));
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
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fTrong t??i c???a b???n kh??ng c?? " + ScriptManager.translatedName(args[1]) + " &f????? g???i v??o ????a!"));
            return;
          } else {
            config.set(ScriptManager.CONFIG_PATH(type), config.get(ScriptManager.CONFIG_PATH(type)) + deposit_amount);
            config.save(Player_Main_File);
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &f???? g???i th??nh c??ng &a" + deposit_amount.toString() + " &fv??o kho ch???a " + ScriptManager.translatedName(args[1])));
            return "&7";
          }
        }
        break;
      case "status":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n d??ng t??nh n??ng n??y!"));
          return;
        }
        var player_manager = YamlConfiguration.loadConfiguration(Player_Main_File);
        var status = player_manager.get("Enabled"); // path to check enable status
        if(args.length < 2) throw ScriptManager.errorList("insufficient-arguments");
        else {
          if(args[1].toLowerCase() == "toggle") {
            status = !status; player_manager.set("Enabled", status); player_manager.save(Player_Main_File);
            var action = status ? "&aB???t" : "&cT???t";
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &fB???n ???? " + action + " &ft??nh n??ng c???a ????a!"));
            return "&7";
          } else if(args[1].toLowerCase() == "display") {
            if(args.length == 3 && args[2] == "change") {
              return status ? "&cT???t" : "&aB???t"; // ?
            } else {
              return status ? "&aB???t" : "&cT???t"; // :v
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
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &fB???n ???? nh???n ???????c &a+" + amount.toString() + " " + ScriptManager.translatedName(type) + " &ft??? h??? th???ng!")); return;
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
        return "&eSuperior &8&l| &aTh??ng b??o: &f???? ho??n t???t reset c?? s??? d??? li???u c???a c??c ????a ma thu???t!"; // message
        break;
      case "logs":
        var uids = new ArrayList();
        for each(var f in new File(Database).listFiles()) {
          if(!f.isDirectory())
            uids.add(f.getName().replaceAll(".yml", ""));
        }
        var message = "&eSuperior &8&l| &fS??? ng?????i ???? mua ????a ma thu???t: &a" + uids.size();
        Player.sendMessage(ScriptManager.colorHandler(message));
        for each(var id in uids) {
          var buyer = Server.getOfflinePlayer(UUID.fromString(id))
          Player.sendMessage(ScriptManager.colorHandler("&f &f &8[&a+&8] &f" + buyer.getName()));
        } // done
        return;
        break;
      case "purchase":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n d??ng t??nh n??ng n??y!"));
          return;
        }
        var price = 30000; var balance = Manager.getPlugin("PlayerPoints").getAPI().look(Player.getUniqueId());
        var sufficient = balance >= price; var has_slot = false;
        for(var i = 0; i < 36; i++) { if(Player.getInventory().getItem(i) == null) { has_slot = true; break; }};
        var errors = sufficient && has_slot ? 0 : sufficient != has_slot ? 1 : 2;
        if(errors != 0) {
          var message = "&eSuperior &8&l| &cL???i: &f???? x???y ra &c" + errors.toString() + " &fv???n ????? khi c??? th???c hi???n giao d???ch";
          if(!sufficient) message += "\n&f &8&l[&a+&8&l] &fB???n kh??ng c?? ????? &6Xu &f????? ti???n h??nh giao d???ch! Y??u c???u &a30000 &6Xu";
          if(!has_slot) message += "\n&f &8&l[&a+&8&l] &fT??i ????? b???n kh??ng c?? ch??? ????? nh???n v???t ph???m!";
          Player.sendMessage(ScriptManager.colorHandler(message)); return; // done
        } else {
          var Purchase = Java.extend(Runnable, {
            run: function() {
              var Give = "mi load custom superiorwand " + Player.getName() + " 1";
              var MessageInfo = "&eSuperior &8&l| &aTh??ng b??o: &f???? mua th??nh c??ng &5????a Ma Thu???t&f.";
              var Broadcast = "&eSuperior &8&l| &a" + Player.getName() + " &f???? tr??? th??nh ch??? nh??n c???a &5????a Ma Thu???t&f.";
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
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n d??ng t??nh n??ng n??y!"));
          return;
        }
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
                Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &fChuy???n ?????i th??nh c??ng v???t ph???m t??? kho kho??ng s???n, b???n nh???n ???????c &a" + block_count.toString() + " " + ScriptManager.translatedName(type)));
              }
            }); new Thread(new Compression()).start(); // execute on seperate thread
          } else {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fKho ch???a kho??ng s???n kh??ng c?? ????? v???t ph???m ????? ti???n h??nh chuy???n ?????i!")); return;
          }
        } return 0;
        break;
      case "update":
        Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aGhi ch??: &fT??nh n??ng n??y ???? ng???ng ho???t ?????ng &c:( &fTi???c ha..."))
        return -1;
      case "gift":
        if(!Player.hasPermission("superiorwand.universal")) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fB???n kh??ng c?? quy???n d??ng t??nh n??ng n??y!"));
          return;
        }
        var sendTo = args[1]; var receiverInstance = Server.getPlayer(sendTo);
        if(receiverInstance == null) {
          Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fNg?????i ch??i n??y hi???n kh??ng tr???c tuy???n!")); return;
        } else {
          var has_slot = false; var c = 0; var take_slot = -1;
          for(var j = 0; j < 36; j++) { if(receiverInstance.getInventory().getItem(j) == null) { has_slot = true; break; } }
          for(var i = 0; i < 36; i++) {
             var is = Player.getInventory().getItem(i);
             if(is != null) {
              var meta = is.getItemMeta();
              if(meta.hasDisplayName() && ChatColor.stripColor(meta.getDisplayName()).contains("Superior |"))
              { c++; take_slot = i; }
             } else continue;
          } var has_wands = c >= 2 && take_slot != -1;
          if(!has_wands) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fPh???i c?? t???i thi???u &a2 &5????a Ma Thu???t &fb???n m???i trong t??i ????? ????? ti???n h??nh g???i t???ng!")); return;
          }
          if(!has_slot) {
            receiverInstance.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &a" + Player.getName() + " &f???? g???i t???ng b???n &a1 &5????a Ma Thu???t&f, nh??ng t??i c???a b???n kh??ng c?? ch??? n??n ???? b??? hu???!"));
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &fT??i ????? c???a &a" + receiverInstance.getName() + " &fhi???n kh??ng ????? ch??? ????? nh???n ????a!")); return;
          }
          if(receiverInstance.hasPermission("superiorwand.universal")) {
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &cL???i: &a" + receiverInstance.getName() + " &f???? c?? &5????a Ma Thu???t &fr???i!")); return;
          } else {
            var lp = "lp user " + receiverInstance.getName() + " permission set superiorwand.universal true";
            var give = "mi load custom superiorwand " + receiverInstance.getName() + " 1";
            Player.getInventory().setItem(take_slot, null);
            Server.dispatchCommand(Console, lp); Server.dispatchCommand(Console, give);
            Player.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &dGhi ch??: &fB???n ???? g???i t???ng &a" + receiverInstance.getName() + " &5????a Ma Thu???t &fth??nh c??ng!"));
            var config = YamlConfiguration.loadConfiguration(Player_Main_File);
            var gifts = config.contains("Gifts") ? config.get("Gifts") : new ArrayList();
            gifts.add(receiverInstance.getName()); config.set("Gifts", gifts);
            config.save(Player_Main_File);
            receiverInstance.sendMessage(ScriptManager.colorHandler("&eSuperior &8&l| &aTh??ng b??o: &fB???n ???? nh???n ???????c &5????a Ma Thu???t &ft??? &a" + Player.getName() + "&f. M???t m??n qu?? ?????t ?????, nh???? &d<3"));
          }
        } return 0;
        break;
      default: throw ScriptManager.errorList("invalid-node"); // Invalid sub-command
    }
  } catch(err) {
    var error = err.name + " - " + err.message;
    if(error.indexOf("L???i") == -1)
      return "&eScript &8&l| &cL???i: &f" + error;
    else return error; 
  }
}

main();
