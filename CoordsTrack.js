var Factions = BukkitServer.getPluginManager().getPlugin("Factions");
var Essentials = BukkitServer.getPluginManager().getPlugin("Essentials");

var FileReader = Java.type("java.io.FileReader");
var JSONParser = org.json.simple.parser.JSONParser;
var ChatColor = org.bukkit.ChatColor; var key = 'translateAlternateColorCodes';

function main() {
  try {
    // Factions handler: Track down via home
    var FacName = args[1]; var PlayerName = args[2]; var Id;
    if(BukkitServer.getPlayer(PlayerName))
      throw "Người chơi không trực tuyến!";
    if(Factions == null)
      throw "Máy chủ không có &aFactions&f!";
    else {
      var Database = Factions.getDataFolder().getAbsolutePath() + "\\data\\";
      var JSONSource = new FileReader(Database + "factions.json");
      var ChunkBoard = new FileReader(Database + "board.json");
      var HashObject = new JSONParser().parse(JSONSource);
      for each(var hashKey in HashObject.keySet()) {
        if(HashObject.get(hashKey).get("tag") == FacName) {
          Id = hashKey; break;
        } else continue;
      }
      if(HashObject.get(Id).containsKey("home")) {
        var HomeLoc = HashObject.get(Id).get("home");
        var x = HomeLoc.get('x'); var y = HomeLoc.get('y'); var z = HomeLoc.get('z');
        var format = "&eScript &8&l| &fĐã tìm thấy nhà của &a" + FacName.concat('\n');
        format += "&f &f &f- x: &a" + x.toString().concat('\n');
        format += "&f &f &f- y: &a" + y.toString().concat('\n');
        format += "&f &f &f- z: &a" + z;
        BukkitPlayer.sendMessage(ChatColor[key]('&', format));
      } else {
        var Board = new JSONParser().parse(new FileReader(ChunkBoard)).get("Survival");
        var Chunks = new java.util.ArrayList();
        for each(var loadedChunk in Board.keySet()) {
          if(Board.get(loadedChunk) == Id)
            Chunks.add(loadedChunk);
          else continue;
        }
        var chunkAnnounce = "&eScript &8&l| &fĐã tìm thấy các chunk claim bởi &a" + FacName.concat("\n");
        for each(var ChunkArray in Chunks) {
          var x = parseInt(ChunkArray.get(0));
          var z = parseInt(ChunkArray.get(0));
          x *= 16; z *= 16;
          chunkAnnounce += ("x: " + x + " z: " + z);
          chunkAnnounce.concat('\n');
        }
        BukkitPlayer.sendMessage(ChatColor[key]('&', chunkAnnounce));
      }
    }
    if(Essentials == null)
      throw "&fMáy chủ không có &aEssentials&f!";
    else {
      var User = Essentials.getUserMap().getUser(PlayerName);
      var PresetHomes = User.getHomes();
      if(PresetHomes.isEmpty())
        BukkitPlayer.sendMessage(ChatColor[key]('&', "&eScript &8&l| &cLỗi: &fNó vô gia cư!"));
      else {
        var list = "&eScript &8&l| &fĐã tìm thấy nhà của &a" + PlayerName.concat("\n");
        for each(var homeId in PresetHomes) {
          var HouseLocation = User.getHome(homeId);
          var houseX = HouseLocation.getBlockX();
          var houseY = HouseLocation.getBlockY();
          var houseZ = HouseLocation.getBlockZ();
          list += ('&f &f &a' + homeId + '&f: ' + houseX + ' ' + houseY + ' ' + houseZ);
          list.concat('------------------------------\n');
        }
        BukkitPlayer.sendMessage(ChatColor[key]('&', list));
      }
    }; return -1;
  } catch(err) {
    return "&eScript &8&l| &cLỗi: &f" + err.message;
  }
}
