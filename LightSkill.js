var executor = BukkitPlayer; var server = BukkitServer;
var ArrayList = Java.type("java.util.ArrayList");

var x_array = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
var z_array = [1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058];

function getItemDamage(item_stack) {
	var meta = item_stack.getItemMeta(); var lore_collection = meta.getLore();
	if(lore_collection == null || lore_collection.isEmpty()) return 0;
	for each(var line in lore_collection) {
		if(line.indexOf("Sát thương") != -1 && 
		   line.indexOf("x") == -1 &&
		   line.indexOf("%") == -1 &&
		   line.indexOf("+") == -1) {
			return parseInt(line.substring(line.indexOf("§f§0§2§r§a")+10));
		}
	} return 0;
}

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

function flare_core() {
	var online_players = server.getOnlinePlayers(); var baka = ""
	var nearby_players = new ArrayList(); var it = online_players.iterator();
	while(it.hasNext()) {
		var p = it.next(); if(p.getName() == executor.getName()) continue;
		if(p.getWorld().equals(executor.getWorld())) {
			if(p.getLocation().distance(executor.getLocation()) <= 30) {
				if(!not_in_pvp(p)) nearby_players.add(p);
			}
		}
	}
	// Incinerator
	for(var i = 0; i < nearby_players.size(); i++) {
		if(p.equals(executor)) continue; var p = nearby_players.get(i);
		var distance = Math.round(executor.getLocation().distance(p.getLocation()));
		var damage_rate = 0;
		if(distance >= 20) damage_rate = (30 - distance) * 0.01;
		else if(distance >= 10 && distance < 20) damage_rate = (30 - distance) * 0.03;
		else damage_rate = (30 - distance) * 0.1;
		var incenerateDamage = getItemDamage(executor.getInventory().getItemInMainHand()) * damage_rate;
		p.setFireTicks(100); p.damage(incenerateDamage.toFixed(0));
	}
	// Lightning vision
	for (var j = 0; j < nearby_players.size(); j++) {
		if(p.equals(executor)) continue; var p = nearby_players.get(j);
		var direction = executor.getLocation().getDirection();
		var difference = p.getLocation().toVector()
						  .subtract(executor.getLocation()
						  					.toVector())
						  .normalize();	
		if(direction.dot(difference) > 0.25) {
			var damage = Math.round(getItemDamage(executor.getInventory().getItemInMainHand())*0.75).toFixed(0);
			server.dispatchCommand(server.getConsoleSender(), "smite " + p.getName() + " " + damage);
			var message = "&eLight &8&l| &e&oThần linh&f&o, đã coi ngươi là &c&okẻ thù...."; p.sendMessage(message.replace(/&/g, "§"));
		}
	} return "&eLight &8&l| &c&oCái chết&f&o, một thứ mơ hồ mà con người hướng tới....";
}
flare_core();
