var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");
var Storage = Manager.getPlugin("PreventHopper-ORE");
var Plugin = Manager.getPlugin("PlaceholderAPI");

var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var Calendar = Java.type("java.util.Calendar");
var SimpleDateFormat = Java.type("java.text.SimpleDateFormat");
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var ChatColor = org.bukkit.ChatColor; var color = 'translateAlternateColorCodes';

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function main() {
   try {
      if(Skyblock == null || Storage == null)
         throw "&fMáy chủ không có &aSuperiorSkyblock2 &fhoặc &aPreventHopper&f!";
      var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(Player);
      if(SuperiorPlayer.getPlayerRole().getId() == 3) {
         var Members = SuperiorPlayer.getIsland().getIslandMembers(false);
         if(Members.isEmpty()) {
            Player.sendMessage(ChatColor[color]('&',
               "&bStorage &8&l| &fBạn chỉ có một mình trên đảo! Quản lí cái nỗi gì -.-"));
            return -1;
         }; var StatusMap = new HashMap(); var Placement = new ArrayList();
         Members.stream().filter(function(element) {
            return element.asOfflinePlayer().isOnline();
         }).sorted().forEach(function(online) {
            StatusMap.put(online, true);
            Placement.add(online);
         }); // complete using streams
         Members.stream.filter(function(element) {
            return !element.asOfflinePlayer().isOnline();
         }).sorted().forEach(function(offline) {
            StatusMap.put(offline, false);
            Placement.add(offline);
         });
         var IslandSize = SuperiorPlayer.getIsland().getIslandMembers().size();
         switch(args[0].toLowerCase().trim()) {
            case "display-size": return IslandSize.toString();
            case "get":
              var index = parseInt(args[1]);
              if(isNaN(index) || index < 1 || index >= IslandSize)
                throw "&fSố nhập vào không hợp lệ!";
              else {
                var PlayerKey = Placement.get(index-1); var message = "";
                if(StatusMap.get(PlayerKey)) {
                  message += "&f╔═══ Tình trạng kho khoáng sản:\n\n";
                  var DataInstance = PlayerKey.asPlayer().getMetadata("playerData").get(0).value(0);
                  message += "&f╠══════ &8Than: &a" + numberWithCommas(DataInstance.getBlock("COAL")) + "\n";
                  message += "&f╠══════ &9Lưu ly: &a" + numberWithCommas(DataInstance.getBlock("LAPIS_LAZULI")); + "\n";
                  message += "&f╠══════ &4Đá đỏ: &a" + numberWithCommas(DataInstance.getBlock("REDSTONE")) + "\n";
                  message += "&f╠══════ &fSắt: &a" + numberWithCommas(DataInstance.getBlock("IRON_INGOT")) + "\n";
                  message += "&f╠══════ &6Vàng: &a" + numberWithCommas(DataInstance.getBlock("GOLD_INGOT")) + "\n";
                  message += "&f╠══════ &bKim cương: &a" + numberWithCommas(DataInstance.getBlock("DIAMOND")) + "\n";
                  message += "&f╠══════ &aLục bảo: &a" + numberWithCommas(DataInstance.getBlock("EMERALD")) + "\n\n";
                  var Time = Calendar.getInstance(); var TimeFormat = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
                  message += "&f &f &fCập nhật lúc: &a" + TimeFormat.format(Time.getTime());
                } else message = "&f &f &f &8[&c✘] &fKhông trực tuyến";
              }; return message;
         }
      } else
         Player.sendMessage(ChatColor[color]('&',
            "&bStorage &8&l| &cLỗi: &fChỉ có chủ đảo mới có quyền dùng tính năng này!"));
      return 0;
   } catch(err) {
      return "&eScript &8&l| &cLỗi: &f" + err.name;
   }
}
main();
