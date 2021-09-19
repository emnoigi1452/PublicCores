var Player = BukkitPlayer;
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Plugin = Server.getPluginManager().getPlugin("PlaceholderAPI");
var WorldGuard = Server.getPluginManager().getPlugin("WorldGuard");

var ArrayList = Java.type("java.util.ArrayList");
var World = Player.getWorld();
var Location = org.bukkit.Location;
var Vector = org.bukkit.util.Vector;
var ChatColor = org.bukkit.ChatColor;

var ArmorScores = new java.util.HashMap()
  .put("Asteroid", 1);
  .put("Galaxy", 3);
  .put("Warden", 4);
  .put("Dark Matter", 8);
  .put("Nebula", 6);
  .put("Prototype", 5);
  .put("not_count", 0);

var SkillManager = {
  colorize: function(input) { return ChatColor.translateAlternateColorCodes('&', input); },
  check_pvp_rg: function(player) {
    var placeholder = "%worldguard_region_name%";
    var result = PlaceholderAPI.static.setPlaceholders(player, placeholder);
    return player.getWorld().getName() == "world" && result == "pvp";
  },
  targetSelector: function(radius) {
    var targets = new ArrayList(); // marked
    for each(var p_o in Server.getOnlinePlayers()) {
      if(!p_o.getWorld().equals(Player.getWorld())) continue;
      if(!check_pvp_rg(p_o)) continue;
      if(p_o.getLocation().distance(Player.getLocation()) < radius)
        targets.add(p_o);
    } return targets; // list of active targets;
  },
  nameTrim: function(displayName) {
    if(displayName.contains("Asteroid")) return "Asteroid";
    if(displayName.contains("Galaxy")) return "Galaxy";
    if(displayName.contains("Warden")) return "Warden";
    if(displayName.contains("Dark Matter")) return "Dark Matter";
    if(displayName.contains("Veil Nebula")) return "Nebula";
    if(displayName.contains("Prototype A.A")) return "Prototype";
    else return "not_count";
  },
  getRadius: function(armorContents) {
    var default_radius_value = 0; var points = 0;
    for each(var slot in armorContents) {
      if(slot == null) continue; // skip null slots
      var name = slot.hasItemMeta() && slot.hasDisplayName() ? slot.getItemMeta().getDisplayName() : "none";
      points += ArmorScores.get(this.nameTrim(name));
    }
    // calculate radius, literally the circumference of a circle
    return Math.floor((points*2)*Math.PI);
  }
};

function main() {
  try {
    if(!SkillManager.check_pvp_rg(Player)) {
      Player.sendMessage(SkillManager.colorize("&aSagittarius &8&l| &f&oTriển khai &c&othất bại&f&o, đây không phải địa điểm thích hợp...")); return -1;
    } else {
      var aoe = SkillManager.getRadius(Player.getInventory().getArmorContents());
      var dps = Player.getHealth() / 80; var targets = SkillManager.targetSelector(aoe);
      var Task = Java.extend(Runnable, {
        run: function() {
          for each(var t in targets) {
            var location = t.getLocation(); t.damage(dps); t.setFireTicks(20);
            World.strikeLightning(location); t.setVelocity(new org.bukkit.util.Vector(0, 10, 0));
          }
        }
      }); var center = Player.getLocation();
      for each(var pull in targets) {
        var from = pull.getLocation();
        var vect_x = from.getX() - to.getX();
        var vect_y = from.getY() - to.getY();
        var vect_z = from.getZ() - to.getZ();
        var vector = new org.bukkit.util.Vector(vect_x, vect_y, vect_z).normalize().multiply(-5);
        pull.setVelocity(vector);
      }
      for(var j = 0; j < 5; j++) {
        Scheduler.runTaskLater(Plugin, new Task(), 1000);
      }
      return 0;
    }
  } catch(err) {
    return "&eScript &8&l| &cLỗi: &f" + err.name + " &f- " + err.message;
  }
} main();
