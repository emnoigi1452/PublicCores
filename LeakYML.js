var PluginPath; /* "Path to server's plugin folder" */
var Files = java.nio.file.Files;
var ZipInputStream = java.util.zip.ZipInputStream;
var ZipFile = java.util.zip.ZipFile;
var File = java.io.File;
var FileInputStream = java.io.FileInputStream;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;

function main() {
  try {
    var pluginFile = new File(PluginPath, args[0]);
    if(!pluginFile.exists())
      throw "&cLỗi: &fPlugin không hợp lệ!";
    else {
      var jarStream = new FileInputStream(pluginFile);
      var zipStream = new ZipInputStream(jarStream);
      var zippedJar = new ZipFile(pluginFile); var entry;
      while(true) {
        entry = zipStream.getNextEntry();
        if(entry.getName() == "plugin.yml")
          break;
      }
      var inputUnzipped = zippedJar.getInputStream(entry);
      var TempOutput = new File(/* Path to temp file */);
      if(TempOutput.exists()) {
        TempOutput.delete();
        Player.sendMessage("Ghi chú: Một tệp tin đã bị xóa để thay thế!");
      }
      Files.copy(inputUnzipped, TempOutput.toPath());
      var ymlConfig = YamlConfiguration.loadConfiguration(TempOutput);
      return ymlConfig.saveToString();
    }
  } catch(err) {
    return "&eLeak &8&l| &f" + err.name;
  }
}
main();
