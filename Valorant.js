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
var BukkitRunnable = org.bukkit.scheduler.BukkitRunnable;

var Runnable = Java.type("java.lang.Runnable");

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
      Executor.sendMessage(SkillManager.color("&4Flare &8&l| &f&oTiến hành triện khải đại ma trận..."));
      var StatsManager = MyItems.getGameManager().getLoreStatsManager();
      var AttackInfo = StatsManager.getLoreStatsWeapon(Executor);
      var BaseForce = AttackInfo.getDamage(); var ForcePvP = AttackInfo.getPvPDamage();
      var SkillForce = Math.floor(Math.pow(SkillManager.getAbsoluteValue(BaseForce, ForcePvP), (1/2)));
      var HealthLimit = Executor.getHealth() > 2048 ? 2048 : Executor.getHealth();
      var Radius = SkillManager.getRadius(HealthLimit); var Strikes = Math.round(HealthLimit / 128);
      var CriticalChance = AttackInfo.getCriticalChance(); var CriticalDamage = AttackInfo.getCriticalDamage();
      Executor.setMetadata("FlareCore", new FixedMetadataValue(Plugin, Strikes));
      var DamageTick = new BukkitRunnable() {
        run: function() {
          var StrikeCounter = Executor.getMetadata("FlareCore").get(0).value();
          if(StrikeCounter == 0) {
            Executor.removeMetadata("FlareCore", Plugin); this.cancel();
          } else {
            Executor.setMetadata("FlareCore", new FixedMetadataValue(Plugin, StrikeCount-1));
            for each(var e in Executor.getNearbyEntities(Radius, 12, Radius)) {
              var CritAbility = Math.floor(Math.random() * 100) + 1;
              var BlockAbility = Math.floor(Math.random() * 100) + 1;
              if(e.class.getName().contains("Player")) {
                var BlockChance = StatsManager.getLoreStatsArmor(e).getBlockChance();
                SkillForce *= CritAbility <= CriticalChance ? CriticalDamage : 1;
                e.damage(BlockAbility > BlockChance ? SkillForce : 0);
                e.setFireTicks(Math.floor(SkillForce*(5/3)) + 1);
                World.spawnParticle(Particle.SMOKE_LARGE, e.getLocation(), 8);
                World.strikeLightningEffect(e.getLocation());
                World.createExplosion(e.getLocation(), 2.5);
              } else continue;
            }
          }
        }
      });
      var Task = Java.extend(Runnable, {
        run: function() {
          for each(var target in Executor.getNearbyEntities(Radius, 12, Radius)) {
            if(target.class.getName().contains("Player")) {
              var Blindness = new PotionEffect(PotionEffectType.BLINDNESS, Strikes*60, 5);
              var Slowness = new PotionEffect(PotionEffectType.SLOWNESS, Strikes*70, 5);
              var Weakness = new PotionEffect(PotionEffectType.WEAKNESS, Strikes*100, 8);
              Blindness.apply(target); Slowness.apply(target); Weakness.apply(target);
              target.setVelocity(0,5,0); World.setThunderDuration(Strikes*50);
              target.sendMessage(SkillManager.color(
                "&4Flare &8&l| &f&oHỡi ngọn lửa linh thiêng...Hãy thiêu nát những gì ngáng đường ta..."));
              World.strikeLightning(target.getLocation());
            } else continue;
          }; Scheduler.scheduleSyncRepeatingTask(Plugin, DamageTick, 20, 50);
        }
      }); Scheduler.runTaskLater(Plugin, new Task(), 60);
      Executor.damage(Math.floor((Strikes*SkillForce)/2)+1);
      throw "&f&oĐại ma trận đã hoàn tất triển khai...";
    }
  } catch(err) {
    return "&4Flare &8&l| ";
  }
}
main();
