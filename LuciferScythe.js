var Executor = BukkitPlayer;
var World = Executor.getWorld();
var Server = BukkitServer;
var MyItems = Server.getPluginManager().getPlugin("MyItems");
var Scheduler = Server.getScheduler();
var Host = Server.getPluginManager.getPlugin("PlaceholderAPI");

var Runnable = Java.type("java.lang.Runnable");
var ArrayList = Java.type("java.util.ArrayList");
var ChatColor = org.bukkit.ChatColor;
var EntityType = org.bukkit.entity.EntityType;
var Statistic = org.bukkit.Statistic;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;

var Script = {
   Placeholder: "%worldguard_region_name%";
   EventCheck: "%crazyenvoy_crates_left%";
   getRadius: function(level) {
      if(typeof level != "int")
         throw "Loại dữ liệu không hợp lệ!";
      else return level * 25;
   },
   getNearbyPlayers: function(radii) {
      var members = Server.getOnlinePlayers(); var match = new ArrayList();
      members.stream().filter(function(player) {
         var reg = PlaceholderAPI.static.setPlaceholders(player, this.Placeholder);
         return player.getWorld().equals(World) && reg == "pvp" && !player.equals(Executor) &&
                && player.getLocation().distance(Executor.getLocation()) <= radii;
      }).forEach(function(same) {
         match.add(same);
      }); return match;
   },
   getCalculatedStats: function(base, addition) {
      return Math.floor(base * (1 + (addition / 100)));
   },
};

function main() {
   try {
      var level = parseInt(args[1]); 
      if(isNaN(level) || level > 3 || level < 1)
         throw "Cấp độ triển khai không hợp lệ!";
      var CratesHolder = PlaceholderAPI.static.setPlaceholders(Executor, Script.EventCheck);
      if(parseInt(CratesHolder) != 0) {
         Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&4Lucifer &8&l| &f&oTa không phải kẻ muốn tàn sát một bữa tiệc vui...Hãy chờ đi..."));
         return -1;
      }
      var StatsManager = MyItems.getPlayerManager().getPlayerItemStatsManager();
      var Caster = StatsManager.getItemStatsWeapon(Executor);
      var baseDamage = Caster.getTotalDamage(); var multiplier = Caster.getTotalPvPDamage();
      var skillForce = Script.getCalculatedStats(baseDamage, multiplier);
      var skillPenetration = Caster.getTotalPenetration(); var defenseMultiplier = 1 - (skillPenetration / 100);
      var skillAreaOfEffect = Script.getRadius(level);
      var Skill = Java.extend(Runnable {
         run: function() {
            var victims = 0; var gained = 0; var starters = Script.getNearbyPlayers(skillAreaOfEffect);
            for each(var element in starters) {
               var defenseStats = StatsManager.getItemStatsArmor(element); element.setFireTicks(20);
               var baseDefense = defenseStats.getTotalDefense(); var addon = defenseStats.getTotalPvPDefense();
               var victimBlockChance = Math.floor(defenseStats.getTotalBlockChance());
               var probability = Math.random(100) + 1;
               var blockade = Script.getCalculatedStats(baseDefense, addon);
               if((blockade*defenseMultiplier) + element.getHealth() < skillForce && probability > victimBlockChance) {
                  victims++; gained += element.getHealth();
                  var hellGate = element.getLocation(); element.setHealth(0);
                  World.spawnEntity(hellGate, EntityType.EVOKER_FANGS);
                  World.strikeLightningEffect(hellGate)
                  var note = "&4Lucifer &8&l| &f&oMất hết ý chí chiến đấu, mất hết sức mạnh của mình...";
                  element.sendMessage(ChatColor.translateAlternateColorCodes('&', note));
               } else {
                  var effectShock = new PotionEffect(PotionEffectType.BLINDNESS, 300, 5); effectShock.apply(element);
                  element.sendMessage(ChatColor.translateAlternateColorCodes('&',
                     "&4Lucifer &8&l| &f&oKhá lắm...Ngươi đã chứng minh mình có khả năng..."));
               }
            }
            Executor.incrementStatistic(Statistic.PLAYER_KILLS, victims);
            Player.setMaxHealth(Math.floor(Player.getMaxHealth() + gained));
            Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
               "&4Lucifer &8&l| &a" + victims.toString() + " &fngười chết! Bạn được tăng &a+" + gained.toString() + "&fHP"));
         }
      }); Scheduler.runTask(Host, new Skill()); return 0;
   } catch(err) {
      return "&4Lucifer &8&l| &cLỗi: &f" + err.message;
   }
}
main();
