var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Plugin = Manager.getPlugin("PlaceholderAPI");
var Points = Manager.getPlugin("PlayerPoints");

var ChatColor = org.bukkit.ChatColor;

var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");

var ScriptObject = {
	formatNum: function(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_").replaceAll("__", ","); },
	getMaxUpgrade: function(p) {
		if(p == null) return 1;
		var set = p.getEffectivePermissions(); var max = 300000;
		for each(var node in set) {
			var perm = node.getPermission();
			if(perm.startsWith("kho.max."))
				max = parseInt(perm.replace("kho.max.", ""));
		} return max;
	},
	getLimit: function(p) {
		if(p == null) return 1;
		var set = p.getEffectivePermissions(); var limit = 100000;
		for each(var node in set) {
			var perm = node.getPermission();
			if(perm.startsWith("kho.limit."))
				limit = parseInt(perm.replace("kho.limit.", ""));
		} return limit;
	},
	getDiscount: function(p) {
		var max_value = this.getMaxUpgrade(p);
		switch(max_value) {
			case 1000000:
			case 2500000:
			  return 10;
			case 5000000:
			case 10000000:
			  return 20;
			default: return 0;
		} return -1;
	},
	getPrice: function(times, p) {
		var discount = this.getDiscount(p);
		if(isNaN(times)) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fSố nhập vào phải là số nguyên dương!");
		else return (times*5)*(1-(discount/100));
	},
	colorizeText: function(param) {
		return ChatColor.translateAlternateColorCodes('&', param);
	},
	getBalance: function(p) {
		return parseInt(PlaceholderAPI.static.setPlaceholders(p, "%playerpoints_points%")); // parse placeholder
	},
	upgrade: function(value, target) {
		if(isNaN(parseInt(value))) {
			if(value == "max") {
				var current_limit = this.getLimit(target); 
				var upgrade_limit = this.getMaxUpgrade(target);
				var distance = (upgrade_limit-current_limit)/1000;
				if(distance == 0) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fBạn đã nâng cấp tối đa rồi!");
				else {
					var price = this.getPrice(distance, target); var balance = this.getBalance(target);
					if(isNaN(balance)) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fBạn chưa cài Placeholder &aPlayerPoints&f!");
					if(balance < price) {
					Player.sendMessage(ScriptObject.colorizeText("&eLimit &8&l| &cLỗi: &fBạn không có đủ &6Xu &fđể tiến hành nâng cấp!"));
					// end process
					} else {
						var ExecuteMax = Java.extend(Runnable, {
							run: function() {
							var Update = "lp user " + target.getName() + " permission unset kho.limit." + current_limit.toString();
							var Command = "lp user " + target.getName() + " permission set kho.limit." + upgrade_limit.toString();
							var Price = "points take " + target.getName() + " " + price.toString();
							Server.dispatchCommand(Console, Update); Server.dispatchCommand(Console, Command); Server.dispatchCommand(Console, Price);
							Player.kickPlayer(ScriptObject.colorizeText("&eLimit &8&l| &aThông báo: &fĐã nâng cấp thành công kho! &8&l[&a+" + ScriptObject.formatNum(distance*1000) + "&8&l]"));
							}
						}); Scheduler.runTask(Plugin, new ExecuteMax());
					}
				}
			} else throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fCú pháp lệnh không hợp lệ!");
		} else {
			var current_limit = this.getLimit(target); 
			var upgrade_limit = this.getMaxUpgrade(target);
			if(current_limit+value<=upgrade_limit) {
				var price = this.getPrice(value, target); var balance = this.getBalance(target); value = value * 1000;
				if(isNaN(balance)) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fBạn chưa cài Placeholder &aPlayerPoints&f!");
				if(balance < price) {
					Player.sendMessage(ScriptObject.colorizeText("&eLimit &8&l| &cLỗi: &fBạn không có đủ &6Xu &fđể tiến hành nâng cấp!"));
					// end process
				} else {
					var Execute = Java.extend(Runnable, {
						run: function() {
							var Update = "lp user " + target.getName() + " permission unset kho.limit." + current_limit.toString();
							var Command = "lp user " + target.getName() + " permission set kho.limit." + (current_limit+value).toString();
							var Price = "playerpoints:p take " + target.getName() + " " + price.toString();
							Server.dispatchCommand(Console, Update); Server.dispatchCommand(Console, Command); Server.dispatchCommand(Console, Price);
							Player.kickPlayer(ScriptObject.colorizeText("&eLimit &8&l| &aThông báo: &fĐã nâng cấp thành công kho! &8&l[&a+" + ScriptObject.formatNum(value) + "&8&l]"));
						}
					}); Scheduler.runTask(Plugin, new Execute());
				}
			} else throw ScriptObject.colorizeText("Script &8&l| &cLỗi: &fĐã vượt quá giới hạn nâng cấp :/");
		}
	}
};

function main() {
	try {
		if(Manager.getPlugin("PreventHopper-ORE") == null) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fMáy chủ không có &aPreventHopper&f!");
		if(Points == null) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fMáy chủ chưa cài đặt &aPlayerPoints&f!");
	  switch(args[0].toLowerCase()) {
	    case "limit":
	      return args.length == 2 && args[1].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptObject.getLimit(Player)) :
	             ScriptObject.getLimit(Player).toString();
	    case "max-upgrade":
	      return args.length == 2 && args[1].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptObject.getMaxUpgrade(Player)) :
	             ScriptObject.getMaxUpgrade(Player).toString();
	    case "future":
	      if(!isNaN(parseInt(args[1]))) {
	      	var add_node = parseInt(args[1]); return ScriptObject.formatNum(ScriptObject.getLimit(Player)+add_node)
	      } else {
	      	throw ScriptObject.colorizeText("&eLimit &8&l| &cLỗi: &fSố nhập vào phải là số nguyên!"); // error
	      }
	      return 0;
	    case "status":
	      var metadata = Player.getMetadata("playerData").get(0).value();
	      var id = "";
	      switch(args[1].toLowerCase()) {
	      	case "coal": id = "COAL"; break;
	      	case "lapis": id = "LAPIS_LAZULI"; break;
	      	case "redstone": id = "REDSTONE"; break;
	      	case "iron": id = "IRON_INGOT"; break;
	      	case "gold": id = "GOLD_INGOT"; break;
	      	case "diamond": id = "DIAMOND"; break;
	      	case "emerald": id = "EMERALD"; break;
	      	default: throw "Invalid params";
	      }
	      return args.length == 3 && args[2] == "display" ? metadata.getBlock(id).toString() : ScriptObject.formatNum(metadata.getBlock(id));
	    case "get-price":
	      var a = parseInt(args[1]); if(isNaN(a)) a = (ScriptObject.getMaxUpgrade(Player) - ScriptObject.getLimit(Player))/1000; 
	      return args.length == 3 && args[2].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptObject.getPrice(a, Player)) :
	             ScriptObject.getPrice(a, Player).toString();
	    case "get-discount":
	    	var discount = ScriptObject.getDiscount(Player);
	    	if(discount == 0) {
	    		return "";
	    	} else return "&8&l[&a-" + discount.toString() + "%&8&l]";
	    case "upgrade-10":
	      ScriptObject.upgrade(/* upgrade value */ 10, /* target */ Player); return 0;
	      break;
	    case "upgrade-100":
	      ScriptObject.upgrade(/* upgrade value */ 100, /* target */ Player); return 0;
	      break;
	    case "upgrade-500":
	      ScriptObject.upgrade(/* upgrade value */ 500, /* target */ Player); return 0;
	      break;
	    case "upgrade-max":
	      ScriptObject.upgrade(/* upgrade value */ "max", /* target */ Player); return 0;
	      break;
	  }
	} catch(err) {
		return err.message;
	}
}
main();
