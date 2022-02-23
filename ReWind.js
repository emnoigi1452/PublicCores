var Executor = BukkitPlayer;
var Server = BukkitServer;
var Scheduler = Server.getScheduler();
var Manager = Server.getPluginManager();
var MyItems = Manager.getPlugin("MyItems");
var Host = Manager.getPlugin("PlaceholderAPI");
var DataFile = "ReWind.yml";
var MyItemsCommandKey = "Re-Wind";
var MaxLevel = 30;

var ChatColor = org.bukkit.ChatColor;
var Command = 'translateAlternateColorCodes';
var CraftItemStack = org.bukkit.craftbukkit.v1_12_R1.inventory.CraftItemStack;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var Location = org.bukkit.Location;
var Attribute = org.bukkit.attribute.Attribute;
var PotionEffect = org.bukkit.potion.PotionEffect;
var PotionEffectType = org.bukkit.potion.PotionEffectType;
var Particle = org.bukkit.Particle;
var Vector = org.bukkit.util.Vector;

var ArrayList = Java.type("java.util.ArrayList");
var HashMap = Java.type("java.util.HashMap");
var File = Java.type("java.io.File");
var Runnable = Java.type("java.lang.Runnable");
var System = Java.type("java.lang.System");

var SkillMessage = {
  prefix: '&5Re&f:&bWind &8&l|',
  throwMessage: function(key) {
    return ChatColor[Command]('&', this[key]);
  },
  getMessage: function(key) {
    return ChatColor[Command]('&', prefix.concat(" &f") + this[key]);
  },
  getError: function(key) {
    return ChatColor[Command]('&', prefix.concat(" &cLỗi: &f") + this[key]);
  },
  notEnoughPlugins: '&fMáy chủ của bạn có thể đang thiếu &aMyItems&f!',
  invalidItem: '&fKhông thể triển khai phép với vật phẩm này...',
  notInCombat: '&fChỉ có thể triển khai phép tại khu vực PvP!',
  messageDead: '&f&oHiện thực dần dần tan biến...sự tồn tại của ngươi đã bị xóa sổ...',
  messageAffected: '&f&oMọi thứ dần tan biến vào bóng tối sâu thẳm...',
  finishSkill: '&f&oHiện thực đúng là tàn nhẫn...&c&ota nói đúng không&f&o..?'
}

var ReWindControl = {
  checkTagStatus: function(input) {
    var NMSItemStack = CraftItemStack.asNMSCopy(input);
    if(!NMSItemStack.hasTag()) return false;
    else {
      var TagValue = NMSItemStack.getTag().getBoolean("ReWindStatus");
      return TagValue == null ? false : TagValue;
    }
    return false;
  },
  isPvPRegion: function(player) {
    var keyHolder = "worldguard_region_name";
    return PlaceholderAPI.static.setPlaceholders(
      player, "%" + keyHolder + "%") == "pvp";
  },
  collectPvPMembers: function(radius) {
    var ServerMembers = Server.getOnlinePlayers();
    var Selector = new ArrayList();
    ServerMembers.stream().filter(function(user) {
      return this.isPvPRegion(user);
    }).forEach(function(match) { Selector.add(match); });
    return Selector;
  },
  outputDamage: function(weapon, armor) {
    var BaseDmg = Math.floor(weapon.getTotalDamage() * (1 + (weapon.getTotalPvPDamage()/100)));
    var Penetration = weapon.getTotalPenetration(); var Hit = weapon.getTotalHitRate();
    var BaseDefense = Math.floor(armor.getTotalDefense() * (1 + ((weapon.getTotalPvPDefense()+weapon.getTotalPvEDefense)/100)));
    var CounterAbility = parseInt(armor.getTotalBlockRate() + (armor.getTotalDodgeRate() * 2));
    return (Penetration + Hit) > CounterAbility ? BaseDmg : Math.floor(BaseDmg - (BaseDefense / 2));
  }
}

