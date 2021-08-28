var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Plugin = Manager.getPlugin("PlaceholderAPI");

var ChatColor = org.bukkit.ChatColor;

var Runnable = Java.type("java.lang.Runnable");
var Thread = Java.type("java.lang.Thread");

var ScriptObject = {
	formatNum: function(num) { return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "_").replace("__", ","); }
	getMaxUpgrade: function(p) {
		var set = p.getEffectivePermissions(); var max = 300000;
		for each(var node in set) {
			var perm = node.getPermission();
			if(perm.startsWith("kho.max."))
				max = parseInt(perm.replace("kho.max.", ""));
		} return max;
	},
	getLimit: function(p) {
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
			case 1000000: return 10;
			case 2500000: return 15;
			case 5000000: return 20;
			case 10000000: return 25;
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
					Player.sendMessage(ScriptObject.colorizeText("&ePreventLimit &8&l| &cLỗi: &fBạn không có đủ &6Xu &fđể tiến hành nâng cấp!"));
					// end process
					} else {
						var ExecuteMax = Java.extend(Runnable, {
							run: function() {
							var Command = "lp user " + target.getName() + " permission kho.limit." + upgrade_limit.toString();
							var Price = "playerpoints:p take " + target.getName() + " " + price.toString();
							Server.dispatchCommand(Console, Command); Server.dispatchCommand(Console, Price);
							Player.kickPlayer(ScriptObject.colorizeText("&ePreventLimit &8&l| &aThông báo: &fĐã nâng cấp thành công kho! &8&l[&a+" + ScriptObject.formatNum(distance*1000) + "&8&l]"));
							}
						}); new Thread(new ExecuteMax()).start();
					}
				}
			} else throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fCú pháp lệnh không hợp lệ!");
		} else {
			var current_limit = this.getLimit(target); 
			var upgrade_limit = this.getMaxUpgrade(target);
			if(current_limit+value<=upgrade_limit) {
				var price = this.getPrice(value, target); var balance = this.getBalance(target);
				if(isNaN(balance)) throw ScriptObject.colorizeText("&eScript &8&l| &cLỗi: &fBạn chưa cài Placeholder &aPlayerPoints&f!");
				if(balance < price) {
					Player.sendMessage(ScriptObject.colorizeText("&ePreventLimit &8&l| &cLỗi: &fBạn không có đủ &6Xu &fđể tiến hành nâng cấp!"));
					// end process
				} else {
					var Execute = Java.extend(Runnable {
						run: function() {
							var Command = "lp user " + target.getName() + " permission kho.limit." + (current_limit+value).toString();
							var Price = "playerpoints:p take " + target.getName() + " " + price.toString();
							Server.dispatchCommand(Console, Command); Server.dispatchCommand(Console, Price);
							Player.kickPlayer(ScriptObject.colorizeText("&ePreventLimit &8&l| &aThông báo: &fĐã nâng cấp thành công kho! &8&l[&a+" + ScriptObject.formatNum(value*1000) + "&8&l]"));
						}
					}); new Thread(new Execute()).start();
				}
			} else throw ScriptObject.colorizeText("Script &8&l| &cLỗi: &fĐã vượt quá giới hạn nâng cấp :/");
		}
	}
};

function main() {
	try {
	  switch(args[0].toLowerCase()) {
	    case "limit":
	      return args.length == 2 && args[1].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptManager.getLimit(Player)) :
	             ScriptObject.getLimit(Player).toString();
	    case "max-upgrade":
	      return args.length == 2 && args[1].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptManager.getMaxUpgrade(Player)) :
	             ScriptObject.getMaxUpgrade(Player).toString();
	    case "future":
	      if(!isNaN(parseInt(args[1]))) {
	      	var add_node = parseInt(args[1]); return (ScriptObject.getLimit(Player)+add_node).toString();
	      } else {
	      	throw ScriptObject.colorizeText("&eLimit &8&l| &cLỗi: &fSố nhập vào phải là số nguyên!"); // error
	      }
	      return 0;
	    case "get-price":
	      return args.length == 2 && args[1].toLowerCase() == "display" ?
	             ScriptObject.formatNum(ScriptManager.getPrice(parseInt(args[2]), Player)) :
	             ScriptManager.getPrice(parseInt(args[2]), Player).toString();
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
