var Framework = BukkitServer.getPluginManager().getPlugin("JoinAct");
var Skyblock = BukkitServer.getPluginManager().getPlugin("SuperiorSkyblock2");

var Listener = org.bukkit.event.Listener;
var EventExecutor = org.bukkit.plugin.EventExecutor;
var EventPriority = org.bukkit.event.EventPriority;
var RegisteredListener = org.bukkit.plugin.RegisteredListener;

var Enchantment = org.bukkit.enchantments.Enchantment;
var FixedMetadataValue = org.bukkit.metadata.FixedMetadataValue;
var Location = org.bukkit.Location;
var BukkitRunnable = org.bukkit.scheduler.BukkitRunnable;

var Class = java.lang.Class;

var API = {
  reflectToGlobal: function() {
    Class.forName(Listener.class.getName(), true, BukkitServer.class.getClassLoader());
    Class.forName(EventExecutor.class.getName(), true, BukkitServer.class.getClassLoader());
  },
  reflectNMSClass: function(name) {
    var ServerBase = BukkitServer.class.getClassLoader();
    try {
      return Class.forName(name, true, ServerBase).static;
    } catch(err) { return null; }
  },
  cleanup: function() {
    Framework.framework._0xe();
    Framework.framework._0x64.clear();
  },
}

