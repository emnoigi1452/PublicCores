var Player = BukkitPlayer;
var World = Player.getWorld();
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var MyItems = Manager.getPlugin("MyItems");
var PvPManager = Manager.getPlugin("PvPManager");
var Host = Manager.getPlugin("PlaceholderAPI");
// I need a switch, I don't know how :3
var DevMode = false;
 
var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var Runnable = Java.type("java.lang.Runnable");
 
var ChatColor = org.bukkit.ChatColor;
var BukkitRunnable = org.bukkit.scheduler.BukkitRunnable;
var Vector = org.bukkit.util.Vector;
var Location = org.bukkit.Location;
var Particle = org.bukkit.Particle;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;
var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
 
var Light = {
  _SKILL_RADIUS_: 30,
  checkPvPStatus: function(target, pvpInstance) {
    var FlagCheck = "worldguard_region_flags";
    var n1 = PlaceholderAPI.static.setPlaceholders(target, 
      "%worldguard_region_flags%").contains("pvp=ALLOW");
    var n2 = pvpInstance.hasPvPEnabled() && (!pvpInstance.isNewbie());
    return n1 && n2;
  },
  checkPaper: function(entity) {
    var Dif = entity.getInventory().getItem(40);
    if(Dif == null)
      return false;
    var NMS = CraftItemStack.asNMSCopy(Dif);
    if(NMS.getTag() == null)
      return false;
    return NMS.getTag().getInt("Reflect_LVL") > 0;
  },
  color: function(param) {
    return ChatColor.translateAlternateColorCodes('&', param);
  },
  handleEffect: function(type, location) {
    var Nuke; var Task; var Y = location.getBlockY() + 12; var End = location.getBlockY() + 4;
    var X = location.getBlockX(); var Z = location.getBlockZ();
    Task = new BukkitRunnable() {
      run: function() {
        if(Y < End)
          Scheduler.cancelTask(Task.getTaskId());
        Nuke = new Location(World, X, Y, Z);
        World.spawnParticle(type, Nuke, 35);
        Y--;
      }
    }.runTaskTimer(Host, 20, 1);
  },
  checkSighting: function(target) {
    // Algorithm by HorseNuggets :3 tks
    var dir = Player.getLocation().getDirection();
    var v1 = Player.getLocation().toVector();
    var v2 = target.getLocation().toVector();
    var dif = v2.subtract(v1).normalize();
    return dir.dot(dif) > 0.25;
  },
  cdist: function(damage, distance) {
    var formula = 100 - (2.5 * distance);
    return Math.floor(damage * (formula / 100));
  },
  calc: function(base, inc) {
    return Math.floor(base * (inc / 100));
  },
  reflect: function(level) {
    return (35 + (level*5)) / 100;
  },
  heal: function(level) {
    return (6 + (level*2)) / 100;
  },
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
        if(p.equals(Player) || p.isOp()) return false;
        var pL = p.getLocation(); var mL = Player.getLocation();
        if(!p.getWorld().equals(Player.getWorld())) return false;
        else return Light.checkPvPStatus(p, PvPHandler.get(p)) && pL.distance(mL) <= Light._SKILL_RADIUS_; 
      }).forEach(function(e) { Matches.add(e) });
      if(Light.checkPvPStatus(Player, PvPHandler.get(Player))) {
        var InfernoSkillTask = Java.extend(Runnable, {
          run: function() {
            try {
              Light.handleEffect(Particle.FLAME, Player.getLocation());
              var Offensive = StatsControl.getItemStatsWeapon(Player);
              var PVP = Offensive.getTotalPvPDamage(); var PVE = Offensive.getTotalPvEDamage();
              var BaseDMG = Offensive.getTotalDamageMax();
              Matches.stream().forEach(function(e) {
                var Defensive = StatsControl.getItemStatsArmor(e); var FullDamage = 0;
                e.setVelocity(new Vector(0, 3, 0)); var Sight = Light.checkSighting(e);
                var distance = Player.getLocation().distance(e.getLocation());
                var Health = e.getHealth(); var def = Light.calc(Defensive.getTotalDefense(), Defensive.getTotalPvEDefense());
                var baseFlare = Light.calc(Health, PVE);
                if(def > baseFlare / 2) baseFlare = (def - baseFlare) / 2; else baseFlare -= def; 
                baseFlare = Light.cdist(baseFlare, distance); e.setFireTicks(600);
                var p1 = new PotionEffect(PotionEffectType.WITHER, 5, 300);
                var p2 = new PotionEffect(PotionEffectType.BLINDNESS, 5, 300);
                p1.apply(e); p2.apply(e);
                e.sendMessage(Light.color("&eLight &8&l| &f&oTrong cơn sốc, ngươi có nhìn được định mệnh?&e&o..."));
                FullDamage += baseFlare;
                if(Sight) {
                  e.sendMessage(Light.color("&eLight &8&l| &f&oThời khắc quyết định đã đến, hình phạt đã sẵn sàng&c&o..."));
                  var Knock = Light.calc(BaseDMG, PVP); var Block = Defensive.getTotalBlockRate() * 0.75;
                  Knock = Light.calc(Knock, Block); FullDamage += Knock;
                  World.strikeLightningEffect(e.getLocation());
                }
                if(Light.checkPaper(e)) {
                  var Level = CraftItemStack.asNMSCopy(e.getInventory().getItem(40)).getTag().getInt("Reflect_LVL");
                  if(FullDamage > e.getHealth())
                    e.setHealth(10);
                  var Heal = Light.heal(Level) * FullDamage; var Ret = Light.reflect(Level) * FullDamage;
                  Heal = Math.floor(Heal); Ret = Math.round(Ret);
                  var Top = e.getHealth() + Heal >= e.getMaxHealth() ? e.getMaxHealth() : (e.getHealth() + Heal);
                  var Atk = Player.getHealth() <= Ret ? 1 : (Player.getHealth() - Ret);
                  e.setHealth(Top); Player.setHealth(Atk);
                  Player.sendMessage(Light.color("&eLight &3| &f&oCó những thứ vẫn còn quá bí ẩn trên thế gian này..."));
                } else {
                  if(e.getHealth() > FullDamage)
                    e.setHealth(Sight ? 1 : Math.floor(e.getHealth() * 0.1));
                  else
                    e.setHealth(0);
                }
              }); Player.sendMessage(Light.color("&eLight &8&l| &f&oMọi thứ kết thúc&c&o...&f&otan biến hoàn toàn&c&o..."));
            } catch(e) { Player.sendMessage(e.toString()); }
          }
        }); Scheduler.runTaskLater(Host, new InfernoSkillTask(), new java.lang.Long(10)); return 1;
      } else Player.sendMessage(Light.color("&eLight &8&l| &f&oKhông thể triển phép nơi không phải trận địa&c&o..."));
    } return -1;
  } catch(err) {
    return "&eLight &8&l| &cLỗi: &f" + err;
  }
}
main();
