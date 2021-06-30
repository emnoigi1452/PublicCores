var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var Server = __plugin.getServer(); var File = Java.type("java.io.File");
var path = Server.getPluginManager().getPlugin("PlaceholderAPI").getDataFolder() + "\\Synchronized-Vault";
var db = new File(path); if(!db.exists()) db.mkdir();

function generate(player) {
	var uid = player.getUniqueId().toString(); var player_path = db + "\\" + uid + ".yml";
	var player_file = new File(player_path);
	if(!player_file.exists()) {
		var configuration = YamlConfiguration.loadConfiguration(player_file);
		configuration.set("PlayerName", player.getName());
		configuration.set("Balance.COAL", 0);
		configuration.set("Balance.LAPIS", 0);
		configuration.set("Balance.REDSTONE", 0);
		configuration.set("Balance.IRON", 0);
		configuration.set("Balance.GOLD", 0);
		configuration.set("Balance.DIAMOND", 0);
		configuration.set("Balance.EMERALD", 0);
		configuration.save(player_file);
	} return player_file;
}

function check_block(block) {
	var location = block.getLocation();
	var water_loc = location.clone().add(0,1,0);
	var fence_loc = location.clone().subtract(0,1,0);
	return water_loc.getBlock().getType().name().indexOf("WATER") != -1 &&
	       fence_loc.getBlock().getType().name() == "FENCE"
}

function calculate_value(input, type, player) {
	var real_amount = 0; var pickaxe = player.getInventory().getItemInMainHand();
	if(pickaxe == null) real_amount = input;
	else {
		var enchs = pickaxe.getEnchantments();
		var fortune_instance = org.bukkit.enchantments.Enchantment.getByName("LOOT_BONUS_BLOCKS");
		real_amount = !enchs.containsKey(fortune_instance) ? input : input*enchs.get(fortune_instance);
	} var c_p = 7.5; var l_p = 9.5; var r_p = 9.5; var i_p = 12; var g_p = 13.5; var d_p = 15; var e_p = 17;
	switch(type.toUpperCase()) {
		case "COAL": return c_p*real_amount;
		case "LAPIS": return l_p*real_amount;
		case "REDSTONE": return r_p*real_amount;
		case "IRON": return i_p*real_amount;
		case "GOLD": return g_p*real_amount;
		case "DIAMOND": return d_p*real_amount;
		case "EMERALD": return e_p*real_amount;
		default: return real_amount;
	}
}
function is_holding_antimatter(player_instance) {
	var hand = player_instance.getInventory().getItemInMainHand();
	if(hand == null) return false;
	else {
		var meta = hand.getItemMeta(); if(meta == null) return false;
		if(meta.hasDisplayName()) {
			var name = meta.getDisplayName();
			if(org.bukkit.ChatColor.stripColor(name) == "Donate++ | AntiMatter [Unknown]")  {
				var lore = meta.getLore(); if(lore.size() != 32) return false;
				return org.bukkit.ChatColor.stripColor(lore.get(18)).indexOf("Đồng bộ hoá [10.0 giây") != 1;
			} else return false;
		} else return false;
	} return false;
}

events.blockBreak(function(event){
	if(is_holding_antimatter(event.player)) {
		var player = event.player; var player_f = generate(player); var location = player.getLocation();
		var coal = 0; var lapis = 0; var redstone = 0; var iron = 0; var gold = 0; var diamond = 0; var emerald = 0;
		var x_s = location.getBlockX()-2; var z_s = location.getBlockZ()-2; var y_s = location.getBlockY()+1;
		var location_begin = new org.bukkit.Location(player.getWorld(), x_s, y_s, z_s);
		for(var x_axis = 0; x_axis < 4; x_axis++) {
			for(var z_axis = 0; z_axis < 4; z_axis++) {
				location_begin = location_begin.add(0,0,1);
				var block_instance = location_begin.getBlock();
				if(check_block(block_instance)) {
					switch(block_instance.getType().name()) {
						case "COAL_ORE": coal++; break;
						case "LAPIS_ORE": lapis++; break;
						case "REDSTONE_ORE": redstone++; break;
						case "IRON_ORE": iron++; break;
						case "GOLD_ORE": gold++; break;
						case "DIAMOND_ORE": diamond++; break;
						case "EMERALD_ORE": emerald++; break;
					}
				}
			} location_begin.setX(location_begin.getBlockX()+1); location_begin.setZ(z_s);
		}
		coal = calculate_value(coal,"coal",player); lapis = calculate_value(lapis,"lapis",player); redstone = calculate_value(redstone,"redstone",player); 
		iron = calculate_value(iron,"iron",player);  gold = calculate_value(gold,"gold",player); diamond = calculate_value(diamond,"diamond",player); 
		emerald = calculate_value(emerald,"emerald",player);
		var vault_configuration = YamlConfiguration.loadConfiguration(player_f);
		vault_configuration.set("Balance.COAL", vault_configuration.get("Balance.COAL") + coal);
		vault_configuration.set("Balance.LAPIS", vault_configuration.get("Balance.LAPIS") + lapis);
		vault_configuration.set("Balance.REDSTONE", vault_configuration.get("Balance.REDSTONE") + redstone);
		vault_configuration.set("Balance.IRON", vault_configuration.get("Balance.IRON") + iron);
		vault_configuration.set("Balance.GOLD", vault_configuration.get("Balance.GOLD") + gold);
		vault_configuration.set("Balance.DIAMOND", vault_configuration.get("Balance.DIAMOND") + diamond);
		vault_configuration.set("Balance.EMERALD", vault_configuration.get("Balance.EMERALD") + emerald);
		vault_configuration.save(player_f);
	}
});
