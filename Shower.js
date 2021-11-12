var Server = __plugin.getServer();
var Scheduler = Server.getScheduler();

var Runnable = Java.type("java.lang.Runnable");
var HashSet = Java.type("java.util.HashSet");
var ItemStack = org.bukkit.inventory.ItemStack;
var ChatColor = org.bukkit.ChatColor;
var Location = org.bukkit.Location;
var Material = org.bukkit.Material;

// Module handler
var ShowerManager = {
  showerMax: 500
  getLevel: function(player) {
    var hand = player.getInventory().getItemInMainHand();
    if(hand == null) return -1;
    var lore = hand.getItemMeta().getLore(); var level = -1;
    for each(var line in lore) {
      var clear = ChatColor.stripColor(line);
      var pattern = /Shower \d{3}/g
      if(line.search(pattern) != -1) {
        var from = line.search(pattern) + 7
        var to = line.charAt(from+2) == " " ? 1 : 2;
        level = parseInt(line.substring(from, to));
        break;
      } else continue;
    }
    return level;
  },
  generationProbability: function(level) {
    return Math.floor(level / 1000);
  },
  validCollection: function() {
    var ValidSet = new HashSet();
    ValidSet.add(Material.COAL_BLOCK);
    ValidSet.add(Material.LAPIS_BLOCK);
    ValidSet.add(Material.REDSTONE_BLOCK);
    ValidSet.add(Material.IRON_BLOCK);
    ValidSet.add(Material.GOLD_BLOCK);
    ValidSet.add(Material.DIAMOND_BLOCK);
    ValidSet.add(Material.EMERALD_BLOCK);
    ValidSet.add(Material.COAL_ORE);
    ValidSet.add(Material.LAPIS_ORE);
    ValidSet.add(Material.REDSTONE_ORE);
    ValidSet.add(Material.GLOWING_REDSTONE_ORE);
    ValidSet.add(Material.IRON_ORE);
    ValidSet.add(Material.GOLD_ORE);
    ValidSet.add(Material.DIAMOND_ORE);
    ValidSet.add(Material.EMERALD_ORE);
    return ValidSet;
  },
  initMap: function(board, rate, x1, x2, z1, z2) {
    var xPath = x1; var zPath;
    for(; xPath <= x2; xPath++) {
      for(zPath = z1; z1 <= z2; zPath++) {
        var random = Math.floor(Math.random() * 100) + 1;
        if(random <= rate) board[xPath][zPath] = true;
        else board[xPath][zPath] = false;
      }
    }; return board;
  }
};

// Event Handler
events.blockBreak(function(e) {
  var Executor = e.player; var World = Executor.getWorld();
  if(ShowerManager.getLevel(Executor) != -1) {
    var generation = ShowerManager.generationProbability(Shower.getLevel(Executor));
    var type = e.getBlock().getType();
    var AllowedTypes = ShowerManager.validCollection();
    if(AllowedTypes.contains(type)) {
      if(type.equals(Material.GLOWING_REDSTONE_ORE))
        type = Material.REDSTONE_ORE
      var packageData = new ItemStack(type, 1).getData(); var dropLoc;
      var startPoint = Executor.getLocation(); var generationBoard = [][];
      var startX = startPoint.getBlockX() + 100; var endX = startPoint.getBlockX() - 100;
      var startZ = startPoint.getBlockZ() + 100; var endZ = startPoint.getBlockZ() - 100;
      var fieldMap = ShowerManager.initMap(generationBoard, generation, startX, endX, startZ, endZ);
      var dropHeight = Math.floor(startPoint.getBlockY() + 50); var zIterator;
      var DropTask = Java.extend(Runnable, {
        run: function() {
          dropLoc = new Location(startX, dropHeight, zIterator);
          if(dropLoc != null && dropLoc.getBlock().getType().equals(Material.AIR)) {
            var mapIndication = fieldMap[startX][zIterator];
            if(mapIndication) {
              World.spawnFallingBlock(dropLoc, packageData);
            }
          }
          dropLoc = null;
        }
      });
      for(; startX <= endX; startX++) {
        for(zIterator = startZ; zIterator <= endZ; zIterator++) {
            Scheduler.runTask(__plugin, new DropTask());
        }
      }
    }
  }
}); // end
