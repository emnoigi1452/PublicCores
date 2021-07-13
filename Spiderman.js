// PlaceholderAPI - JavaScriptExpansion pre-made objects
var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();
var Scheduler = Server.getScheduler();
var Plugin = Server.getPluginManager().getPlugin("PlaceholderAPI");
// Custom java classes - Imported via NashornAPI
var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var Thread = Java.type("java.lang.Thread");
var Runnable = Java.type("java.lang.Runnable");
// SpigotAPI classes - External usage
var Material = org.bukkit.Material;
var ChatColor = org.bukkit.ChatColor;
var Location = org.bukkit.Location;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;
var Particle = org.bukkit.Particle;
var Color = org.bukkit.Color;
// Custom objects
var victims = new ArrayList();
var cages = new HashMap();

function not_in_pvp(player) {
  var x_array = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
  var z_array = [1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058];
  if(player.getWorld().getName() != "world") return true;
  var region = "worldguard_region_name"; var loc = player.getLocation();
  if(PlaceholderAPI.static.setPlaceholders(player, "%" + region + "%") != "pvp")
    return true;
  else {
    var x = loc.getBlockX(); var z = loc.getBlockZ();
    return x_array.indexOf(x) != -1 && z_array.indexOf(z) != -1;
  }
}

function setup_cage() {
  var CageSetupTask = Java.extend(Runnable, {
    run: function() {
      var online_players = Server.getOnlinePlayers();
      for each(var p in online_players) {
        var world_1 = p.getWorld().getName();
        var world_2 = Player.getWorld().getName();
        if(world_1 == world_2) {
          if(!not_in_pvp(p)) {
            if(p.getLocation().distance(Player.getLocation()) < 35)
              victims.add(p);
          }
        }
      }
      for each(var v in victims) {
        var loc = v.getLocation();
        var block_locs = new ArrayList();
        block_locs.add(loc.clone().add(0,1,0));
        block_locs.add(loc.clone().add(0,2,0));
        block_locs.add(loc.clone().add(0,3,0));
        block_locs.add(loc.clone().add(1,1,0));
        block_locs.add(loc.clone().add(1,2,0));
        block_locs.add(loc.clone().add(1,3,0));
        block_locs.add(loc.clone().add(0,1,1));
        block_locs.add(loc.clone().add(0,2,1));
        block_locs.add(loc.clone().add(0,3,1));
        block_locs.add(loc.clone().add(1,1,1));
        block_locs.add(loc.clone().add(1,2,1));
        block_locs.add(loc.clone().add(1,3,1));
        block_locs.add(loc.clone().subtract(1,1,0));
        block_locs.add(loc.clone().subtract(1,2,0));
        block_locs.add(loc.clone().subtract(1,3,0));
        block_locs.add(loc.clone().subtract(0,1,1));
        block_locs.add(loc.clone().subtract(0,2,1));
        block_locs.add(loc.clone().subtract(0,3,1));
        block_locs.add(loc.clone().subtract(1,1,1));
        block_locs.add(loc.clone().subtract(1,2,1));
        block_locs.add(loc.clone().subtract(1,3,1));
        cages.put(v, block_locs);
      }
    }
  }); new Thread(new CageSetupTask()).start();
}

function main() {
  try {
    setup_cage();
    var Trap = Java.extend(Runnable, {
      run: function() {
        for each(var e in victims) {
          var blocks = cages.get(e);
          for each(var b in blocks) {
            if(b.getLocation().getBlock().getType() == "AIR")
              b.setType(Material.COBWEB);
          }
        }
      }
    });
    var Particles = Java.extend(Runnable, {
      run: function() {
        for each(var e in victims) {
          var head = e.getEyeLocation().clone().subtract(0,0.25,0);
          e.spawnParticle(/* type */ Particle.REDSTONE,
                          /* location */ head,
                          /* count */ 5,
                          /* red values */ 43,
                          /* green values */ 218,
                          /* blue values */ 67);
          var poison = new PotionEffect(PotionEffectType.POISON,
                                        300, 10, true, true,
                                        Color.fromRGB(0,204,0));
          poison.apply(e);
        }
      }
    });
    var Finish = Java.extend(Runnable, {
      run: function() {
        for each(var e in victims) {
          var blocks = cages.get(e);
          for each(var b in blocks) {
            if(b.getLocation().getBlock().getType() == "COBWEB")
              b.setType(Material.AIR);
          }
          var ability = Math.floor(Math.random()*4) + 1;
          if(ability == 4) {
            if(e.getMaxHealth() < 30)
              e.setHealth(0);
          }
        }
      }
    });
    Scheduler.runTask(Plugin, new Trap());
    new Thread(new Particles()).start();
    Scheduler.runTaskLater(Plugin, new Finish(), 200);
    // Finish
  } catch(error) {
    return "&eScript &8&l| &cLỗi: &f" + error.message;
  }
}
main();
