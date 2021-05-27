var p = BukkitPlayer; var server = BukkitServer;
var HashSet = Java.type("java.util.HashSet");
var transparent = new HashSet;
transparent.add(org.bukkit.Material.STATIONARY_WATER);
transparent.add(org.bukkit.Material.WATER);
transparent.add(org.bukkit.Material.TRAP_DOOR);
transparent.add(org.bukkit.Material.AIR);

/* Import all java classes here */
var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var System = Java.type("java.lang.System");
// This is where all the sub-function for the core lies.
function calculate_product(count) {
	var pickaxe = p.getInventory().getItemInMainHand();
	if(pickaxe == null) return count;
	else {
		var enchants = pickaxe.getEnchantments();
		var fortune = org.bukkit.enchantments.Enchantment.getByName("LOOT_BONUS_BLOCKS");
		return enchants.containsKey(fortune) ? enchants.get(fortune)*count : count;
	}
}
function check_block(block) {
	var location = block.getLocation();
	var water_loc = location.clone().add(0,1,0);
	var fence_loc = location.clone().subtract(0,1,0);
	return water_loc.getBlock().getType().name().indexOf("WATER") != -1 &&
	       fence_loc.getBlock().getType() == "FENCE"
}
function is_in_island(location) {
	if(location.getWorld().getName() != "SuperiorWorld") return false;
	var x = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%superior_island_x%"));
	var z = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%superior_island_z%"));
	var size = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%superior_island_size%"));
	var corner_x_1 = x + size; var corner_x_2 = x - size;
	var corner_z_1 = z + size; var corner_z_2 = z - size;
	var index = 0; var x_list = []; var z_list = [];
	for(var k = corner_x_1; k >= corner_x_2; k--) {
		x_list[index] = k; index++;
	} index = 0;
	for(var j = corner_z_1; j >= corner_z_2; j--) {
		z_list[index] = j; index++;
	}
	var location = p.getLocation(); var loc_x = location.getBlockX(); var loc_z = location.getBlockZ();
	return x_list.indexOf(loc_x) != -1 && z_list.indexOf(loc_z) != -1;
}
function valid_ore(block) {
	var type = block.getType().name();
	return type.indexOf("ORE") != -1;
}
function calculate_radius(player) {
	var gold_mass = parseInt(PlaceholderAPI.static.setPlaceholders(player, "%javascript_prevent-block_database,gold%"));
	var diamond_mass = parseInt(PlaceholderAPI.static.setPlaceholders(player, "%javascript_prevent-block_database,diamond%"));
	var emerald_mass = parseInt(PlaceholderAPI.static.setPlaceholders(player, "%javascript_prevent-block_database,emerald%"));
	var total_mass = (gold_mass*1.5) + (diamond_mass*3) + (emerald_mass*2.5);
	return Math.round((Math.pow(total_mass, 1/3)/Math.PI));
}
// From this point, is where the main core is executed.

function core() {
	if(!p.hasPermission("viewer.daituong")) {
		return "&5Singularity &8&l| &cLỗi: &fBạn không có quyền được sử dụng skill này!"; 
	} else {
		var target_block = p.getTargetBlock(transparent, 3);
		if(!valid_ore(target_block))
			return "&5Singularity &8&l| &cLỗi: &fBạn phải nhắm vào một khối quặng mới dùng được skill!";
		else {
			if(!is_in_island(target_block.getLocation()))
				return "&5Singularity &8&l| &cLỗi: &fBạn chỉ được phép sử dụng skill ở đảo mình!";
			else {
				var begin_time = System.nanoTime();
				var gold_ore_count = 0; var diamond_ore_count = 0; var emerald_ore_count = 0; var skill_radius = calculate_radius(p);
				if(skill_radius % 2 == 0) skill_radius--; var island_size = parseInt("%superior_island_size%"); 
				var head_block = p.getLocation().clone().add(0,1,0); var head_y = head_block.getBlockY();
				var head_x = head_block.getBlockX(); var head_z = head_block.getBlockZ(); var divide = Math.floor(skill_radius/2); 
				var x_1 = head_x + divide; var y_1 = head_y + divide; var z_1 = head_z + divide;
				var x_backup = head_x + divide; var m = 0;
				if(y_1 > 255) y_1 = 255;
				var border_1 = new org.bukkit.Location(p.getWorld(), x_1, y_1, z_1);
				for(var y_axis = 0; y_axis < skill_radius-1; y_axis++) {
					for(var x_axis = 0; x_axis < skill_radius-1; x_axis++) {
						for(var z_axis = 0; z_axis < skill_radius-1; z_axis++) {
							border_1.subtract(0,0,1); var check_block = border_1.getBlock();
							if(is_in_island(border_1) && valid_ore(check_block)) {
								var name = check_block.getType().name();
								if(name == "GOLD_ORE") { gold_ore_count++; check_block.setType(org.bukkit.Material.AIR); }
								else if(name == "DIAMOND_ORE") { diamond_ore_count++; check_block.setType(org.bukkit.Material.AIR); }
								else if(name == "EMERALD_ORE") { emerald_ore_count++; check_block.setType(org.bukkit.Material.AIR); }
 							}
						} border_1 = new org.bukkit.Location(p.getWorld(), x_1-1, y_1, z_1); x_1--;
					} x_1 = x_backup; border_1 = new org.bukkit.Location(p.getWorld(), x_1, y_1-1, z_1); y_1--;
				} 
				var gold_blocks = calculate_product(gold_ore_count);
				var diamond_blocks = calculate_product(diamond_ore_count);
				var emerald_blocks = calculate_product(emerald_ore_count);
				var placeholder = "javascript_prevent-block_give," + p.getName() + ",gold," + gold_blocks.toFixed();
				PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%");
				var placeholder2 = "javascript_prevent-block_give," + p.getName() + ",diamond," + diamond_blocks.toFixed();
				PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder2 + "%");
				var placeholder3 = "javascript_prevent-block_give," + p.getName() + ",emerald," + emerald_blocks.toFixed();
				PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder3 + "%");
				var end_time = System.nanoTime(); var time = (end_time - begin_time) / 1000000000;
				var message = "&5Singularity &8&l| &fĐã quét &a" + Math.pow(skill_radius, 3).toFixed() + " &fkhối trong vòng &a" + time.toFixed(1) + "s\n";
				message += "&f &f &e► &d+" + gold_blocks.toFixed() + " &6Khối Vàng &fvào kho khối &f[&a/block&f]\n";
				message += "&f &f &e► &d+" + diamond_blocks.toFixed() + " &bKhối Kim Cương &fvào kho khối &f[&a/block&f]\n";
				message += "&f &f &e► &d+" + emerald_blocks.toFixed() + " &aKhối Ngọc Lục Bảo &fvào kho khối &f[&a/block&f]";
				return message;
			}
		}
	}

}
core();
