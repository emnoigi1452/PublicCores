var Player = BukkitPlayer;
var MyItems = BukkitServer.getPluginManager().getPlugin("MyItems");

function main() {
  try {
    if(MyItems == null)
      throw "&fMáy chủ không có plugin &aMyItems! &fKhông thể sử dụng &bPlaceholder &fnày!"
    var PlayerStats = MyItems.getPlayerManager().getPlayerItemStatsManager();
    // Cú pháp placeholder: %javascript_mystats_<mục>,<loại>%
    switch(args[0].toLowerCase()) {
      case "weapon":
        var WeaponStats = PlayerStats.getItemStatsWeapon(Player);
        switch(args[1].toLowerCase()) {
          // Min damage: %javascript_mystats_weapon,damage-min%
          case "damage-min": return WeaponStats.getTotalDamageMin().toFixed(1);
          // Max damage: %javascript_mystats_weapon,damage-max%
          case "damage-max": return WeaponStats.getTotalDamageMax().toFixed(1);
          // Tỉ lệ xuyên giáp của người chơi: %javascript_mystats_weapon,penetration%
          case "penetration": return WeaponStats.getTotalPenetration().toFixed(1);
          // Sát thương gia tăng - PvP: %javascript_mystats_weapon,pvp-damage%
          case "pvp-damage": return (WeaponStats.getTotalPvPDamage()).toFixed(1);
          // Sát thương gia tăng - PvE: %javascript_mystats_weapon,pve-damage%
          case "pve-damage": return (WeaponStats.getTotalPvEDamage()).toFixed(1);
          // Phạm vi tấn công diện rộng: %javascript_mystats_weapon,aoe-radius%
          case "aoe-radius": return WeaponStats.getTotalAttackAoERadius().toFixed(1);
          // Sát thương diện rộng (So với tổng sát thương): %javascript_mystats_weapon,aoe-damage%
          case "aoe-damage": return WeaponStats.getTotalAttackAoEDamage().toFixed(1);
          // Tỉ lệ chí mạng: %javascript_mystats_weapon,crit-chance%
          case "crit-chance": return WeaponStats.getTotalCriticalChance().toFixed(1);
          // Sát thương chí mạng: %javascript_mystats_weapon,crit-damage%
          case "crit-damage": return WeaponStats.getTotalCriticalDamage().toFixed(1);
          // Tỉ lệ đánh trúng mục tiêu: %javascript_mystats_weapon,hit-rate%
          case "hit-rate": return (WeaponStats.getTotalHitRate()).toFixed(1);
          default: throw "&cLoại chỉ số không hợp lệ! Hãy thử lại!";
        }
      case "armor":
        var ArmorStats = PlayerStats.getItemStatsArmor(Player);
        switch(args[1].toLowerCase()) {
          // Tổng sức thủ của giáp: %javascript_mystats_armor_defense%
          case "defense": return ArmorStats.getTotalDefense().toFixed(1);
          // Sức thủ gia tăng - PvP: %javascript_mystats_armor_pvp-defense%
          case "pvp-defense": return (ArmorStats.getTotalPvPDefense()).toFixed(1);
          // Sức thủ gia tăng - PvE: %javascript_mystats_armor_pve-defense%
          case "pve-defense": return (ArmorStats.getTotalPvEDefense()).toFixed(1);
          // Sinh lực của giáp: %javascript_mystats_armor_health%
          case "health": return ArmorStats.getTotalHealth().toFixed(1);
          // Tỉ lệ chặn đòn tấn công: %javascript_mystats_armor_block-chance%
          case "block-chance": return ArmorStats.getTotalBlockRate().toFixed(1);
          // Tỉ lệ né đòn tấn công: %javascript_mystats_armor_dodge-rate%
          case "dodge-rate": return ArmorStats.getTotalDodgeRate().toFixed(1);
          default: throw "&cLoại chỉ số không hợp lệ! Hãy thử lại!";
        }
      default: throw "&fTùy chọn không hợp lệ. Chỉ được chọn &aWeapon&f, &aArmor&f!";
    }
  } catch(err) {
    return "&bMyStats &8&l| &cLỗi: &f" + err;
  } 
}
main();
