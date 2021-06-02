/* JavaScript / Bukkit / Spigot instances */
var p = BukkitPlayer; var server = BukkitServer; var Console = server.getConsoleSender();
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var plugin = server.getPluginManager().getPlugin("PreventHopper-ORE");
var database = server.getPluginManager().getPlugin("PlaceholderAPI").getDataFolder() + "\\PreventBlock";

/* Java classes - Imported via NashornAPI */
var File = Java.type("java.io.File");
var PrintWriter = Java.type("java.io.PrintWriter");
var ArrayList = Java.type("java.util.ArrayList");
var System = Java.type("java.lang.System");
var Scanner = Java.type("java.util.Scanner");

/* Utilities / Functions */
function get_key(param) {
	return param.toUpperCase() + "_BLOCK";
}
function get_prevent_data(param) {
	return 
}
function get_translated_name(param) {
	switch(param.toLowerCase()) {
		case "coal": return "&0Khối Than";
		case "lapis": return "&1Khối Lưu Ly";
		case "redstone": return "&4Khối Đá Đỏ";
		case "iron": return "&fKhối Sắt";
		case "gold": return "&6Khối Vàng";
		case "diamond": return "&bKhối Kim Cương";
		case "emerald": return "&aKhối Lục Bảo";
		default: return "&cNULL";
	}
}
function get_prevent_key(param) {
	switch(param.toLowerCase()) {
		case "coal": return "COAL";
		case "lapis": return "LAPIS_LAZULI";
		case "redstone": return "REDSTONE";
		case "iron": return "IRON_INGOT";
		case "gold": return "GOLD_INGOT";
		case "diamond": return "DIAMOND";
		case "emerald": return "EMERALD";
		default: return "NULL";
	}
}
function get_prevent_line(param) {
	switch(param.toLowerCase()) {
		case "coal": return 3;
		case "lapis": return 4;
		case "redstone": return 5;
		case "iron": return 6;
		case "gold": return 7;
		case "diamond": return 8;
		case "emerald": return 9;
	}
}
function get_id(param) {
	switch(param.toLowerCase()) {
		case "coal": return 173;
		case "lapis": return 22;
		case "redstone": return 152;
		case "iron": return 42;
		case "gold": return 41;
		case "diamond": return 57;
		case "emerald": return 133;
		default: return -1;
	}
}
function get_slots(player, type) {
	var inventory_instance = player.getInventory(); var c = 0;
	for(var k = 0; k < 36; k++) {
		var item = inventory_instance.getItem(k);
		if(item == null) c+=64;
		else {
			if(item.getType().name() == type)
			  c += 64 - item.getAmount();
		}
	} return c;
}
function get_file(player) {
	var uid = player.getUniqueId().toString(); var player_path = database + "\\" + uid + ".yml";
	var player_file = new File(player_path);
	if(!player_file.exists()) {
		var configuration = YamlConfiguration.loadConfiguration(player_file);
		configuration.set("UserName", player.getName());
		configuration.set("BlockData.COAL_BLOCK", 0);
		configuration.set("BlockData.LAPIS_BLOCK", 0);
		configuration.set("BlockData.REDSTONE_BLOCK", 0);
		configuration.set("BlockData.IRON_BLOCK", 0);
		configuration.set("BlockData.GOLD_BLOCK", 0);
		configuration.set("BlockData.DIAMOND_BLOCK", 0);
		configuration.set("BlockData.EMERALD_BLOCK", 0);
		configuration.save(player_file);
	}
	return player_file;
}
function update_color(param) {
	return param.replace(/&/g, "§");
}
/* */

