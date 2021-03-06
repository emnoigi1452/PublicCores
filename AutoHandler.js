var Player = BukkitPlayer;
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Vault = Server.getPluginManager().getPlugin("Vault");
var PreventHopper = Server.getPluginManager().getPlugin("PreventHopper-ORE");
var Host = Server.getPluginManager().getPlugin("PlaceholderAPI");
var DataHandler = Host.getDataFolder().getAbsolutePath() + "\\FarmHandler";
var PreventBlock = Host.getDataFolder().getAbsolutePath() + "\\PreventBlock";

var ChatColor = org.bukkit.ChatColor;
var Color = ['translateAlternateColorCodes', 'stripColor'];

var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var Configuration = ['loadConfiguration', 'set', 'save'];

var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");
var File = Java.type("java.io.File");
var ArrayList = Java.type("java.util.ArrayList");
var Calendar = Java.type("java.util.Calendar");
var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var DecimalFormat = Java.type("java.text.DecimalFormat");

var ScriptHandler = {
  setupFile: function(file) {
    if(!file.exists()) {
      file.createNewFile();
      var yaml = YamlConfiguration[Configuration[0]](file);
      yaml[Configuration[1]]("Username", Player.getName());
      yaml[Configuration[1]]("Modules.COAL", 'off');
      yaml[Configuration[1]]("Modules.LAPIS", 'off');
      yaml[Configuration[1]]("Modules.REDSTONE", 'off');
      yaml[Configuration[1]]("Modules.IRON", 'off');
      yaml[Configuration[1]]("Modules.GOLD", 'off');
      yaml[Configuration[1]]("Modules.DIAMOND", 'off');
      yaml[Configuration[1]]("Modules.EMMERALD", 'off');
      yaml[Configuration[2]](file); return file;
    } else return file;
  },
  ph_key: function(param) {
    switch(param.toUpperCase()) {
      case "coal":
      case "redstone":
      case "diamond":
      case "emerald":
        return param.toUpperCase();
      case "lapis":
        return param.toUpperCase().concat("_LAZULI");
      case "iron":
      case "gold":
        return param.toUpperCase().concat("_INGOT");
      default: throw ChatColor[Color[0]]('&', "&fLo???i kho??ng s???n kh??ng h???p l???!");
    }
  },
  prices: function(param) {
    switch(param.toLowerCase()) {
      case "coal":
      case "lapis":
      case "redstone":
        return 9.5;
      case "iron": return 12;
      case "gold": return 13.5;
      case "diamond": return 15;
      case "emerald": return 17;
      default: throw ChatColor[Color[0]]('&', "&fLo???i kho??ng s???n kh??ng h???p l???!");
    }
  },
  type_id: function(param) {
    switch(param.toLowerCase()) {
      case "coal": return '&8Than';
      case "lapis": return '&9L??u Ly';
      case "redstone": return '&4???? ?????';
      case "iron": return '&fS???t';
      case "gold": return '&6V??ng';
      case "diamond": return '&bKim C????ng';
      case "emerald": return '&aNg???c L???c B???o';
      default: throw ChatColor[Color[0]]('&', "&fLo???i kho??ng s???n kh??ng h???p l???!");
    }
  }
};

