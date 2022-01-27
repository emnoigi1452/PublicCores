var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();
var Host = Server.getPluginManager().getPlugin("PlaceholderAPI");
var ChatColor = org.bukkit.ChatColor;

var Runnable = Java.type("java.lang.Runnable");
var ArrayList = Java.type("java.util.ArrayList");

var Handle = {
	color: function(param) {
		return ChatColor.translateAlternateColorCodes('&', param);
	},
	getPing: function(user) {
		// Could be replaced with user.getHandle(), not risking it though :)
		var NMSInstance = user.class.getMethod("getHandle").invoke(user);
		// Same thing here, could access field with NMSInstance.ping, but no
		return NMSInstance.class.getField("ping").get(NMSInstance);
	},
	selector: function(cap) {
		var online = Server.getOnlinePlayers(); 
		var output = new ArrayList();
		// Java streams go brr
		online.stream().filter(function(p) {
			return this.getPing(p) > cap && !p.equals(Player);
		}).forEach(function(match){output.add(match)});
	}
}

function main() {
	try {
		if(!Player.hasPermission("ping.admin"))
			Player.sendMessage(Handle.color(
				"&ePing &8&l| &cLỗi: &fBạn không có quyền dùng lệnh này!"));
		else {
			var PingCap = parseInt(args[0]);
			if(isNaN(PingCap) || (PingCap < 0 || PingCap > 1000000))
				Player.sendMessage(Handle.color(
					"&ePing &8&l| &cLỗi: &fSố ping nhập vào không hợp lệ!"));
			else {
				var PingMessage = "&ePing &8&l| &fTiến hành những người chơi ping cao hơn &a%ams &ftrong &a%ss&f...";
				var PingFilterTask = Java.extend(Runnable, {
					run: function() {
						var Selected = Handle.selector(PingCap);
						Player.sendMessage(Handle.color(
							"&ePing &8&l| &cLỗi: &fTiến hành lọc &a" + Selected.size() + " &fngười chơi có ping cao..."));
						for each(var instance in Selected) {
							instance.sendMessage(Handle.color(
								"&ePing &8&l| &cLưu ý: &fBạn sắp bị lọc ra khỏi máy chủ vì ping cao! Để tránh mất đồ, vui lòng đứng yên trong &a10s &ftiếp theo"));
							Scheduler.scheduleSyncDelayedTask(Host, createRemovingTask(instance), 200);
						}
					}
				});
				function createRemovingTask(user) {
					var TaskInstance = Java.extend(Runnable, {
						run: function() {
							var command = "spawn %p".replace("%p", instance.getName());
							Server.dispatchCommand(Console, command);
							var Message = "&fPing bạn cao quá &c:( &fChơi lại sau nhé";
							user.kickPlayer(Message);
						}
					}); return new TaskInstance();
				}
				var Delay = /* Seconds */ 10;
				Server.broadcastMessage(Handle.color(PingMessage)
					.replace("%a", PingCap.toString())
					.replace("%s", Delay.toString()));
				Scheduler.scheduleSyncDelayedTask(Host, new PingFilterTask(), Math.floor(20*Delay)); return 0;
			}
		} return -1;
	} catch(err) {
		return "&ePing &8&l| &cLỗi: &f" + err;
	}
}
