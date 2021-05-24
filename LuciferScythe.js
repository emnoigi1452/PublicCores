var executor = BukkitPlayer; var server = BukkitServer;
var ArrayList = Java.type("java.util.ArrayList");

function not_in_pvp(player) {
	if(player.getWorld().getName() != "world") return true;
	var region = "worldguard_region_name"; var loc = player.getLocation();
	if(PlaceholderAPI.static.setPlaceholders(player, "%" + region + "%") == "nopvp")
		return true;
	else {
		var x = loc.getBlockX(); var z = loc.getBlockZ();
		return x_array.indexOf(x) != -1 && z_array.indexOf(z) != -1;
	}
}

function core_func() {
	var tier = parseInt(args[0]);
	if(isNaN(tier)) return "&eLucifer &8&l| &cLỗi: &fCấp độ skill không phù hợp";
	else if(tier > 3 || tier < 1) return "&eLucifer &8&l| &cLỗi: &fSố hợp lệ chỉ nằm trong vùng &e1 - 3";
	else {
		var online_players = server.getOnlinePlayers(); var active = new ArrayList();
		for(var j = 0; j < online_players.size(); j++) {
			var player = online_players.get(j);
			if(player.equals(executor)) continue;
			if(player.getWorld().getName() != "world") continue;
			else {
				if(!not_in_pvp(player)) continue;
				else {
					if(player.getLocation().distance(executor.getLocation()) < (25*tier))
						active.add(player);
				}
			}
		} var victims = 0; var total_health = 0;
		for(var x = 0; x < active.size(); x++) {
			var victim = active.get(x);
			if(victim.getHealth() < (30*tier)) {
				total_health += victim.getHealth(); victims++;
				var message = "&eLucifer &8&l| &c&oGiá như người mạnh mẽ hơn để bước vào lãnh địa của ta...";
				victim.sendMessage(message.replace(/&/g, "§")); victim.setHealth(0);
			}
		}
		return "&eLucifer &8&l| &fĐã tiêu diệt &e" + victims.toFixed() + " &fngười chơi &8&l[&a+" + total_health.toFixed(1) + "HP&8&l]"; 
	}
}
core_func();
