/* Section - Project note
 *   + Name: Lunatic Trancer
 *   + Language: CommonJS
 *   + Implementation: Entity, Players
 *
 * Section: Prototype, source description
 *   + Source: "A rare skill that allows the user to fight in a Berserk state, 
 *   ignoring heart rate function, strength, and gravity."
 *   + Further explanation: "Users can't differenciate friends from foes"
 * 
 * Section: Into minecraft
 *   + Ignore - Heart rate: No delay in activation time.
 *   + Ignore - Speed: Instantly teleports to nearest enemy.
 *   + Ignore - Gravity: Launch target upwards, and lock them in place.
 *   + No differences: Every entity in vicinity, including one's own pet.
 */

var Executor = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Host = Manager.getPlugin("PlaceholderAPI");
var MyItems = Manager.getPlugin("MyItems");
var Skyblock = Manager.getPlugin("SuperiorSkyblock2");

var ChatColor = org.bukkit.ChatColor;
var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
var Material = org.bukkit.Material;
var Location = org.bukkit.Location;

var Runnable = Java.type("java.lang.Runnable");
var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");

var LunaticUtils = {
  // Object that controls some function of the main core
}

function main() {
  try {
    // Begin of skill
  } catch(err) {
    return "&5Lunatic &8&l| &c&oLỗi&f: " + err.message;
  }
}

// Execution
main();