/* Main Core */
function PreventBlock() {
	var folder = new File(database); if(!folder.exists()) folder.mkdir();
	switch(args[0].toLowerCase()) {
		case "condense":
			var type_backup = args[1]; var update = "javascript_preventhopper_update";
			PlaceholderAPI.static.setPlaceholders(p, "%" + update + "%");
			if(get_id(type_backup) == -1) return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản &a" + type_backup + " &fkhông tồn tại!";
			var data = "javascript_preventhopper_get," + type_backup;
			var count = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%" + data + "%"));
			if(count < 9) return "&eBlock &8&l| &cLỗi: &fKho của bạn không có đủ " + get_translated_name(type_backup) + " &fđể nén!";
			else {
				var block_count = Math.floor(count / 9); var message = "&8[&eKho&8] &fĐã nén khối thành công &a✔ &8[&a+" + block_count.toString() + " khối&8]";
				p.kickPlayer(update_color(message)); var data_file = plugin.getDataFolder() + "\\userdata\\" + p.getUniqueId().toString() + ".yml";
				var player_data = new File(data_file); var file_reader = new Scanner(player_data); var content = new ArrayList();
				while(file_reader.hasNextLine()) {
					content.add(file_reader.nextLine());
				} var line = content.get(get_prevent_line(type_backup)); var left = count - (block_count*9);
				content.set(get_prevent_line(type_backup), line.replace(count, left));
				var writer = new PrintWriter(player_data); for(var j = 0; j < content.size(); j++) writer.println(content.get(j)); writer.flush(); writer.close();
				var block_data_file = get_file(p); var config = YamlConfiguration.loadConfiguration(block_data_file);
				config.set("BlockData." + get_key(type_backup), config.get("BlockData." + get_key(type_backup)) + block_count);
				config.save(block_data_file); return 0;
			}
		case "database":
			if(get_id(args[1]) == -1) return "&fInvalid type! Contact Seal!";
			var player_file = get_file(p); var loaded_config = YamlConfiguration.loadConfiguration(player_file);
			return loaded_config.get("BlockData." + get_key(args[1]));
		case "withdraw":
			if(get_id(args[1]) == -1) return "&eBlock &8&l| &cLoại khoáng sản &a" + args[1] + " &fkhông tồn tại!";
			var block_file = get_file(p); var config = YamlConfiguration.loadConfiguration(block_file);
			var count = config.get("BlockData." + get_key(args[1]));
			if(count < 1) return "&eBlock &8&l| &cLỗi: &fBạn không có đủ " + get_translated_name(args[1]) + " &ftrong kho!";
			var available = get_slots(p, get_key(args[1]));
			if(count >= available) count -= available; else { available = count; count = 0; }
			server.dispatchCommand(Console, "give " + p.getName() + " " + get_id(args[1]) + " " + available.toFixed());
			config.set("BlockData." + get_key(args[1]), count); config.save(block_file);
			return "&eBlock &8&l| &fĐã rút thành công &a" + available.toFixed() + " " + get_translated_name(args[1]) + " &ftừ kho nén khối!";
		case "convert":
			if(!p.hasPermission("superiorwand.universal")) return "&eHookCore &8&l| &cLỗi: &fBạn không có quyền được dùng lệnh này!";
			var block_file = get_file(p); var config = YamlConfiguration.loadConfiguration(block_file); var type = args[1];
			if(!(get_id(type) == 41 || get_id(type) == 57 || get_id(type) == 133))
			  return "&eBlock &8&l| &cLỗi: &fBạn chỉ được phép chuyển đối &6Vàng&f, &bKim Cương&f và &aNgọc Lục Bảo";
			var valid_amount = config.get("BlockData." + get_key(type));
			if(valid_amount < 1) return "&eHookCore &8&l| &cLỗi: &fKho chứa khối của bạn không có đủ " + get_translated_name(type) + "&f!";
			else {
				var placeholder = "javascript_superior-core_util,add," + type + "," + valid_amount.toFixed(0);
				PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%");
				config.set("BlockData." + get_key(type), 0); config.save(block_file);
				return "&eHookCore &8&l| &fĐã chuyển đổi thành công &a" + valid_amount.toFixed() + " " + get_translated_name(type) + " &fsang &6SuperiorWand"; 
			}
		case "sendtowand":
			var block_data = get_file(p); var config = YamlConfiguration.loadConfiguration(block_data); var type = args[2];
			if(get_id(type) == -1) return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản nhập vào không hợp lệ!";
			var max_amount = config.get("BlockData." + get_key(type)); var input = parseInt(args[3]);
			var target = server.getPlayerExact(args[3]); if(target == null) return "&eHookCore &8&l| &cLỗi: &fNgười chơi không online!";
			if(isNaN(input) || input < 1) return "&eHookCore &8&l| &cLỗi: Số nhập vào không hợp lệ!";
			if(input > max_amount) return "&eHook &8&l"
			if(!(get_id(type) == 41 || get_id(type) == 57 || get_id(type) == 133))
			  return "&eBlock &8&l| &cLỗi: &fBạn chỉ được phép chuyển đối &6Vàng&f, &bKim Cương&f và &aNgọc Lục Bảo";
			if(input > max_amount) return "&eHookCore &8&l| &cLỗi: &fSố " + get_translated_name(type) + " &ftrong kho bạn không đủ để thực hiện lệnh!";
			else {
				var placeholder = "javascript_superior-core_util,add," + type + "," + input.toFixed(0);
				PlaceholderAPI.static.setPlaceholders(target, "%" + placeholder + "%");
				config.set("BlockData." + get_key(type), max_amount - input); config.save(block_data);
				var receive = "&eHookCore &8&l| &fBạn đã nhận được &ax" + input.toFixed() + " " + get_translated_name(type) + " &ftừ &a" + p.getName();
				target.sendMessage(update_color(receive)); 
				return "&eHookCore &8&l| &fĐã gửi &ax" + input.toFixed() + " " + get_translated_name(type) + " &fđến " + target.getName();
			}
		case "pay":
			var target = server.getPlayerExact(args[1]); var type = args[2]; var amount = parseInt(args[3]);
			if(target == null) return "&eBlock &8&l| &cLỗi: &fNgười chơi này hiện không trực tuyến!";
			if(isNaN(amount) || amount < 1) return "&eBlock &8&l| &cLỗi: &fSố lượng được nhập vào không hợp lệ!";
			if(get_id(type) == -1) return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!";
			var file_sender = get_file(p); var file_target = get_file(target);
			var config_1 = YamlConfiguration.loadConfiguration(file_sender); var config_2 = YamlConfiguration.loadConfiguration(file_target);
			var balance = config_1.get("BlockData." + get_key(type));
			if(balance < amount) return "&eBlock &8&l| &cLỗi: &fKho của bạn không có đủ " + get_translated_name(type);
			else {
				config_2.set("BlockData." + get_key(type), config_2.get("BlockData." + get_key(type)) + amount);
				config_1.set("BlockData." + get_key(type), config_1.get("BlockData." + get_key(type)) - amount);
				config_1.save(file_sender); config_2.save(file_target);
				var target_pm = "&eBlock &8&l| &fBạn đã nhận được &ax" + amount.toFixed() + " " + get_translated_name(type) + " &ftừ &a" + p.getName(); 
				target.sendMessage(update_color(target_pm));
				return "&eBlock &8&l| &fĐã gửi &ax" + amount.toFixed() + " " + get_translated_name(type) + " &fđến &a" + target.getName(); 
			}
		case "reset":
			var folder = new File(database); var files = folder.listFiles();
			for(var k = 0; k < files.length; k++) {
				var file_object = files[k];
				if(!file_object.isDirectory())
				  file_object.delete();
			}
			return "&eBlock &8&l| &fĐã reset xong hệ thống máy chủ kho nén khối!";
		case "give":
			var target = server.getPlayerExact(args[1]); if(target == null) return "&bSealAPI &8&l| &cLỗi: &fÊ mày hình như nó đéo on hay sao á &d:v";
			if(!target.hasPermission("viewer.daituong")) return "&eSealAPI &8&l| &cLỗi: &fTính give bậy cho mem chưa có rank à nhóc :v";  
			var file = get_file(target); var load_config = YamlConfiguration.loadConfiguration(file); var amount = parseInt(args[3]);
			if(get_id(args[2]) == -1) return "&bSealAPI &8&l| &cLỗi: &fĐi đứng, viết lách cho cẩn thận vào :v &a" + args[2] + " &flà cái đéo gì thế :v";
			if(isNaN(amount) || amount < 1) return "&bSealAPI &8&l| &cLỗi: &fSố nhập vào đéo hợp lệ tí nào cả nha &d:3";
			load_config.set("BlockData." + get_key(args[2]), load_config.get("BlockData." + get_key(args[2])) + amount); load_config.save(file);
			var target_message = "&eBlock &8&l| &fMột quản trị viên đã gửi cho bạn &ax" + amount.toFixed() + " " + get_translated_name(args[2]);
			target.sendMessage(update_color(target_message));
			return "&bSealAPI &8&l| &fĐã chuyển khoản &ax" + amount.toFixed() + " " + get_translated_name(args[2]) + " &fcho &a" + target.getName();
		case "remove":
			var target = server.getPlayerExact(args[1]); if(target == null) return "&bSealAPI &8&l| &cLỗi: &fÊ mày hình như nó đéo on hay sao á &d:v";
			if(!target.hasPermission("viewer.daituong")) return "&eSealAPI &8&l| &cLỗi: &fTính ăn cắp của người nghèo à nhóc :v";  
			var file = get_file(target); var load_config = YamlConfiguration.loadConfiguration(file); var amount = parseInt(args[3]);
			if(get_id(args[2]) == -1) return "&bSealAPI &8&l| &cLỗi: &fĐi đứng, viết lách cho cẩn thận vào :v &a" + args[2] + " &flà cái đéo gì thế :v";
			if(isNaN(amount) || amount < 1) return "&bSealAPI &8&l| &cLỗi: &fSố nhập vào đéo hợp lệ tí nào cả nha &d:3";
			var balance = load_config.get("BlockData." + get_key(args[2])); if(amount > balance) return "&bSealAPI &8&l| &cLỗi: &fEm nó có &a" + balance.toFixed() + " &fthôi!";
			load_config.set("BlockData." + get_key(args[2]), balance - amount); load_config.save(file);
			var target_message = "&eBlock &8&l| &fMột quản trị viên đã rút từ kho của bạn &ax" + amount.toFixed() + " " + get_translated_name(args[2]);
			target.sendMessage(update_color(target_message));
			return "&bSealAPI &8&l| &fĐã rút &ax" + amount.toFixed() + " " + get_translated_name(args[2]) + " &fcủa thanh niên &a" + target.getName();
	}
}
PreventBlock();
