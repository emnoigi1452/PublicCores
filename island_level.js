var Player = BukkitPlayer;
var Skyblock = BukkitServer.getPluginManager().getPlugin("SuperiorSkyblock2");
var Scheduler = BukkitServer.getScheduler();

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function main() {
   try {
      if(Skyblock == null)
         return "&cĐịnh dạng lỗi!";
      else {
         var SuperiorPlayer = Skyblock.getPlayers().getSuperiorPlayer(Player.getUniqueId());
         if(!SuperiorPlayer.hasIsland())
            return "&aVô gia cư";
         else {
            var Island = SuperiorPlayer.getIsland(); var Level = numberWithCommas(Island.getIslandLevel().intValue());
            var Placement = PlaceholderAPI.static.setPlaceholders(Player, "%superior_island_top_level_position%");
            return "&a" + Level + "&a✯ &f- &a#" + Placement;
         }
      }
   } catch(err) {
      return err;
   }
}
