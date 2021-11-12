/* Dependency: ScriptCraft
   Version: 0.1
*/

var Server = __plugin.getServer();
var Scheduler = Server.getScheduler();

var Runnable = Java.type("java.lang.Runnable");
var HashSet = Java.type("java.util.HashSet");
var ItemStack = org.bukkit.inventory.ItemStack;
var ChatColor = org.bukkit.ChatColor;
var Location = org.bukkit.Location;
var Material = org.bukkit.Material;

// Enchantment handler: Where all the essential functions are called from
var ShowerManager = {
  // Enchantment limit
  showerMax: 500,
  // Check the enchantment level
  getLevel: function(player) {
    // Check if hand has an item or not
    var hand = player.getInventory().getItemInMainHand();
    if(hand == null) return -1;
    // Gets item lore, iterate through each line to find the level
    var lore = hand.getItemMeta().getLore(); var level = -1;
    for each(var line in lore) {
      // Remove color codes to begin pattern matching
      var clear = ChatColor.stripColor(line);
      // Regex pattern for lore to indicate the enchant's existence
      var pattern = /Shower \d{3}/g
      if(line.search(pattern) != -1) {
        // Substring that contains the level in the string form
        var from = line.search(pattern) + 7
        var to = line.charAt(from+2) == " " ? 1 : 2;
        // Parse level from string to int, than break the loop
        level = parseInt(line.substring(from, to));
        break;
      } else continue;
    }
    return level > this.showerMax ? this.showerMax : level;
  },
  generationProbability: function(level) {
    return Math.floor(level / 1000);
  },
  // Blocks that are counted by the enchantments
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
  // Printing out the 2d map responsible for determining where to drop the block
  initMap: function(board, rate, x1, x2, z1, z2) {
    var xPath = x1; var zPath;
    // Iterate through each slot
    for(; xPath <= x2; xPath++) {
      for(zPath = z1; z1 <= z2; zPath++) {
        // Randomizer decides if n <= rate (%)
        var random = Math.floor(Math.random() * 100) + 1;
        // True: Block will be drop, False: Block will be skipped
        if(random <= rate) board[xPath][zPath] = true;
        else board[xPath][zPath] = false;
      }
    }; /* Return formatted board */ return board;
  }
};

// Main code: The event handler that handles all block interaction
events.blockBreak(function(e) {
  var Executor = e.player; var World = Executor.getWorld();
  if(ShowerManager.getLevel(Executor) != -1) {
    var generation = ShowerManager.generationProbability(Shower.getLevel(Executor));
    // Check if mined block is counted by the enchantment
    var type = e.getBlock().getType();
    var AllowedTypes = ShowerManager.validCollection();
    if(AllowedTypes.contains(type)) {
      if(type.equals(Material.GLOWING_REDSTONE_ORE))
        type = Material.REDSTONE_ORE
      // Drop info: The data of the block dropped, the location (set to null)
      var packageData = new ItemStack(type, 1).getData(); var dropLoc;
      // Preparing the 2d map of drop area
      var startPoint = Executor.getLocation(); var generationBoard = [][];
      var startX = startPoint.getBlockX() + 100; var endX = startPoint.getBlockX() - 100;
      var startZ = startPoint.getBlockZ() + 100; var endZ = startPoint.getBlockZ() - 100;
      var fieldMap = ShowerManager.initMap(generationBoard, generation, startX, endX, startZ, endZ);
      var dropHeight = Math.floor(startPoint.getBlockY() + 50); var zIterator;
      // The task of dropping the block from the sky
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
      // Iterate through 2d map, scheduling each block-drop
      for(; startX <= endX; startX++) {
        for(zIterator = startZ; zIterator <= endZ; zIterator++) {
            Scheduler.runTask(__plugin, new DropTask());
        }
      }
    }
  }
}); // end
