var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Host = Manager.getPlugin("PlaceholderAPI");
var MyItems = Manager.getPlugin("MyItems");

var ChatColor = org.bukkit.ChatColor;
var Vector = org.bukkit.util.Vector;
var BukkitRunnable = org.bukkit.scheduler.BukkitRunnable;
var Location = org.bukkit.Location;
var EntityDamageByEntityEvent = org.bukkit.event.entity.EntityDamageByEntityEvent;
var EntityDamageEvent = org.bukkit.event.entity.EntityDamageEvent;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;

var QuakeAPI = {
  MARKERS: ['CraftCreeper', 'CraftZombie', 'CraftWitherSkeleton', 'CraftSkeleton', 'CraftSpider', 'CraftCaveSpider', 'CraftPlayer'],
  isMarkedEntity: function(entity) {
    var BoolHandle = QuakeAPI.MARKERS.filter(function(marker) { return entity.class.getName().contains(marker) }).length > 0;
    return BoolHandle && entity.getHandle().class.getName().contains("net.minecraft.");
  },
  mixDamage: function(packet) {
    var Base = 0;
    var Crit = packet.getTotalCriticalDamage();
    if(Crit >= 100)
      Base = packet.getTotalDamageMax();
    else
      Base = (((packet.getTotalDamageMax() * Crit) + (packet.getTotalDamageMin() * (100 - Crit))) / 100);
    return Base *= (1 + (packet.getTotalPvPDamage() / 100));
  },
}

function main() {
  try {
    if(MyItems == null)
      throw "MyItems not detected! Please re-check your plugins!";
    var StatsManager = MyItems.getPlayerManager().getPlayerItemStatsManager();
    var Direction = Player.getLocation().getDirection();
    Player.setVelocity(Direction.multiply(4.0));
    var DamagePacket = StatsManager.getItemStatsWeapon(Player);
    var DamageValue = QuakeAPI.mixDamage(DamagePacket);
    (new BukkitRunnable() {
      run: function() {
        try {
          var Nearby = Player.getNearbyEntities(10,2,10);
          Nearby.stream().forEach(function(e) {
            if(QuakeAPI.isMarkedEntity(e)) {
              var DamageEvent = new EntityDamageByEntityEvent(Player, e, EntityDamageEvent.DamageCause.CUSTOM, DamageValue);
              Manager.callEvent(DamageEvent);
              if(!DamageEvent.isCancelled()) {
                var MaxEntityHealth = e.getMaxHealth();
                if(MaxEntityHealth <= DamageValue)
                  e.setHealth(e.class.getName().contains("CraftPlayer") ? 1 : 0);
                else
                  e.setHealth(e.getMaxHealth() - DamageValue);
              }
              e.setVelocity(new Vector(0, 3, 0));
              e.getWorld().strikeLightningEffect(e.getLocation());
              (new PotionEffect(PotionEffectType.BLINDNESS, 10, 12, true, false)).apply(e);
            }
          });
        } catch(err) { err.printStackTrace(); }
      }
    }).runTaskLater(Host, 3);
  } catch(err) { err.printStackTrace(); }
}
main();
