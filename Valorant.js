var Executor = BukkitPlayer;
var Manager = BukkitServer.getPluginManager();
var Scheduler = BukkitServer.getScheduler();
var World = Executor.getWorld();
var Plugin = Manager.getPlugin("PlaceholderAPI");
var MyItems = Manager.getPlugin("MyItems");

var ChatColor = org.bukkit.ChatColor;
var Particle = org.bukkit.Particle;
var Vector = org.bukkit.util.Vector;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;

var Runnable = Java.type("java.lang.Runnable");
var ArrayList = Java.type("java.util.ArrayList");

var SkillManager = {
  EnvoyPlaceholder: "%crazyenvoy_crates_left%",
  RegionPlaceholder: "%worldguard_region_name%",
  isInPvP: function(p) {
    var RegionID = PlaceholderAPI.static.setPlaceholders(p, this.RegionPlaceholder);
    return RegionID == "pvp";
  },
  getAbsoluteValue: function(base, addon) {
    return Math.floor(base * (1 + (addon / 100)));
  },
  getRadius: function(health) {
    return Math.floor(Math.pow(health, (1/2))) + 1;
  },
  color: function(string) {
    return ChatColor.translateAlternateColorCodes('&', string);
  }
}

function main() {
  try {
    var ValidEnvoys = parseInt(PlaceholderAPI.static.setPlaceholders(Executor, SkillManager.EnvoyPlaceholder));
    if(!isNaN(validEnvoys) && validEnvoys > 5) {
      throw "&cLỗi: &fĐang có sự kiện, không thể khai triển kĩ năng!";
    } else {
      var StatsManager = MyItems.getGameManager().getLoreStatsManager();
      var AttackInfo = StatsManager.getLoreStatsWeapon(Executor); var PlayerCount = 0;
      var BaseForce = AttackInfo.getDamage(); var ForcePvP = AttackInfo.getPvPDamage();
      var SkillForce = Math.floor(Math.pow(SkillManager.getAbsoluteValue(BaseForce, ForcePvP), (1/2)));
      var HealthLimit = Executor.getHealth() > 2048 ? 2048 : Executor.getHealth();
      var Radius = SkillManager.getRadius(HealthLimit); var Strikes = Math.round(HealthLimit / 128);
      var CriticalChance = AttackInfo.getCriticalChance(); var CriticalDamage = AttackInfo.getCriticalDamage();
      for each(var entity in Executor.getNearbyEntities(Radius, 15, Radius)) {
        if(entity.class.getName().contains('Player')) PlayerCount++;
      }; Executor.setMetadata("FlareCore", new FixedMetadataValue(Plugin, Strikes*PlayerCount));
      for each(var e in Executor.getNearbyEntities(Radius, 15, Radius)) {
        if(e.class.getName().contains('Player')) {
          var TargetBlockRate = StatsManager.getLoreStatsArmor(e).getBlockRate(); World.setThundering(true);
          e.sendMessage(SkillManager.color('&4Flare &8&l| &f&oHỡi ngọn lửa linh thiêng, hãy diệt trừ những kẻ ngáng đường ta!'));
          var RoutineDamage = Java.extend(Runnable, {
            run: function() {
              var Count = Executor.getMetadata("FlareCore").get(0).value();
              if(Count == 0) {
                Executor.removeMetadata("FlareCore", Plugin);
                World.setThundering(false);
                this.cancel();
              }
              else Executor.setMetadata("FlareCore", new FixedMetadataValue(Plugin, Count-1));
              var Probability = Math.floor(Math.random() * 100) + 1;
              var Block = Math.floor(Math.random() * 100) + 1;
              skillForce *= Probability <= CriticalChance ? CriticalDamage : 1;
              e.damage(TargetBlockRate > Block ? 0 : Math.floor(skillForce));
              e.setFireTicks(Math.floor(skillForce*2));
              World.spawnParticle(Particle.SMOKE_LARGE, e.getLocation(), 5);
              World.strikeLightningEffect(e.getLocation());
            }
          });
          var Blindness = new PotionEffect(PotionEffectType.BLINDNESS, Strikes*60, 5);
          var Wither = new PotionEffect(PotionEffectType.WITHER, Strikes*70, 5);
          Blindness.apply(e); Wither.apply(e); e.setVelocity(new Vector(0,7,0));
          World.createExplosion(e.getLocation(), 2.5);
          Scheduler.scheduleSyncRepeatingTask(Plugin, new RoutineDamage(), 20, 2);
        } else continue;
      }
      Executor.damage(Strikes); throw "&f&oĐại ma trận đã hoàn tất triển khai...";
    }
  } catch(err) {
    return "&4Flare &8&l| ";
  }
}
main();