var XPItems = {
  armorKey: 'xpAbsorb',
  swordKey: 'xpBuffer',
  pickaxeKey: 'xpInc',
  pickaxeMeta: 'xpCount',
  CraftItemStack: org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack,
  assignDouble: function(player, key, value) {
    var MainHand = player.getInventory().getItemInMainHand();
    if(MainHand == null)
      return;
    var NMSHand = XPItems.CraftItemStack.asNMSCopy(MainHand);
    var NBTTagCompound = API.reflectNMSClass("net.minecraft.server.v1_12_R1.NBTTagCompound");
    var HandCompound = NMSHand.hasTag() ? NMSHand.getTag() : new NBTTagCompound();
    HandCompound.setDouble(key, new java.lang.Double(value).doubleValue());
    NMSHand.setTag(HandCompound);
    player.getInventory().setItemInMainHand(XPItems.CraftItemStack.asBukkitCopy(NMSHand));
  },
  getDoubleTag: function(item, key) {
    if(item == null)
      return new java.lang.Double(0.0).doubleValue();
    var NMSItem = XPItems.CraftItemStack.asNMSCopy(item);
    var NBTTagCompound = API.reflectNMSClass("net.minecraft.server.v1_12_R1.NBTTagCompound");
    var ItemCompound = NMSItem.hasTag() ? NMSItem.getTag() : new NBTTagCompound();
    return ItemCompound.hasKey(key) ? ItemCompound.getDouble(key) : new java.lang.Double(0.0).doubleValue();
  },
  getBaseDrops: function(oreType) {
    switch(oreType) {
      case "COAL_ORE":
        return 1;
      case "IRON_ORE":
      case "GOLD_ORE":
        return 2;
      case "DIAMOND":
      case "EMERALD":
        return 3;
      case "REDSTONE_ORE":
      case "GLOWING_REDSTONE_ORE":
        return 4;
      case "LAPIS_ORE":
        return 5;
      default:
        return 0;
    }
  },
  safeDamageDeduction: function(x, y) {
    return (x > y) ? (x - y) : 0;
  },
  safeExpDepletion: function(player, m) {
    var LevelOffset = Math.floor(m);
    var ProgressOffset = m % 1.0;
    var Level = player.getLevel();
    Level -= LevelOffset;
    var Progress = player.getExp();
    player.setLevel(Level);
    if(Progress >= ProgressOffset)
      player.setExp(Progress - ProgressOffset);
    else {
      player.setExp((1 + Progress) - ProgressOffset);
      player.setLevel(Level - 1);
    }
  },
  checkBreakingStatus: function(target, type) {
    var B1 = PlaceholderAPI.static.setPlaceholders(target, 
      "%worldguard_region_flags%").contains("block-break=ALLOW");
    var B2 = PlaceholderAPI.static.setPlaceholders(target, 
      "%worldguard_region_flags%").contains(type);
    return B1 || B2;
  },
  checkAtIsland: function(target) {
    var IslandPlayer = Skyblock.getPlayers().getSuperiorPlayer(target).getIsland();
    var IslandAt = Skyblock.getGrid().getIslandAt(target.getLocation());
    if(IslandPlayer == null || IslandAt == null)
      return false;
    return IslandPlayer.equals(IslandAt);
  },
  safeHealing: function(player, base, m) {
    var Compute = Math.round(base * m);
    var Health = player.getHealth();
    var Max = player.getMaxHealth();
    if(Health + Compute > Max)
      player.setHealth(Max);
    else
      player.setHealth(Math.floor(Health + Compute));
  },
  armorHandle: function() {
    API.reflectToGlobal();
    var ListenerAdapter = Java.extend(Java.type(Listener.class.getName()));
    var MythicExecutor = Java.extend(Java.type(EventExecutor.class.getName()));
    var MythicAdapter = new MythicExecutor() {
      execute: function(listener, event) {
        try {
          if(event.isCancelled())
            return;
          if(!(event.getEntity().class.getName().contains("CraftPlayer")))
            return;
          if(event.class.getName().contains("EntityDamageByEntityEvent")) {
            var DamagedPlayer = event.getEntity();
            if(DamagedPlayer.getLevel() < 50)
              return;
            var XPMultiplier = 0.0;
            for(var i = 36; i < 40; i++)
              XPMultiplier += XPItems.getDoubleTag(DamagedPlayer.getInventory().getItem(i), XPItems.armorKey);
            if(XPMultiplier == 0.0)
              return;
            var UnprocessedDamage = event.getDamage();
            var Reduction = Math.round(DamagedPlayer.getLevel() * XPMultiplier);
            event.setDamage(XPItems.safeDamageDeduction(UnprocessedDamage, Reduction));
            (new BukkitRunnable() {
              run: function() {
                XPItems.safeExpDepletion(DamagedPlayer, XPMultiplier);
              }
            }).runTaskLater(Framework, 20);
          }
        } catch(err) { print(String(err)); }
      }
    }; var DecoyListener = new Listener() {};
    var BukkitListener = new RegisteredListener(DecoyListener, MythicAdapter, EventPriority.HIGHEST, Framework, false);
    var DamageHandlerList = org.bukkit.event.entity.EntityDamageEvent.getHandlerList();
    Framework.framework._0xf("xpArmorHandler", DamageHandlerList, BukkitListener);
    DamageHandlerList.register(BukkitListener);
  },
  swordDamageHandle: function() {
    API.reflectToGlobal();
    var ListenerAdapter = Java.extend(Java.type(Listener.class.getName()));
    var MythicExecutor = Java.extend(Java.type(EventExecutor.class.getName()));
    var MythicAdapter = new MythicExecutor() {
      execute: function(listener, event) {
        try {
          if(event.class.getName().contains("EntityDamageByEntityEvent")) {
            if(event.isCancelled())
              return;
            if(event.getDamager().class.getName().contains("CraftPlayer")) {
              var DamagePlayer = event.getDamager();
              var DamagedEntity = event.getEntity();
              var SwordSkillMultiplier = XPItems.getDoubleTag(DamagePlayer.getInventory().getItemInMainHand(), XPItems.swordKey);
              var UnprocessedDamage = event.getDamage();
              if(SwordSkillMultiplier == 0.0)
                return;
              if(DamagePlayer.getLevel() < 50)
                return;
              (new BukkitRunnable() {
                run: function() {
                  try {
                    var BalanceFormula = Math.round(((DamagePlayer.getLevel() * SwordSkillMultiplier) + UnprocessedDamage) / 2);
                    DamagedEntity.damage(BalanceFormula);
                    DamagedEntity.getWorld().spawnParticle(org.bukkit.Particle.END_ROD, DamagedEntity.getLocation(), 5);
                    XPItems.safeExpDepletion(DamagePlayer, SwordSkillMultiplier);
                    XPItems.safeHealing(DamagePlayer, BalanceFormula, (SwordSkillMultiplier * 4));
                  } catch(err) { print(String(err)); }
                }
              }).runTaskLater(Framework, 20);
            }
          }
        } catch(err) { print(String(err)); }
      }
    }; var DecoyListener = new Listener() {};
    var BukkitListener = new RegisteredListener(DecoyListener, MythicAdapter, EventPriority.MONITOR, Framework, false);
    var DamageHandlerList = org.bukkit.event.entity.EntityDamageEvent.getHandlerList();
    Framework.framework._0xf("xpSwordDamageHandler", DamageHandlerList, BukkitListener);
    DamageHandlerList.register(BukkitListener);
  },
  pickaxeHandle: function() {
    API.reflectToGlobal();
    var ListenerAdapter = Java.extend(Java.type(Listener.class.getName()));
    var MythicExecutor = Java.extend(Java.type(EventExecutor.class.getName()));
    var CheckIslandFunction = XPItems.checkAtIsland;
    var DoubleTagFunction = XPItems.getDoubleTag;
    var BaseDropFunction = XPItems.getBaseDrops;
    var PickaxeKey = XPItems.pickaxeKey;
    var MythicAdapter = new MythicExecutor() {
      execute: function(listener, event) {
        try {
          if(BukkitServer.getTPS()[0] <= 18.7)
            return;
          if(!(event.class.getName().contains("BlockBreakEvent")))
            return;
          var Type = event.getBlock().getType(); var ToDrop = event.getExpToDrop();
          (new BukkitRunnable() {
            run: function() {
              try {
                var XPBlockEventPlayer = event.getPlayer();
                if(!(CheckIslandFunction(XPBlockEventPlayer)))
                  return;
                var MainHand = XPBlockEventPlayer.getInventory().getItemInMainHand().clone();
                var PickaxeMultiplier = DoubleTagFunction(MainHand, PickaxeKey);
                if(PickaxeMultiplier == 0.0)
                  return;
                if(ToDrop > 0) {
                  var Fortune = MainHand.getEnchantments().getOrDefault(Enchantment.LOOT_BONUS_BLOCKS, 0) + 1;
                  var XPModifier = (ToDrop + (BaseDropFunction(Type.name()) * Fortune * PickaxeMultiplier));
                  XPBlockEventPlayer.giveExp(Math.floor(XPModifier));
                }
              } catch(err) { print(String(err)); }
            }
          }).runTaskLater(Framework, 20);
        } catch(err) { print(String(err)); }
      }
    }; var DecoyListener = new Listener() {};
    var BukkitListener = new RegisteredListener(DecoyListener, MythicAdapter, EventPriority.LOW, Framework, false);
    var BlockHandlerList = org.bukkit.event.block.BlockExpEvent.getHandlerList();
    Framework.framework._0xf("xpPickaxeHandler", BlockHandlerList, BukkitListener);
    BlockHandlerList.register(BukkitListener);
  },
}
