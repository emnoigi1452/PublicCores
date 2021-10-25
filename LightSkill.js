var Executor = BukkitPlayer;
var World = Executor.getWorld();
var Server = BukkitServer;
var MyItems = Server.getPluginManager().getPlugin("MyItems");
var Scheduler = Server.getScheduler();
var Host = Server.getPluginManager.getPlugin("PlaceholderAPI");

var Runnable = Java.type("java.lang.Runnable");
var ArrayList = Java.type("java.util.ArrayList");
var ChatColor = org.bukkit.ChatColor;
var Statistic = org.bukkit.Statistic;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;
var Vector = org.bukkit.util.Vector;

var Script = {
   Region: '%worldguard_region_name%',
   Envoy: '%crazyenvoy_crates_left%',
   getCalculatedValue: function(base, addon) {
      return base * (1 + (addon / 100));
   },
   getNearbyTargets: function(radius) {
      var online = Server.getOnlinePlayers(); var matches = new ArrayList();
      online.stream().filter(function(player) {
         if(!World.equals(player.getWorld()))
            return false;
         else {
            var region = PlaceholderAPI.static.setPlaceholders(player, this.Region);
            var distance = player.getLocation().distance(Executor.getLocation());
            return region == "pvp" && distance < radius;
         }
      }).forEach(function(pass) {
         matches.add(pass);
      }); return matches;
   },
   getLocationDamage: function(radius, distance, power) {
      var constantValue = Math.floor(power / radius);
      return distance < 3 ? power : constantValue * distance;
   },
   isInView: function(source, target) {
      var direction = source.getDirection();
      var source_vec = source.toVector();
      var target_vec = target.toVector();
      var dif = target.subtract(source).normalize();
      return direction.dot(dif) > 0.25;
   }
};

function main() {
   try {
      var crateStatus = parseInt(PlaceholderAPI.static.setPlaceholders(Executor, Script.Envoy));
      if(!isNaN(crateStatus) && crateStatus >= 12)
         throw "&oBầu không khí có nhiều chướng ngại vật...Không thể triển khai phép!";
      var StatsManager = MyItems.getPlayerManager().getPlayerItemStatsManager();
      var LoreStats = MyItems.getGameManager().getLoreStatsManager();
      if(p.getHealth() > 400 || p.getMaxHealth() > 500) {
         var healthCap = Executor.getHealth() > 1536 ? 1536 :  Executor.getHealth();
         var skillRadius = Math.floor(Math.pow((healthCap / 15), Math.cos(102.4 * (Math.PI / 180))));
         var playerStats = StatsManager.getItemStatsWeapon(Executor);
         var baseDamage = Math.floor(playerStats.getTotalDamage()); var additionPvP = playerStats.getTotalPvPDamage();
         var skillForce = Math.floor(Script.getCalculatedValue(baseDamage, additionPvP));
         var ItemLoreStats = LoreStats.getLoreStatsWeapon(Executor.getInventory().getItemInMainHand());
         var critChance = ItemLoreStats.getCriticalChance(); var randomization = Math.floor(Math.random() * 100) + 1;
         var lightningStrike = randomization > critChance ? Math.floor(baseDamage * ItemLoreStats.getCriticalDamage()) : baseDamage;
         var Phoebus = Java.extend(Runnable, {
            run: function() {
               var deceased = 0; var nearbyPlayers = Script.getNearbyTargets(skillRadius);
               for each(var target in nearbyPlayers) {
                  var blind = new PotionEffect(PotionEffectType.BLINDNESS, 300, 5);
                  var weak = new PotionEffect(PotionEffectType.WEAKNESS, 600, 10);
                  blind.apply(target); weak.apply(target);
                  target.setVelocity(new Vector(0, 5, 0));
                  if(isInView(Executor.getLocation(), target.getLocation())) {
                     World.strikeLightningEffect(target.getLocation());
                     var targetStamina = target.getHealth(); var targetCapacity = target.getMaxHealth();
                     if(lightningStrike > targetCapacity || lightningStrike > targetStamina) {
                        target.setHealth(0); deceased++;
                     } else {
                        target.damage(lightningStrike); target.setFireTicks(300);
                     }
                  } else {
                     var defenseStats = StatsManager.getItemStatsArmor(target);
                     var baseDef = defenseStats.getTotalDefense(); var pvpBuff = defenseStats.getTotalPvPDefense();
                     var totalDefense = Script.getCalculatedValue(baseDef, pvpBuff); var blockChance = ItemLoreStats.getBlockChance();
                     var penetrationValue = ItemLoreStats.getPenetration();
                     var blockAbility = blockChance > penetrationValue ? blockChance - penetrationValue : 0;
                     totalDefense = Math.floor(totalDefense * (blockAbility / 100));
                     var distanceFromCenter = target.getLocation().distance(Executor.getLocation());
                     var burnDamage = Script.getLocationDamage(skillRadius, distanceFromCenter, skillForce) - totalDefense;
                     if(burnDamage > Math.floor(target.getHealth())) {
                        target.setHealth(0); deceased++;
                     } else {
                        target.damage(burnDamage); target.setFireTicks(600);
                     }
                  }
                  target.sendMessage(ChatColor.translateAlternateColorCodes('&',
                     "&6Light &8&l| &f&oMột ngọn lửa thắp sáng linh hồn ngươi...Và dẫn nó tan thành tro bụi..."));
               }
               Executor.incrementStatistic(Statistic.PLAYER_KILLS, deceased);
            }
         }); Scheduler.runTask(Host, new Phoebus());
         Player.sendMessage(ChatColor.translateAlternateColorCodes('&',
            "&6Light &8&l| &fLinh hồn ánh sáng đã cho ngươi sức mạnh, kẻ thù đã bị suy yếu..."));
         return 0;
      } else throw "&oKhông đủ năng lực để triển khai kĩ năng...";
   } catch(err) {
      return "&6Light &8&l| &cLỗi: &f" + err.message;
   }
}
