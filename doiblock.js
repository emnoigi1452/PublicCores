var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();
var Manager = Server.getPluginManager();
var Plugin = Manager.getPlugin("PlaceholderAPI");

var Runnable = Java.type("java.lang.Runnable");
var Scheduler = Server.getScheduler();
var File = Java.type("java.io.File");

var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var ChatColor = org.bukkit.ChatColor;

var Script = {
   formatNum: function(x) {
     x = x.toString();
     var pattern = /(-?\d+)(\d{3})/;
     while (pattern.test(x))
         x = x.replace(pattern, "$1,$2");
     return x;
   },
   colorText: function(str) { return ChatColor.translateAlternateColorCodes('&', str); },
   get_name: function(param, block) {
      param = param.toUpperCase();
      switch(param.toLowerCase()) {
         case "lapis": return block ? param.concat("_BLOCK") : "DYE_4";
         case "iron":
         case "gold":
           return block ? param.concat("_BLOCK") : param.concat("_INGOT");
         case "coal":
         case "redstone":
         case "diamond":
         case "emerald":
           return block ? param.concat("_BLOCK") : param;
         default: return "null";
      }
   },
   get_essen_id: function(param, block) {
      switch(param.toLowerCase()) {
         case "coal": return block ? 173 : 263;
         case "lapis": return block ? 22 : 351.4;
         case "redstone": return block ? 152 : 331;
         case "iron": return block ? 42 : 265;
         case "gold": return block ? 41 : 266;
         case "diamond": return block ? 57 : 264;
         case "emerald": return block ? 133 : 388;
         default: return -1;
      }
   },
   translated: function(param, block) {
      switch(param.toLowerCase()) {
        case "coal": return block ? "&8Khối Than" : "&8Than";
        case "lapis": return block ? "&9Khối Lưu Ly" : "&9Lưu Ly";
        case "redstone": return block ? "&4Khối Đá Đỏ" : "&4Đá Đỏ";
        case "iron": return block ? "&fKhối Sắt" : "&fThỏi Sắt";
        case "gold": return block ? "&6Khối Vàng" : "&6Thỏi Vàng";
        case "diamond": return block ? "&bKhối Kim Cương" : "&bKim Cương";
        case "emerald": return block ? "&aKhối Ngọc Lục Bảo" : "&aNgọc Lục Bảo";
      }
   },
   wipe_command: function(type, block) {
      var id = this.get_essen_id(type, block);
      // format decimal
      var val = 0;
      if(id % 1 > 0) { val = Math.round((id % 1)*10); id = Math.floor(id); } 
      return "clear $p " + id.toString() + " $a " + val.toString();
   },
   UpgradeData: function(Target) {
      this.node = "none";
      this.traded = new java.io.HashMap();
      this.traded.put("COAL", 0);
      this.traded.put("LAPIS", 0);
      this.traded.put("REDSTONE", 0);
      this.traded.put("IRON", 0);
      this.traded.put("GOLD", 0);
      this.traded.put("DIAMOND", 0);
      this.traded.put("EMERALD", 0);
      this.getNode() = function() {
        return this.node;
      };
      this.getStats = function(term) {
        var keys = this.traded.keySet();
        if(!keys.contains(term))
          throw this.colorText("&eScript &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ &c:<");
        else return this.formatNum(this.traded.get(term));
      };
      this.addNode = function(key, val) {
        if(!this.traded.keySet().contains(key.toUpperCase()))
          throw this.colorText("&eScript &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ &c:<");
        else {
          var formatted = key.toUpperCase(); var default = this.traded.get(formatted);
          this.traded.put(formatted, Math.floor(default + val));
        }
      }
      this.setNode = function(term) {
        if(term != "none" && !this.traded.keySet().contains(term.toUpperCase()));
          throw this.colorText("&eScript &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ &c:<");
        else this.node = term;
      };
      this.getNode = function() return this.node;
   },
   checkMetadata: function(p) {
      if(!p.hasMetadata("doiblockData")) {
        var objectHandler = new this.UpgradeData(p); // create new instance;
        var value = new FixedMetadataValue(Plugin, objectHandler);
        p.setMetadata("doiblockData", value); // doesn't have metadata
      } return p.getMetadata("doiblockData").get(0).value();
   },
   get_amount: function(node, type) {
      var inv = Player.getInventory(); var metadata = Player.getMetadata("playerData").get(0).value();
      switch(node.toLowerCase()) {
        case "inv-block":
          var count = 0; var match = this.get_name(type, true);
          for(var j = 0; j < 36; j++) {
            var item = inv.getItem(j);
            if(item == null) continue;
            if(item.getType().name().equals(match))
              count += item.getAmount();
          } return count;
        case "ph-ore":
          var match = this.get_name(type, false); if(match == "DYE_4") match = "LAPIS_LAZULI";
          return metadata.getBlock(match);
        case "preventblock":
          var Block = Plugin.getDataFolder() + "\\PreventBlock"; var key = "BlockData." + this.get_name(type, true);
          var file = new File(Block + "\\" + Player.getUniqueId().toString() + ".yml");
          return YamlConfiguration.loadConfiguration(file).get(key);
        default: throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fPhương thức đổi không hợp lệ! Vui lòng kiểm tra lại!");
      }
   }
};
function main() {
  try {
    var dataSet = Script.checkMetadata(Player);
    switch(args[0].toLowerCase()) {
      case "cp-enabled":
        return dataSet.getNode() != "none";
      case "cp-reset":
        dataSet.setNode("none"); return 0;
      case "change-cp-node":
        dataSet.setNode(args[1]); return 0;
      case "get-cp-mode":
        return dataSet.getNode();
      case "inv-block": return Script.get_amount("inv-block", args[1]).toString();
      case "ph": return Script.get_amount("ph-ore", args[1]).toString();
      case "preventblock": return Script.get_amount("preventblock", args[1]).toString();
      case "inv-block-formatted": return Script.formatNum(Script.get_amount("inv-block", args[1]));
      case "ph-formatted": return Script.formatNum(Script.get_amount("ph-ore", args[1]));
      case "preventblock-formatted": Script.formatNum(Script.get_amount("preventblock", args[1]));
      case "stacks-block": return Math.floor(Script.get_amount("inv-block", args[1]) / 64).toString();
      case "stacks-ph": return Math.floor(Script.get_amount("ph-ore", args[1]) / 576).toString();
      case "stacks-preventblock": return Math.floor(Script.get_amount("preventblock", args[1]) / 64).toString();
      case "stacks-ph-formatted": return Script.formatNum(Math.floor(Script.get_amount("ph-ore", args[1])/576));
      case "stacks-preventblock-formatted": return Script.formatNum(Math.floor(Script.get_amount("preventblock", args[1])/64));
      case "status-preventblock":
        if(!Player.hasPermission("viewer.daituong"))
          return "&cKhông có quyền &8[&c✘&8]"
        else
          return "&a" + Script.formatNum(Math.floor(Script.get_amount("preventblock", args[1]))) + " " + Script.translated(args[1], true);
      case "upgrade-block":
        var type = args[1]; var amount = parseInt(args[2]);
        if(Script.get_essen_id(type) == -1) throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!");
        if(isNaN(amount)) {
          if(args[2].toLowerCase() == "all")
            amount = Math.floor(Script.get_amount("inv-block", type)/64);
          else
            throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fSố nhập vào không hợp lệ!");
        }
        var required = amount * 64; var inv_amount = Script.get_amount("inv-block", type);
        if(required > inv_amount || required < 1) {
          var error_temp = required < 1 ? 64 : required;
          Player.sendMessage(Script.colorText("&eUpgrade &8&l| &cLỗi: &fBạn không có đủ khoáng sản! Cần tối thiểu &a" + Script.formatNum(error_temp) + " " + Script.translated(type, true) + " &ftrong túi để có thể trao đổi!"));
          return;
        } 
        var clear = Script.wipe_command(type, true).replace("$p", Player.getName()).replace("$a", required.toString());
        var load = "mi load custom " + type + "1 " + Player.getName() + " " + amount.toString();
        var Task = Java.extend(Runnable, {
          run: function() {
            Server.dispatchCommand(Console, clear); Server.dispatchCommand(Console, load); dataSet.addNode(type, amount);
            Player.sendMessage(Script.colorText("&eUpgrade &8&l| &aThông báo: &fĐã đổi thành công &a" + Script.formatNum(required) + " " + Script.translated(type, true) + " &fsang &a" + amount.toString() + " " + Script.translated(type) + " &eNâng Cấp&f! Trong túi bạn còn &a" + Script.formatNum(inv_amount-required) + " " + Script.translated(type, true)));
          }
        }); Scheduler.runTask(Plugin, new Task()); return 0;
        break;
      case "upgrade-ph":
        var type = args[1]; var amount = parseInt(args[2]); var filled = false;
        if(Script.get_essen_id(type) == -1) throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!");
        if(isNaN(amount)) {
          if(args[2].toLowerCase() == "all") {
            var empty = 0;
            for(var j = 0; j < 36; j++) {
              if(Player.getInventory().getItem(j) == null)
                empty += 64;
            }
            if(Math.floor(Script.get_amount("ph-ore", type)/576) > empty) {
              filled = true; amount = empty;
            } else amount = Math.floor(Script.get_amount("ph-ore", type)/576);
          }
          else
            throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fSố nhập vào không hợp lệ!");
        }
        var required = amount * 576; var balance = Script.get_amount("ph-ore", type);
        if(required > balance || required < 1) {
          var error_temp = required < 1 ? 576 : required;
          Player.sendMessage(Script.colorText("&eUpgrade &8&l| &cLỗi: &fBạn không có đủ khoáng sản! Cần tối thiểu &a" + Script.formatNum(error_temp) + " " + Script.translated(type) + " &ftrong kho khoáng sản để có thể trao đổi!"));
          return;
        }
        var metadata = Player.getMetadata("playerData").get(0).value();
        var key = type == "lapis" ? type.toUpperCase().concat("_LAZULI") : type == "iron" || type == "gold" ? type.toUpperCase().concat("_INGOT") : type.toUpperCase(); // ph key
        var loadcmd = "mi load custom " + type + "1 " + Player.getName() + " " + amount.toString();
        var Task_PH = Java.extend(Runnable, {
          run: function() {
            metadata.setBlock(key, (balance-required));
            Server.dispatchCommand(Console, loadcmd); dataSet.addNode(type, amount);
            Player.sendMessage(Script.colorText("&eUpgrade &8&l| &aThông báo: &fĐã đổi thành công &a" + Script.formatNum(required) + " " + Script.translated(type) + " &fsang &a" + Script.formatNum(amount) + " " + Script.translated(type) + " &eNâng Cấp&f! Trong kho khoáng sản của bạn còn &a" + Script.formatNum(balance-required) + " " + Script.translated(type, true)));
          }
        }); Scheduler.runTask(Plugin, new Task_PH()); return 0; // end
        break;
      case "upgrade-prevent-block":
        var Block = Plugin.getDataFolder() + "\\PreventBlock";
        var file = new File(Block + "\\" + Player.getUniqueId().toString() + ".yml");
        if(!file.exists()) {
          Player.sendMessage(Script.colorText("&eUpgrade &8&l| &cLỗi: &fBạn chưa cài đặt kho nén block! Vui lòng nhấn &e/block &fđể hệ thống nhận dạng được kho của bạn!")); return -1;
        }
        var type = args[1]; var key = "BlockData." + Script.get_name(type, true); var amount = parseInt(args[2]);
        if(Script.get_essen_id(type) == -1) throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!");
        if(isNaN(amount)) {
          if(args[2].toLowerCase() == "all") {
            var empty = 0;
            for(var j = 0; j < 36; j++) {
              if(Player.getInventory().getItem(j) == null)
                empty += 64;
            }
            if(Math.floor(Script.get_amount("preventblock", type)/64) > empty) {
              filled = true; amount = empty;
            } else amount = Math.floor(Script.get_amount("preventblock", type)/64);
          } else
            throw Script.colorText("&eUpgrade &8&l| &cLỗi: &fSố nhập vào không hợp lệ!");
        }
        var required = amount * 64; var balance = Script.get_amount("preventblock", type);
        if(required > balance || required < 1) {
          var error_temp = required < 1 ? 64 : required;
          Player.sendMessage(Script.colorText("&eUpgrade &8&l| &cLỗi: &fBạn không có đủ khoáng sản! Cần tối thiểu &a" + Script.formatNum(error_temp) + " " + Script.translated(type, true) + " &ftrong kho chứa khối để có thể trao đổi!"));
          return;
        }
        var database = YamlConfiguration.loadConfiguration(file);
        var loadcmd = "mi load custom " + type + "1 " + Player.getName() + " " + amount.toString();
        var Task_PB = Java.extend(Runnable, {
          run: function() {
            database.set(key, (balance-required)); database.save(file);
            Server.dispatchCommand(Console, loadcmd); dataSet.addNode(type, amount);
            Player.sendMessage(Script.colorText("&eUpgrade &8&l| &aThông báo: &fĐã đổi thành công &a" + Script.formatNum(required) + " " + Script.translated(type, true) + " &fsang &a" + Script.formatNum(amount) + " " + Script.translated(type) + " &eNâng Cấp&f! Trong kho chứa khối của bạn còn &a" + Script.formatNum(balance-required) + " " + Script.translated(type, true)));
          }
        }); Scheduler.runTask(Plugin, new Task_PB()); return; //end;
        break;
      case "trade-status":
        var node = args[1]; var type = args[2]; var amount = parseInt(args[3]); var balance = 0;
        switch(node.toLowerCase()) {
          case "inv": balance = Script.get_amount("inv-block", type); break;
          case "ph": balance = Script.get_amount("ph-ore", type); break;
          case "pb": balance = Script.get_amount("preventblock", type); break;
          default: throw Script.colorText("&eScript &8&l| &cLỗi: &fHình thức giao dịch không hợp lệ!");
        }
        var multiplier = node.toLowerCase() == "ph" ? 576 : 64; var tradable = Math.floor(balance/multiplier);
        if(isNaN(amount) && args[3] == "all") {
          var empty = 0;
          for(var j = 0; j < 36; j++) {
            if(Player.getInventory().getItem(j) == null)
              empty += 64;
          }
          if(node != "inv")
            amount = tradable > empty ? empty : tradable;
          else
            amount = tradable;
        }
        var required = amount * multiplier;
        if(required > balance || required < 1)
          return "&cKhông đủ &8[&c✘&8]"
        else
          return "&a" + Script.formatNum(balance) + " &f-> &a" + Script.formatNum(balance-required);
      case "can-ph":
        if(Player.hasPermission("viewer.thieutuong"))
          return true;
        else
          return Player.hasPermission("doiblock.use.ph");
      case "all-stack-value":
        var node = args[1]; var type = args[2]; var balance = 0;
        switch(node.toLowerCase()) {
          case "inv": balance = Script.get_amount("inv-block", type); break;
          case "ph": balance = Script.get_amount("ph-ore", type); break;
          case "pb": balance = Script.get_amount("preventblock", type); break;
        }
        var multiplier = node == "ph" ? 576 : 64; var count = Math.floor(balance/multiplier);
        if(node == "ph" || node == "pb") {
          var em = 0;
          for(var x = 0; x < 36; x++) {
            if(Player.getInventory().getItem(x) == null)
              em += 64;
          }
          if(count > em) count = em;
        } // fix
        return balance < multiplier ? "&cKhông thể đổi &8[&c✘&8]" : "&a" + Script.formatNum(count) + " " + Script.translated(type) + " &eNâng Cấp";
      default: throw Script.colorText("&eScript &8&l| &cLỗi: &fTùy chọn &c" + args[0].toLowerCase() + " &fkhông tồn tại trong code!");
    }
  } catch(err) {
    return "&eScript &8&l| &cLỗi: &e" + err.name + " - &f" + err.message;
  } finally {
    if(dataSet != Player.getMetadata("doiblockData").get(0).value())
      Player.setMetadata("doiblockData", dataSet);
  }
}
main();
