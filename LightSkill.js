var Player = BukkitPlayer;
var World = Player.getWorld();
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var MyItems = Manager.getPlugin("MyItems");
var PvPManager = Manager.getPlugin("PvPManager");
var Host = Manager.getPlugin("PlaceholderAPI");
var DevMode = Player.getName() != "DucTrader";

var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var Runnable = Java.type("java.lang.Runnable");

var ChatColor = org.bukkit.ChatColor;
var Vector = org.bukkit.util.Vector;
var Location = org.bukkit.Location;
var Particle = org.bukkit.Particle;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;

var Light = {
  _SKILL_RADIUS_: 30,
  checkPvPStatus: function(target, pvpInstance) {
    var FlagCheck = "worldguard_region_flags";
    var n1 = PlaceholderAPI.static.setPlaceholders(target, 
      "%worldguard_region_flags%").contains("pvp=ALLOW");
    var n2 = pvpInstance.hasPvPEnabled() && (!pvpInstance.isNewbie());
    return n1 && n2;
  },
  color: function(param) {
    return ChatColor.translateAlternateColorCodes('&', param);
  },
  handleEffect: function(type, location, density) {
    var Altitude = parseInt(location.getBlockY() + 100);
    var X = location.getBlockX(); var Z = location.getBlockZ();
    for(; Altitude >= location.getBlockY(); Altitude--)
      World.spawnParticle(type, new Location(World, X, Altitude, Z), density);
  },
  checkSighting: function(target) {
    // Algorithm by HorseNuggets :3 tks
    var dir = Player.getLocation().getDirection();
    var v1 = Player.getLocation().toVector();
    var v2 = target.getLocation().toVector();
    var dif = v2.subtract(v1).normalize();
    return dir.dot(dif) < 0.25;
  },
  cdist: function(damage, distance) {
    var formula = 100 - (2.5 * distance);
    return Math.floor(damage * (formula / 100));
  },
  calc: function(base, inc) {
    return Math.floor(base * (inc / 100));
  }
}

function main() {
  try {
    if(DevMode)
      throw "Kĩ năng hiện đang cập nhật! Không dùng được nhé &b:3";
    else {
      if(MyItems == null || PvPManager == null)
        throw "&fMáy chủ hiện thiếu plugin &c:( &fKhông thể triển khai skill...";
      var StatsControl = MyItems.getPlayerManager().getPlayerItemStatsManager();
      var PvPHandler = PvPManager.getPlayerHandler(); var Matches = new ArrayList();
      Server.getOnlinePlayers().stream().filter(function(p) {
        if(p.equals(Player)) return false;
        var pL = p.getLocation(); var mL = Player.getLocation();
        if(!p.getWorld().equals(Player.getWorld())) return false;
        else return Light.checkPvPStatus(p, PvPHandler.get(p)) && pL.distance(mL) <= Light._SKILL_RADIUS_; 
      }).forEach(function(e) { Matches.add(e) });
      if(Light.checkPvPStatus(Player, PvPHandler.get(Player))) {
        var InfernoSkillTask = Java.extend(Runnable, {
          run: function() {
            try {
              Light.handleEffect(Particle.END_ROD, Player.getLocation(), 20);
              var Offensive = StatsControl.getItemStatsWeapon(Player);
              var PVP = Offensive.getTotalPvPDamage(); var PVE = Offensive.getTotalPvEDamage();
              var BaseDMG = Offensive.getTotalDamageMax();
              Matches.stream().forEach(function(e) {
                e.setVelocity(new Vector(0, 3, 0)); var Sight = Light.checkSighting(e);
                var distance = Player.getLocation().distance(e.getLocation());
                var Health = e.getHealth();
                var baseFlare = Light.calc(Health, PVE);
                baseFlare = Light.cdist(baseFlare, distance); e.setFireTicks(600);
                var p1 = new PotionEffect(PotionEffectType.WITHER, 5, 300);
                var p2 = new PotionEffect(PotionEffectType.BLINDNESS, 5, 300);
                p1.apply(e); p2.apply(e);
                e.sendMessage(Light.color("&eLight &8&l| &f&oTrong cơn sốc, ngươi có nhìn được định mệnh?..."));
                if(e.getHealth() < baseFlare) e.setHealth(0);
                else e.setHealth(e.getHealth() - baseFlare);
                if(Sight) {
                  e.sendMessage(Light.color("&eLight &8&l| &f&oThời khắc đã đến, hình phạt đã quyết..."));
                  var Knock = Light.calc(BaseDMG, PVP);
                  World.strikeLightningEffect(e.getLocation());
                  if(Knock > e.getHealth()) e.setHealth(0); else e.setHealth(1);
                }
              }); Player.sendMessage(Light.color("&eLight &8&l| &f&oMọi thứ kết thúc...tan biến hoàn toàn..."));
            } catch(e) { Player.sendMessage(e.toString()); }
          }
        }); Scheduler.runTaskLater(Host, new InfernoSkillTask(), new java.lang.Long(10)); return 1;
      } else Player.sendMessage(Light.color("&eLight &8&l| &f&oKhông thể triển phép nơi không phải trận địa..."));
    } return -1;
  } catch(err) {
    return "&eLight &8&l| &cLỗi: &f" + err;
  }
}
main();
