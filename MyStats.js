var Player = BukkitPlayer;
var MyItems = BukkitServer.getPluginManager().getPlugin("MyItems");
var Host = BukkitServer.getPluginManager().getPlugin("PlaceholderAPI");

function main() {
  try {
    if(MyItems == null)
      throw "&fMáy chủ không có plugin &aMyItems! &fKhông thể sử dụng &bPlaceholder &fnày!"
    var PlayerStats = MyItems.getGameManager().getStatsManager();
    if(args.length != 2) throw "&fSố lượng tùy chọn trong lệnh không hợp lệ!";
    // Cú pháp placeholder: %javascript_mystats_<mục>,<loại>%
    switch(args[0].toLowerCase()) {
      case "weapon":
        var WeaponStats = PlayerStats.getLoreStatsWeapon(Player);
        switch(args[1].toLowerCase()) {
          // Tổng sát thương của người chơi: %javascript_mystats_weapon,damage%
          case "damage": return WeaponStats.getDamage().toFixed(2);
          // Tỉ lệ xuyên giáp của người chơi: %javascript_mystats_weapon,penetration%
          case "penetration": return WeaponStats.getPenetration().toFixed(2);
          // Sát thương gia tăng - PvP: %javascript_mystats_weapon,pvpdamage%
          case "pvpdamage": return WeaponStats.getPvPDamage().toFixed(2);
          // Sát thương gia tăng - PvE: %javascript_mystats_weapon,pvedamage%
          case "pvedamage": return WeaponStats.getPvEDamage().toFixed(2);
          // Phạm vi tấn công diện rộng: %javascript_mystats_weapon,aoeradius%
          case "aoeradius": return WeaponStats.getAttackAoERadius().toFixed(2);
          // Sát thương diện rộng (So với tổng sát thương): %javascript_mystats_weapon,aoedamage%
          case "aoedamage": return WeaponStats.getAttackAoEDamage().toFixed(2);
          // Tỉ lệ chí mạng: %javascript_mystats_weapon,critchance%
          case "critchance": return WeaponStats.getCriticalChance().toFixed(2);
          // Sát thương chí mạng: %javascript_mystats_weapon,critdamage%
          case "critdamage": return WeaponStats.getCriticalDamage().toFixed(2);
          // Tỉ lệ đánh trúng mục tiêu: %javascript_mystats_weapon,hitrate%
          case "hitrate": return WeaponStats.getHitRate().toFixed(2);
          default: throw "&cLoại chỉ số không hợp lệ! Hãy thử lại!";
        }
      case "armor":
        var ArmorStats = PlayerStats.getLoreStatsArmor(Player);
        switch(args[1].toLowerCase()) {
          // Tổng sức thủ của giáp: %javascript_mystats_armor_defense%
          case "defense": return ArmorStats.getDefense().toFixed(2);
          // Sức thủ gia tăng - PvP: %javascript_mystats_armor_pvpdefense%
          case "pvpdefense": return ArmorStats.getPvPDefense().toFixed(2);
          // Sức thủ gia tăng - PvE: %javascript_mystats_armor_pvedefense%
          case "pvedefense": return ArmorStats.getPvEDefense().toFixed(2);
          // Sinh lực của giáp: %javascript_mystats_armor_health%
          case "health": return ArmorStats.getHealth().toFixed(2);
          // Tỉ lệ chặn đòn tấn công: %javascript_mystats_armor_blockchance%
          case "blockchance": return ArmorStats.getBlockChance().toFixed(2);
          // Số lần bị tấn công có thể chặn: %javascript_mystats_armor_blockamount%
          case "blockamount": return ArmorStats.getBlockAmount().toFixed(2);
          // Tỉ lệ né đòn tấn công: %javascript_mystats_armor_dodgerate%
          case "dodgerate": return ArmorStats.getDodgeRate().toFixed(2);
          default: throw "&cLoại chỉ số không hợp lệ! Hãy thử lại!";
        }
      default: throw "&fTùy chọn không hợp lệ. Chỉ được chọn &aWeapon&f, &aArmor&f!";
    }
  } catch(err) {
    return "&bMyStats &8&l| &cLỗi: &f" + err.message;
  }
}