function main() {
  try {
    var PlayerData = Player.getMetadata("playerData").get(0).value(); var UID = Player.getUniqueId().toString();
    var Data = ['getBlock', 'setBlock'];
    var Services = Server.getServicesManager().getRegistrations(Vault); var Economy = null; var Sell = 'depositPlayer';
    for each(var s in Services) {
      var Provider = s.getProvider().class;
      if(Provider.getName().contains("Economy_Essentials"))
        { Economy = s.getProvider(); break; }
      else continue; 
    }
    var Blocks = new File(PreventBlock + "\\" + UID + ".yml");
    if(Player.hasPermission("viewer.daituong") || !Blocks.exists()) {
      Player.sendMessage(ChatColor[Color[0]]('&', '&bAuto &8&l| &cL???i: &fB???n ch??a c?? rank &a&lVIP&d&l+ &fho???c ch??a t???o kho ch???a kh???i. H??y ??n &a/block &f????? ki???m tra!')); return;
    }; var Options = ScriptHandler.setupFile(new File(DataHandler + "\\" + UID + ".yml"));
    switch(args[0].toLowerCase()) {
      case "execute":
        var action_modules = YamlConfiguration[Configuration[0]](Options); // load action module
        for each(var keys in action_modules.getConfigurationSection("Modules").getKeys(false)) {
          var value = action_modules.get("Modules".concat(keys));
          if(value == 'off') continue;
          else {
            var storageKey = ScriptHandler.ph_key(keys); // get key value
            var Compress = Java.extend(Runnable {
              run: function() {
                var blockStorage = YamlConfiguration[Configuration[0]](Blocks); var key = keys.toUpperCase().concat("_BLOCK");
                var balance = PlayerData[Data[0]](storageKey); var blockCount = Math.floor(balance / 9); var modulo = balance % 9;
                blockStorage[Configuration[1]](key, blockStorage.get(key) + block_count); PlayerData[Data[1]](storageKey, modulo);
                blockStorage[Configuration[2]](Blocks); // end
              }
            });
            var Sell = Java.extend(Runnable {
              run: function() {
                var balance = PlayerData[Data[0]](storageKey); var prices = ScriptHandler.prices(keys); 
                Economy.depositPlayer(Player.getName(), prices*balance); PlayerData[Data[1]](storageKey, 0);
              }
            });
            if(value == 'craft')
              Scheduler.runTask(Host, new Compress());
            else if(value == 'sell')
              Scheduler.runTask(Host, new Sell());
            else throw ChatColor[Color[0]]('&', '&fCh??? ????? x??? l?? kh??ng h???p l???!');
          }
        }
        break;
      case "switch":
        var status = YamlConfiguration[Configuration[0]](Options); var category = args[1].toLowerCase();
        var section = status.get("Modules".concat(category.toUpperCase())); var node = '';
        if(section == 'off') node = 'craft';
        else if(section == 'craft') node = 'sell';
        else node = 'off';
        status[Configuration[1]](section, node); status[Configuration[2]](Options);
        var type_id = ScriptHandler.type_id(category); var node_id = node == 'off' ? '&cT???t' : node == 'craft' ? '&aN??n' : '&aB??n';
        Player.sendMessage(ChatColor[Color[0]]('&', '&bAuto &8&l| &f???? chuy???n ch??? ????? x??? l?? c???a ' + type_id + ' &fth??nh ' + node_id));
        return 0;
      case 'sync':
        var config = YamlConfiguration[Configuration[0]](Options); var value = args[1].toLowerCase();
        if('off, craft, sell'.indexOf(value) == -1)
          throw ChatColor[Color[0]]('&', '&fCh??? ????? x??? l?? kh??ng h???p l???!');
        else {
          var node_id = value == 'off' ? '&cT???t' : value == 'craft' ? '&aN??n' : '&aB??n';
          var module_control = config.getConfigurationSection("Modules");
          for each(var keys in module_control.getKeys(false)) {
            config[Configuration[1]]('Modules'.concat(keys), value);
          }; config[Configuration[2]](Options);
          Player.sendMessage(ChatColor[Color[0]]('&', '&bAuto &8&l| &f???? ?????ng b??? h??a ch??? ????? x??? l?? th??nh ' + node_id));
          return 0;
        }; return -1;
      default: throw ChatColor[Color[0]]('&', '&fC?? ph??p l???nh kh??ng h???p l???!');
    }
  } catch(err) {
    return "&eScript &8&l| &cL???i: &f" + err.message;
  } finally {
    Economy = null; PlayerData = null; Services = null;
  }
}
