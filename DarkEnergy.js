// PlaceholderAPI imports - Server, Player
var Player = BukkitPlayer;
var Server = BukkitServer;
var Console = Server.getConsoleSender();

// Other spigot classes, imported from SpigotAPI 1.12.2
var ChatColor = org.bukkit.ChatColor;
var Particle = org.bukkit.Particle;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;

// Java classes, imported from the NashornAPI
var ArrayList = Java.type("java.util.ArrayList");

var x_array = [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52];
var z_array = [1050, 1051, 1052, 1053, 1054, 1055, 1056, 1057, 1058];

function not_in_pvp(player) {
  if(player.getWorld().getName() != "world") return true;
  var region = "worldguard_region_name"; var loc = player.getLocation();
  if(PlaceholderAPI.static.setPlaceholders(player, "%" + region + "%") != "pvp")
    return true;
  else {
    var x = loc.getBlockX(); var z = loc.getBlockZ();
    return x_array.indexOf(x) != -1 && z_array.indexOf(z) != -1;
  }
}

function setup_damage(inventory) {
  var armor_slots = inventory.getArmorContents(); var damage = 0;
  for each(var slot in armor_slots) {
    if(slot != null && slot.hasItemMeta()) {
      var meta = slot.getItemMeta();
      if(meta.hasLore()) {
        var lore = meta.getLore();
        meta: for each(var line in lore) {
          if(ChatColor.stripColor(line).startsWith("[Sức thủ] ✎")) {
            var format_line = ChatColor.stripColor(line);
            var value = parseInt(format_line.substring(12));
            damage += value; break meta;
          }
        }
      }
    }
  } return damage;
}

function is_galactic(entity) {
  var valids = ["Mũ Asteroid", "Giáp Asteroid", "Quần Asteroid", "Giày Asteroid",
                "Nón Galaxy", "Áo Galaxy", "Quần Galaxy", "Giày Galaxy"];
  var inventory = entity.getInventory(); var armor = inventory.getArmorContents();
  for each(var item in armor) {
    if(item != null && item.hasItemMeta()) {
      var item_meta = item.getItemMeta();
      var name = item_meta.hasDisplayName() ? item_meta.getDisplayName() : "null";
      for(var names in valids) {
        if(ChatColor.stripColor(name).contains(names))
          return true;
      }
    }
  } return false;
} 

function main() {
  try {
    if(is_galactic(Player)) {
      Server.dispatchCommand(Console, "smite " + Player.getName() + " " + (setup_damage).toString());
      return "&5Dark &8&l| &c&oNgươi đâu thể tự làm hại đồng loại của mình?...Nhỉ?...";
    }
    var dmg = setup_damage(Player.getInventory()); var victims = new ArrayList();
    for each(var member in Server.getOnlinePlayers()) {
      if(member.getWorld().getName() == Player.getWorld().getName()) {
        var loc1 = member.getLocation();
        var loc2 = Player.getLocation();
        if(loc1.distance(loc2) < 25) {
          if(!not_in_pvp(member)) {
            if(is_galactic(member))
              victims.add(member);
          }
        }
      }
    } victims.remove(Player);
    for each(var i in victims) {
      i.damage(Math.floor(dmg*(i.getMaxHealth()/100)));
      i.spawnParticle(Particle.END_ROD, i.getEyeLocation().clone().subtract(0,0.25,0), 25);
      var wither = new PotionEffect(PotionEffectType.WITHER, 100, 5);
      var chance = Math.floor(Math.random() * 2) + 1;
      if(chance == 2) wither.apply(i);
      i.sendMessage(ChatColor.translateAlternateColorCodes('&',
        "&5Dark &8&l| &7&oHãy tận hưởng nỗi đau mà bấy lâu nay bọn ta phải chịu đựng..."));
    }
    Player.setHealth(Math.floor(Player.getMaxHealth() / 2));
    return "&5Dark &8&l| &7&oNhiệm vụ của ta đã hoàn thành...chúng ta sẽ còn gặp lại...";
  } catch(err) {
    return err.message;
  }
}
main();
