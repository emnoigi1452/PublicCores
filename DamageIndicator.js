/* Dependencies: ProtocolLib, SealWatch
 */

var Player = BukkitPlayer;
var Server = BukkitServer;
var Host = Server.getPluginManager().getPlugin("PlaceholderAPI");

var API = {
  getVersion: function() {
    return Server.class.getName().split(".")[3];
  },
  getClassObject: function() {
    return ((Player.class).class).static;
  },
  getSystemClassLoader: function() {
    return ((API.getClassObject().forName("java.lang.ClassLoader")).static).getSystemClassLoader();
  },
  getJavaClass: function(name) {
    try {
      return API.getClassObject().forName(name, true, API.getSystemClassLoader()).static;
    } catch(err) { return null; }
  },
  getInternalClass: function(route, name) {
    var Loader = Server.class.getClassLoader();
    try {
      return (API.getClassObject().forName(route.concat(name), true, Loader)).static;
    } catch(err) { return null; }
  },
  getNMSClass: function(name) {
    return API.getInternalClass("net.minecraft.", name);
  },
  getBukkitClass: function(name) {
    return API.getInternalClass("org.bukkit.", name);
  },
  getCraftBukkitClass: function(name) {
    var Route = "org.bukkit.craftbukkit." + API.getVersion().concat(".");
    return API.getInternalClass(Route, name);
  },
  getPluginClass: function(pluginName, className) {
    var PluginLoader = Server.getPluginManager().getPlugin(pluginName).class.getClassLoader();
    try {
      return (API.getClassObject()).forName(className, true, PluginLoader).static;
    } catch(err) { print(String(err)); return null; }
  },
}

var Packet = {
  getClass: function(name) {
    return API.getPluginClass("ProtocolLib", name);
  },
  getProtocolManager: function() {
    return Packet.getClass("com.comphenix.protocol.ProtocolLibrary").getProtocolManager();
  },
  formatPacketParameter: function(packetTypes) {
    if(packetTypes.length == 0)
      return;
    var Array = API.getJavaClass("java.lang.reflect.Array");
    var Packets = Array.newInstance(packetTypes[0].class, packetTypes.length);
    for(var x = 0; x < packetTypes.length; x++)
      Packets[x] = packetTypes[x];
    return Packets;
  },
  blockParticles: function() {
    var PacketAdapter = Packet.getClass("com.comphenix.protocol.events.PacketAdapter");
    var ListenerPriority = Packet.getClass("com.comphenix.protocol.events.ListenerPriority");
    var PacketType = Packet.getClass("com.comphenix.protocol.PacketType");
    var Particle = API.getBukkitClass("Particle");
    var PacketParam = Packet.formatPacketParameter([PacketType.Play.Server.WORLD_PARTICLES]);
    var Adapter = (new PacketAdapter(Host, ListenerPriority.NORMAL, PacketParam) {
      onPacketSending: function(event) {
        if(event.getPacketType() != PacketType.Play.Server.WORLD_PARTICLES)
          return;
        var Packet = event.getPacket();
        if(Packet.getNewParticles().read(0).getParticle() == Particle.DAMAGE_INDICATOR)
          event.setCancelled(true);
      }
    });
    Packet.getProtocolManager().addPacketListener(Adapter);
  },
  clean: function() {
    Packet.getProtocolManager().removePacketListeners(Host);
  }
}

var Play = {
  checkDmg: function() {
    var SealAPI = Server.getPluginManager().getPlugin("SealWatch");
    var EntityDamageEvent = API.getBukkitClass("event.entity.EntityDamageEvent");
    var Location = API.getBukkitClass("Location");
    var Wrapper = SealAPI.toolbox.createWrapper(function(e) {
      var Damager = e.getDamager();
      if((!(Damager.class.getName().contains("CraftPlayer"))) || (!(e.getCause().equals(EntityDamageEvent.DamageCause.ENTITY_ATTACK))))
        return;
      var E1 = Damager.getLocation().clone();
      var E2 = e.getEntity().getLocation().clone();
      var X = (E1.getX() + E2.getX()) / 2;
      var Y = (E1.getY() + E2.getY()) / 2;
      var Z = (E1.getZ() + E2.getZ()) / 2;
      var Hologram = new Location(Damager.getWorld(), X, Y, Z);
      Hologram.setY(Hologram.getY()+1.2);
      Play.cloud(Hologram, e.getFinalDamage());
    }, false);
    SealAPI.getHandlers().registerEvent(API.getBukkitClass("event.entity.EntityDamageByEntityEvent").class, "damage", Wrapper);
  },
  clean: function() {
    var SealAPI = Server.getPluginManager().getPlugin("SealWatch");
    SealAPI.getHandlers().unregisterAll(API.getBukkitClass("event.entity.EntityDamageByEntityEvent").class);
  },
  cloud: function(loc, val) {
    var EntityType = API.getBukkitClass("entity.EntityType");
    var BukkitRunnable = API.getBukkitClass("scheduler.BukkitRunnable");
    var Location = API.getBukkitClass("Location");
    var Color = "&";
    if(val >= 100)
      Color += "5";
    else if(val >= 60)
      Color += "4";
    else if(val >= 30)
      Color += "c";
    else if(val >= 15)
      Color += "6";
    else if(val >= 5)
      Color += "e";
    else
      Color += "a";
    var Optional = new Location(loc.getWorld(), 256, 256, 256);
    var Cloud = loc.getWorld().spawnEntity(Optional, EntityType.AREA_EFFECT_CLOUD);
    Cloud.setRadius(0); Cloud.setRadiusOnUse(0); Cloud.setWaitTime(0);
    Cloud.setDuration(20); Cloud.setDurationOnUse(0);
    Cloud.setRadiusPerTick(0); Cloud.setReapplicationDelay(0);
    Cloud.setCustomNameVisible(true); Cloud.getBoundingBox().expand(-1);
    Cloud.setCustomName(API.getBukkitClass("ChatColor").translateAlternateColorCodes('&', Color + "&l" + val.toFixed(1)));
    Cloud.teleport(loc);
  }
}