function main() {
  try {
    var Database = new File(Host.getDataFolder(), DataFile); var Configuration;
    if(!DataCenter.exists())
      Database.createNewFile();
    var Configuration = YamlConfiguration.loadConfiguration(Database);
    Configuration.set("version", 0.1); Configuration.save(Database);
    if(MyItems == null)
      throw SkillMessage.throwMessage("notEnoughPlugins");
    if(!ReWindControl.checkTagStatus(Executor.getInventory().getItemInMainHand())) {
      Executor.sendMessage(SkillMessage.getError("invalidItem"));
    } else {
      var PlayerManager = MyItems.getPlayerManager();
      if(!ReWindControl.isPvPRegion(Executor)) {
        Executor.sendMessage(SkillMessage.getError("notInCombat"));
        var CooldownControl = PlayerManager.getPlayerPowerManager(
          Executor).getPlayerPowerCooldown();
        CooldownControl.removePowerCommandCooldown(MyItemsSkillKey);
      } else {
        var UID = Executor.getUniqueId().toString();
        if(!Configuration.getKeys(false).contains(UID)) {
          Configuration.set(UID.concat(".Radius"), 10);
          Configuration.set(UID.concat(".EXP", 0));
        }
        var SkillMastery = Configuration.get(UID.concat(".Radius"));
        var MembersInCombat = ReWindControl.collectPvPMembers(SkillMastery);
        var SkillTask = Java.extend(Runnable, {
          run: function() {
            var Kills = 0; var Damage = 0; var Strength = StatsManager.getItemStatsWeapon(Executor);
            var StatsManager = PlayerManager.getPlayerItemStatsManager();
            MembersInCombat.stream().forEach(function(victim) {
              var DefenseAbility = StatsManager.getItemStatsDefense(victim);
              var Force = 100 - Math.floor((MaxLevel - SkillMastery) * 3);
              var DamageCtrl = Math.floor(ReWindControl.outputDamage(Strength, DefenseAbility)*(Force/100));
              victim.spawnParticle(Particle.EXPLOSION_NORMAL, victim.getLocation(), 1);
              victim.setVelocity(new Vector(0, 5, 0));
              if(DamageCtrl > victim.getHealth()) {
                Damage += victim.getHealth(); Kills++;
                victim.setHealth(0);
                victim.sendMessage(SkillMessage.getMessage("messageDead"));
              } else {
                var Blind = new PotionEffect(PotionEffectType.BLINDNESS, 300, 5);
                var Slow = new PotionEffect(PotionEffectType.SLOWNESS, 300, 10);
                var Weak = new PotionEffect(PotionEffectType.WEAKNESS, 300, 10);
                var Wither = new PotionEffect(PotionEffectType.WITHER, 300, 5);
                Damage += DamageCtrl; victim.setHealth(victim.getHealth() - DamageCtrl);
                victim.apply(Blind); victim.apply(Slow); victim.apply(Weak); victim.apply(Wither);
                victim.sendMessage(SkillMessage.getMessage("messageAffected"));
              }
            });
            var CalculateEXP = function(param) {
              return Math.floor(Math.sqrt((param*param*param)*Math.PI)) + (param-1);
            }
            var EXP = Configuration.get(UID.concat(".EXP")) + Kills;
            if(EXP > CalculateEXP(SkillMastery+1)) {
              EXP = EXP % CalculateEXP(SkillMastery+1);
              Configuration.set(UID.concat(".Radius", SkillMastery+1));
              Configuration.set(UID.concat(".EXP", EXP));
            }
            Configuration.save(Database);
            Executor.sendMessage(SkillMessage.getMessage("finishSkill"));
            Executor.setMaxHealth(Executor.getMaxHealth() + Damage);
            Executor.setHealth(Math.floor(Executor.getMaxHealth() / 4));
          }
        }); Scheduler.runTaskLater(Host, new SkillTask(), new java.lang.Long(20)); return 0;
      }
    }
    return -1;
  } catch(err) {
    return "&5Re&f:&bWind &8&l| &cLỗi: &f" + err.message;
  }
}
