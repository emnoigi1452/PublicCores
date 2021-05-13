var p = BukkitPlayer; var server = BukkitServer; var cons = server.getConsoleSender();
var plugin_instance = server.getPluginManager().getPlugin("PreventHopper-ORE");
var HashMap = Java.type("java.util.HashMap"); var ArrayList = Java.type("java.util.ArrayList");
var File = Java.type("java.io.File"); var PrintWriter = Java.type("java.io.PrintWriter");
var Scanner = Java.type("java.util.Scanner"); 

function read_name(param) {
	return param.toUpperCase() + "_BLOCK";
}
function read_data(param) {
	if(param == "lapis")
		return "LAPIS_LAZULI";
	else if(param == "iron" || param == "gold")
		return param.toUpperCase() + "_INGOT";
	else
		return param.toUpperCase();
}
function read_data_line(param) {
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
function numeric_id(param) {
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
function initializeMap(map) {
	if(!map.containsKey("COAL_BLOCK")) 
		map.put("COAL_BLOCK", 0);
	if(!map.containsKey("REDSTONE_BLOCK"))
		map.put("REDSTONE_BLOCK", 0);
	if(!map.containsKey("LAPIS_BLOCK"))
		map.put("LAPIS_BLOCK", 0);
	if(!map.containsKey("IRON_BLOCK"))
		map.put("IRON_BLOCK", 0);
	if(!map.containsKey("GOLD_BLOCK"))
		map.put("GOLD_BLOCK", 0);
	if(!map.containsKey("DIAMOND_BLOCK"))
		map.put("DIAMOND_BLOCK", 0);
	if(!map.containsKey("EMERALD_BLOCK"))
		map.put("EMERALD_BLOCK", 0);
	return map;
}
function regex(param) {
	switch(param.toLowerCase()) {
		case "coal": return "&8Khối Than";
		case "lapis": return "&1Khối Ngọc Lưu Ly";
		case "redstone": return "&4Khối Đá Đỏ";
		case "iron": return "&7Khối Sắt";
		case "gold": return "&6Khối Vàng";
		case "diamond": return "&bKhối Kim Cương";
		case "emerald": return "&aKhối Ngọc Lục Bảo";
		default: return null;
	}
}
function parseEmpty(block_type) {
	var player_inventory = p.getInventory(); var max_count = 0;
	for(var k = 0; k < 36; k++) {
		var item_stack = p.getInventory().getItem(k);
		if(item_stack == null || item_stack.getType().name() == block_type)
			max_count += item_stack != null ? (64-item_stack.getAmount()) : 64;
	} return max_count;
}


function core() {
	var node = args[0].toLowerCase();
	switch(node) {
		case "condense":
		  var backup_node = args[1].toLowerCase(); var update = "javascript_preventhopper_update";
		  if(numeric_id(backup_node) == -1)
		  	return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!";
		  PlaceholderAPI.static.setPlaceholders(p, "%" + update + "%");
		  var placeholder = "javascript_preventhopper_get," + backup_node;
		  var count = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%"));
		  if(count < 9) return "&8[&eKho&8] &cLỗi: &fBạn không có đủ khoáng sản để thực hiện nén khối!";
		  else {
		  	var block_count = Math.floor(count / 9); var message = "&8[&eKho&8] &fĐã nén khối thành công &a✔ &8[&a+" + block_count.toString() + " khối&8]";
		  	p.kickPlayer(message.replace(/&/g, "§")); var p_uid = p.getUniqueId().toString(); var data = new ArrayList();
			var path = plugin_instance.getDataFolder() + "\\userdata\\" + p_uid + ".yml";
			var data_file = new File(path); var file_reader = new Scanner(data_file);
			while(file_reader.hasNextLine()) {
				var string = file_reader.nextLine(); data.add(string);
			} var remain = count - (block_count*9);
			var new_string = data.get(read_data_line(backup_node)).replace(count, remain);
			data.set(read_data_line(backup_node), new_string); var writer = new PrintWriter(data_file);
			for each(var s in data)
				writer.println(s);
			writer.flush(); writer.close();
			var data_map = Data.exists(p_uid) ? Data.get(p_uid) : new HashMap(); 
			data_map = initializeMap(data_map);  var storage_count = data_map.get(read_name(backup_node));
			storage_count += block_count; data_map.put(read_name(backup_node), storage_count);
			Data.set(p_uid, data_map); Placeholder.saveData(); return "&7";
		  }
		  break;
		case "database":
		  var uid = p.getUniqueId().toString(); var database = Data.exists(uid) ? Data.get(uid) : new HashMap(); database = initializeMap(database); 
		  return database.get(read_name(args[1].toLowerCase())).toFixed(0); break;
		case "sendtowand":
		  var receiver = server.getPlayerExact(args[1]); var mineral_node = args[2].toLowerCase(); var amount_node = parseInt(args[3]);
		  if(isNaN(amount_node))
		  	return "&eHookCore &8&l| &cLỗi: &fBạn phải nhập vào một số hợp lệ!";
		  if(!(mineral_node == "gold" || mineral_node == "diamond" || mineral_node == "emerald"))
		  	return "&eHookCore &8&l| &cLỗi: &fChỉ được phép gửi &6Vàng&f, &bKim Cương &fvà &aNgọc Lục Bảo";
		  if(receiver == null)
		  	return "&eHookCore &8&l| &cLỗi: &fNgười chơi &a" + args[1] + " &fhiện không trực tuyến";
		  else {
			var wand_perm == "superiorwand." + mineral_node + "";
		  	if(!(receiver.hasPermission("superiorwand.universal")))
		  		return "&eHookCore &8&l| &cLỗi: &fChỉ được phép gửi khoáng sản cho những người dùng &eSuperiorWand&f!";
			if(!receiver.hasPermission(wand_perm))
				return "&eHookCore &8&l| &cLỗi: &fNgười dùng này không có loại đũa này!"
		  	var uid = p.getUniqueId().toString(); var map = Data.exists(uid) ? Data.get(uid) : new HashMap();
		  	map = initializeMap(map); var active_count = map.get(read_name(mineral_node));
		  	if(amount_node > active_count)
		  		return "&eHookCore &8&l| &cLỗi: &fBạn không có đủ khoáng sản để gửi! Bạn chỉ có &a" + active_count.toString()
		  		       + " " + regex(mineral_node) + " &ftrong kho";
		  	else {
		  		active_count -= amount_node; map.put(read_name(mineral_node), active_count);
		  		Data.set(uid, map); Placeholder.saveData(); var plc = "javascript_superior-core_util,add," + mineral_node + "," + amount_node.toString();
		  		PlaceholderAPI.static.setPlaceholders(receiver, "%" + plc + "%"); 
		  		var message = "&eHookCore &8&l| &fBạn đã nhận được &a" + amount_node.toString() + " " + regex(mineral_node) + " &ftừ &a" + p.getName();
		  		receiver.sendMessage(message.replace(/&/g, "§")); 
		  		return "&eHookCore &8&l| &fĐã gửi thành công &a" + amount_node + " " + regex(mineral_node) + " &fđến &a" + receiver.getName(); 
		  		
		  	}
		  }
		  break;
		case "withdraw":
		  var key = read_name(args[1]); var amount_node = args[2].toLowerCase() == "full" ? args[2] : parseInt(args[2]);
		  if(numeric_id(args[1].toLowerCase()) == -1)
		  	return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản &a'" + args[1].toLowerCase() + "' &fkhông tồn tại!"
		  var id = p.getUniqueId().toString(); var data = Data.exists(id) ? Data.get(id) : new HashMap();
		  data = initializeMap(data); var valid_balance = data.get(key); var withdrawal = parseEmpty(key);
		  if(valid_balance == 0)
		  	return "&eBlock &8&l| &cLỗi: &fTrong kho của bạn hiện không còn " + regex(args[1]);
		  if(isNaN(amount_node) && amount_node != "full")
		  	return "&eBlock &8&l| &cLỗi: &fBạn phải nhập vào một số lượng hợp lệ!"
		  else {
		  	if(amount_node != 'full') {
			  	if(amount_node < 1 || amount_node > 2304)
			  		return "&eBlock &8&l| &cLỗi: &fSố nhập vào phải tối thiểu là &a1 &fvà tối đa là &a2304&f!";
			  	else {
			  		var max_count = parseEmpty(key);
			  		if(max_count > valid_balance && valid_balance > 0)
			  			return "&eBlock &8&l| &cLỗi: &fBạn không có đủ " + regex(args[1]) + " &ftrong kho! &fBạn chỉ có thể rút tối đa &a" 
			  			+ valid_balance.toString() + " " + regex(args[1]) + " &ftừ trong kho!";
			  		else {
			  			var withdraw = amount_node > max_count ? max_count : amount_node;
			  			var command = "give " + p.getName() + " " + numeric_id(args[1]).toString() + " " + withdraw.toString();
			  			server.dispatchCommand(cons, command); data.put(key, valid_balance-withdraw);
			  			Data.set(id, data); Placeholder.saveData();
			  			return "&eBlock &8&l| &fĐã rút thành công &a" + withdraw.toString() + " " + regex(args[1]) + " &ftừ kho thành công &a✔"
			  		}
			  	}
			} else {
				var max_count = parseEmpty(key); var withdraw = max_count > valid_balance ? valid_balance : max_count;
				var command = "give " + p.getName() + " " + numeric_id(args[1]).toString() + " " + withdraw.toString();
				server.dispatchCommand(cons, command); var remain = valid_balance - withdraw;
				data.put(key, remain); Data.set(id, data); Placeholder.saveData();
				return "&eBlock &8&l| &fĐã rút đầy túi thành công! Rút &a" + withdraw.toString() + " " + regex(args[1]) 
				+ " &ftừ kho chứa khối của bạn, trong kho còn &a" + remain.toString() + " " + regex(args[1]);
			}
		  }
		  break;
		case "pay":
		  var receiver = server.getPlayerExact(args[1]); var type = read_name(args[2].toLowerCase()); var amount_node = parseInt(args[3]);
		  if(isNaN(amount_node))
		  	return "&eBlock &8&l| &cLỗi: &fBạn phải nhập vào một số hợp lệ!";
		  if(receiver == null)
		  	return "&eBlock &8&l| &cLỗi: &fNgười chơi này hiện không trực tuyến!";
		  if(numeric_id(args[2].toLowerCase()) == -1)
		  	return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản &a'" + args[2].toLowerCase() + "' &fkhông hợp lệ!";
		  if(!receiver.hasPermission("viewer.daituong"))
		  	return "&eBlock &8&l| &cLỗi: &fNgười dùng này không có hệ thống kho chứa khối!";
		  var id = p.getUniqueId().toString(); var map = Data.exists(id) ? Data.get(id) : new HashMap();
		  map = initializeMap(map); var active_balance = map.get(read_name(args[2].toLowerCase()));
		  if(active_balance == 0 || amount_node > active_balance)
		  	return "&eBlock &8&l| &cLỗi: &fBạn không có đủ " + regex(args[2].toLowerCase()) + " &fđể tiến hành giao dịch!";
		  else {
		  	map.put(type,active_balance-amount_node); Data.set(id, map); Placeholder.saveData();
		  	var id_other = receiver.getUniqueId().toString(); var map_receiver = Data.exists(id_other) ? Data.get(id_other) : new HashMap();
		  	map_receiver = initializeMap(map_receiver); var current_count = map_receiver.get(type);
		  	current_count += amount_node; map_receiver.put(type, current_count); Data.set(id_other, map_receiver);
		  	Placeholder.saveData(); return "&eBlock &8&l| &fĐã gửi thành công &a" + amount_node + " " + regex(args[2].toLowerCase())
		  							+ " &fđến người chơi &a" + receiver.getName();
		  }
		  break;
		case "convert":
		  if(!p.hasPermission("superiorwand.universal"))
		  	return "&eSuperiorWand &8&l| &cLỗi: &fBạn không sở hữu &5Đũa Ma Thuật&f!";
		  var backup_node = args[1].toLowerCase(); var material = read_name(backup_node); var id = p.getUniqueId().toString();
		  if(numeric_id(backup_node) == -1)
		  	return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản &a'" + backup_node + "' &fkhông tồn tại!";
		  if(!(numeric_id(backup_node) == 41 || numeric_id(backup_node) == 57 || numeric_id(backup_node) == 133))
		  	return "&eBlock &8&l| &cLỗi: &fChỉ được chuyển đổi &6Vàng&f, &bKim Cương &fvà &aNgọc Lục Bảo&f!";
		  var map = Data.exists(id) ? Data.get(id) : new HashMap(); map = initializeMap(map); var convert_amount = map.get(material);
		  if(convert_amount == 0)
		    return "&eBlock &8&l| &cLỗi: &fTrong kho không có khoáng sản để chuyển đổi!";
		  else {
		  	map.put(material, 0); var placeholder = "javascript_superior-core_util,add," + backup_node + "," + convert_amount.toString();
		  	Data.set(id, map); Placeholder.saveData(); PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%");
		  	return "&eBlock &8&l| &fĐã chuyển thành công &a" + convert_amount.toString() + " " + regex(backup_node) + " &fvào &eSuperiorWand";
		  }
		  break;
		case "reset":
		  var database_object = Data.getData(); var key_set = database_object.keySet();
		  var key_array = new ArrayList(); var iterator = key_set.iterator();
		  while(iterator.hasNext()) {
		  	var key = iterator.next();
		  	if(key.indexOf(".") == -1)
		  		key_array.add(key);
		  }
		  for each(var s in key_array) {
		  	var map = database_object.get(s);
		  	map.put("COAL_BLOCK", 0);
		    map.put("LAPIS_BLOCK", 0);
		  	map.put("REDSTONE_BLOCK", 0);
		  	map.put("IRON_BLOCK", 0);
		  	map.put("GOLD_BLOCK", 0);
		  	map.put("DIAMOND_BLOCK", 0);
		  	map.put("EMERALD_BLOCK", 0);
		  	Data.set(s, map); Placeholder.saveData();
		  }
		  return "&eBlock &8&l| &fĐã tiến hành đặt lại dữ liệu thành công! &a✔";
		  break;
	}
}
core();
