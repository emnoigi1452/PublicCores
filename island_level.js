var Player = BukkitPlayer;
var Skyblock = BukkitServer.getPluginManager().getPlugin("SuperiorSkyblock2");

var BigDecimal = Java.type("java.math.BigDecimal");
var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");

var ChatColor = org.bukkit.ChatColor;

var Levels = new HashMap(); var Worth = new HashMap();
Levels.put("COAL_BLOCK", 0.5); Worth.put("COAL_BLOCK", 50);
Levels.put("LAPIS_BLOCK", 0.5); Worth.put("LAPIS_BLOCK", 50);
Levels.put("REDSTONE_BLOCK", 0.5); Worth.put("REDSTONE_BLOCK", 50);
Levels.put("IRON_BLOCK", 1); Worth.put("IRON_BLOCK", 100);
Levels.put("GOLD_BLOCK", 1.5); Worth.put("GOLD_BLOCK", 150);
Levels.put("DIAMOND_BLOCK", 3); Worth.put("DIAMOND_BLOCK", 300);
Levels.put("EMERALD_BLOCK", 2.5); Worth.put("EMERALD_BLOCK", 250);


function main() {
	try {
		var GridManager = Skyblock.getGrid(); var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(Player);
		var SuperiorIsland = GridManager.getIsland(SuperiorPlayer);
		if(SuperiorIsland == null) {
			Player.sendMessage(ChatColor.translateAlternateColorCodes('&', "&aSkyblock &8&l| &cLỗi: &fMáy chủ không xác định được đảo của bạn! Hãy thử lại sau!"));
			return -1;
		}
		SuperiorIsland.setBonusWorth(new BigDecimal("0")); SuperiorIsland.setBonusLevel(new BigDecimal("0"));
		SuperiorIsland.calcIslandWorth(SuperiorPlayer);
		Player.sendMessage(ChatColor.translateAlternateColorCodes('&', "&aSkyblock &8&l| &fTiến hành tính toán lại giá trị của đảo! Vui lòng chờ chút!"));
		var locs = new ArrayList(); var stacks = GridManager.getStackedBlocks();
		for each(var s in stacks) {
			var island = GridManager.getIslandAt(s); // boolean: include owner - yes
			if(SuperiorIsland.equals(island)) locs.add(s);
		} 
		var total_worth = 0; var total_level = 0;
		for each(var ib in locs) {
			var amount = GridManager.getBlockAmount(ib); var name = ib.getBlock().getType().name();
			total_level += amount * Levels.get(name);
			total_worth += amount * Worth.get(name);
		} 
		SuperiorIsland.setBonusWorth(new BigDecimal(total_worth.toString())); SuperiorIsland.setBonusLevel(new BigDecimal(total_level.toString()));
		Player.sendMessage(ChatColor.translateAlternateColorCodes('&', 
			"&aSkyblock &8&l| &aThông báo: &fHoàn tất! Đảo của bạn hiện cấp &a" + total_level.toString()));
		return locs.size();
	} catch(err) {
		return "&eScript &8&l| &cLỗi: &e" + err.name + " - &f" + err.message;
	}
}
main();
