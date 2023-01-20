var Player = BukkitPlayer;
var Server = BukkitServer;
var Manager = Server.getPluginManager();
var Scheduler = Server.getScheduler();
var Host = Manager.getPlugin("PlaceholderAPI");

var URL = java.net.URL;
var BufferedReader = java.io.BufferedReader;
var PrintWriter = java.io.PrintWriter;
var File = java.io.File;
var InputStreamReader = java.io.InputStreamReader;
var StandardCharsets = java.nio.charset.StandardCharsets;
var JSONParser = org.json.simple.parser.JSONParser;
var YamlConfiguration = org.bukkit.configuration.file.YamlConfiguration;
var ByteStreams = com.google.common.io.ByteStreams;
var JSONObject = org.json.simple.JSONObject;
var JSONArray = org.json.simple.JSONArray;

var System = java.lang.System;
var Long = java.lang.Long;
var JavaString = java.lang.String;
var Runnable = java.lang.Runnable;
var ArrayList = java.util.ArrayList;
var SecureRandom = java.security.SecureRandom;
var SimpleDateFormat = java.text.SimpleDateFormat;
var Calendar = java.util.Calendar;
var Thread = java.lang.Thread;

var ChatColor = org.bukkit.ChatColor;
var WAIT = 65000;
var Module = new SecureRandom();

// Chế độ bảo trì khi xảy ra lỗi đặc biệt nghiêm trọng
var MAINTENANCE = false;
 
// Danh sách quản trị viên nhận thông báo (Phạm vi - BungeeCord)
var Staff = [
  'MyStaffMember',
  'MyOtherStaffMember'
];

// Danh sách những người nhận thông tin debug khi gặp lỗi
var Developers = [
  'MyDeveloper',
  'MyOtherDeveloper'
];

// Đá người chơi về Lobby khi IP bị flag
var KickLobby = false;

var API = {
  DIR: 'http://ip-api.com/json/{address}?fields=17023515',
  REQ_KEY: 'Request@Wait',
  Q_KEY: 'Request@Count',
  // Giới hạn request API (45 request/phút)
  LIM_KEY: 40,
  request: function(ip) {
    var RequestURL = new URL(API.DIR.replace("{address}", ip));
    var Connection = RequestURL.openConnection();
    var Reader = new BufferedReader(new InputStreamReader(Connection.getInputStream()));
    var Byte; var Content = "";
    while((Byte = Reader.readLine()) != null)
      Content = Content.concat(Byte);
    return (new JSONParser()).parse(Content);
  },
  check: function(name, ip) {
    var Task = Java.extend(Runnable, {
      run: function() {
        try {
          var Runtime = API.wait();
          if(Runtime > 0)
            Thread.sleep(Runtime + 500);
          if(System.currentTimeMillis() > Long.valueOf(System.getProperty(API.REQ_KEY)) + WAIT) {
            System.setProperty(API.REQ_KEY, String(System.currentTimeMillis()))
            System.setProperty(API.Q_KEY, String(1));
          }
          var Response = API.request(ip);
          System.setProperty(API.Q_KEY, String(parseInt(System.getProperty(API.Q_KEY))+1));
          var Code = Response.get("regionName") + ", " + Response.get("country");
          if(Response.get("status") == "fail") {
            Helper.notifyFail(name);
            var ErrorPayload = Discord.buildJSONFailWebhook(name, Response.get("message"));
            Discord.sendJSONWeebhook(ErrorPayload);
            if(KickLobby)
              Helper.lobby(name);
            return;
          }
          if((Response.get("countryCode") != "VN") || (Response.get("hosting")) || (Response.get("proxy"))) {
            Helper.performStaffWarn(name, Code);
            if(!(API.present(ip))) {
              var JSONPayload = Discord.buildJSONInfoWebhook(name, Response);
              Discord.sendJSONWeebhook(JSONPayload); API.write(ip);
            }
            if(KickLobby)
              Helper.lobby(name);
          }
        } catch(err) {
          if(Developers.indexOf(Player.getName()) != -1)
            BukkitPlayer.sendMessage(err.toString());
          Helper.logError(err);
        }
      }
    }); Scheduler.runTaskAsynchronously(Host, new Task());
  },
  wait: function() {
    var Count = System.getProperty(API.Q_KEY);
    var Backup = System.getProperty(API.REQ_KEY);
    if(Backup == null) {
      System.setProperty(API.REQ_KEY, "0");
      return 0;
    }
    if(Count == null) {
      System.setProperty(API.Q_KEY, "1");
      return 0;
    }
    Count = parseInt(Count);
    Backup = Long.valueOf(Backup);
    if(Count < API.LIM_KEY)
      return 0;
    return (Backup + WAIT) - System.currentTimeMillis();
  },
  present: function(ip) {
    var Bank = new File(Host.getDataFolder(), "Repository.yml");
    var BankConfig = YamlConfiguration.loadConfiguration(Bank);
    return BankConfig.get("Presets").contains(ip);
  },
  write: function(ip) {
    var Bank = new File(Host.getDataFolder(), "Repository.yml");
    var BankConfig = YamlConfiguration.loadConfiguration(Bank);
    var List = BankConfig.get("Presets");
    List.add(ip); BankConfig.set("Presets", List);
    BankConfig.save(Bank);
  }
}

var Helper = {
  // Vị trí của file chứa thông tin lỗi (stack trace)
  errorStack: 'C:/Users/Administrator/error_stack_check_ip.txt',
  serverPrefix: '&eServer &3| &f',
  color: function(param) {
    return ChatColor.translateAlternateColorCodes('&', param);
  },
  performStaffWarn: function(name, region) {
    var Message = Helper.serverPrefix + "&a" + name + " &fcó thể đang dùng VPN&f, đăng nhập từ &e" + region;
    Staff.forEach(function(n) {
      var Output = ByteStreams.newDataOutput();
      Output.writeUTF("Message");
      Output.writeUTF(n);
      Output.writeUTF(Helper.color(Message));
      Helper.selectRandom(Module).sendPluginMessage(Host, "BungeeCord", Output.toByteArray());
    }); 
  },
  logError: function(err) {
    try {
      var Message = Helper.serverPrefix + "&cLỗi: &fGặp trục trặc trong khi kiểm tra IP&f, gọi &bCẽo &fđi &d:(";
      Staff.forEach(function(n) {
        var Output = ByteStreams.newDataOutput();
        Output.writeUTF("Message");
        Output.writeUTF(n);
        Output.writeUTF(Helper.color(Message));
        Helper.selectRandom(Module).sendPluginMessage(Host, "BungeeCord", Output.toByteArray());
      });
      var ErrorStack = new File(Helper.errorStack);
      if(ErrorStack.exists())
        ErrorStack.delete();
      ErrorStack.createNewFile();
      var Printer = new PrintWriter(ErrorStack);
      err.printStackTrace(Printer); Printer.close();
    } catch(err) {
      print(String(err));
    }
  },
  notifyFail: function(name) {
    var Message = Helper.serverPrefix + "&cCảnh báo: &fKhông thể xác định thông tin &eIP &fcủa &a" + name + "&f.";
    Staff.forEach(function(n) {
      var Output = ByteStreams.newDataOutput();
      Output.writeUTF("Message");
      Output.writeUTF(n);
      Output.writeUTF(Helper.color(Message));
      Helper.selectRandom(Module).sendPluginMessage(Host, "BungeeCord", Output.toByteArray());
    }); 
  },
  lobby: function(name) {
    var Output = ByteStreams.newDataOutput();
    var Message = Helper.serverPrefix + "&fĐịa chỉ &eIP &fcủa bạn hơi lạ, về sảnh nhé &d:3";
    Output.writeUTF("ConnectOther");
    Output.writeUTF(name);
    Output.writeUTF("Lobby");
    Helper.selectRandom(new SecureRandom()).sendPluginMessage(Host, "BungeeCord", Output.toByteArray());
    Output = ByteStreams.newDataOutput();
    Output.writeUTF("Message");
    Output.writeUTF(name);
    Output.writeUTF(Helper.color(Message));
    Helper.selectRandom(Module).sendPluginMessage(Host, "BungeeCord", Output.toByteArray());
  },
  selectRandom: function(random) {
    var List = new ArrayList(Server.getOnlinePlayers());
    return List.get(random.nextInt(List.size()));
  },
  getTime: function() {
    var TimeFormat = new SimpleDateFormat("HH:mm:ss dd/MM/yyyy");
    return TimeFormat.format(Calendar.getInstance().getTime());
  },
  checkBungeeCord: function(server) {
    var Messenger = server.getMessenger();
    return Messenger.isOutgoingChannelRegistered(Host, "BungeeCord");
  },
  setupRepository: function() {
    var Bank = new File(Host.getDataFolder(), "Repository.yml"); var BankConfig = null;
    var Day = (new SimpleDateFormat("dd/MM/yyyy")).format(Calendar.getInstance().getTime());
    if(!(Bank.exists())) {
      Bank.createNewFile();
      BankConfig = YamlConfiguration.loadConfiguration(Bank);
      BankConfig.set("Present", Day);
      BankConfig.set("Presets", new ArrayList());
      BankConfig.save(Bank); return 2;
    }
    BankConfig = YamlConfiguration.loadConfiguration(Bank);
    if(BankConfig.get("Present") != Day) {
      BankConfig.set("Present", Day);
      BankConfig.set("Presets", new ArrayList());
      BankConfig.save(Bank); return 1;
    }
    return 0;
  },
}

var Discord = {
  // Link webhook để gửi thông tin về IP (Discord)
  webhook: '',
  sendJSONWeebhook: function(jsonPayload) {
    var Webhook = new URL(Discord.webhook);
    var Connection = Webhook.openConnection();
    Connection.setRequestMethod("POST");
    Connection.setRequestProperty("Content-Type", "application/json; utf-8");
    Connection.setRequestProperty("Accept", "application/json");
    Connection.setDoOutput(true);
    var OutputStream = Connection.getOutputStream();
    var BytePayload = new JavaString(jsonPayload).getBytes(StandardCharsets.UTF_8);
    OutputStream.write(BytePayload, 0, BytePayload.length);
    return Connection.getResponseCode();
  },
  buildJSONInfoWebhook: function(player, response) {
    var Code = response.get("regionName") + ", " + response.get("country");
    var Body = new JSONObject();
    Body.put("content", new JavaString());
    Body.put("tts", false);
    var B1 = response.get("hosting");
    var B2 = response.get("proxy");
    var B3 = response.get("mobile");
    Body.put("embeds", Discord.buildInfo(player, Code, response.get("isp"), B1, B2, B3));
    return Body.toJSONString();
  },
  buildJSONFailWebhook: function(player, error) {
    var Body = new JSONObject();
    Body.put("content", new JavaString());
    Body.put("tts", false);
    Body.put("embeds", Discord.buildError(player, error));
    return Body.toJSONString();
  },
  buildInfo: function(player, region, isp, hosting, proxy, mobile) {
    var Embeds = new JSONArray(); var E = new JSONObject();
    E.put("type", "rich");
    E.put("title", "IP-Alert - Phát hiện IP lạ!");
    E.put("description", "Người chơi: **{name}**".replace("{name}", player));
    E.put("color", 0x13db35);
    var Fields = new JSONArray();
    var F1 = new JSONObject();
    F1.put("name", "Đăng nhập lúc");
    F1.put("value", Helper.getTime());
    F1.put("inline", true);
    var F2 = new JSONObject();
    F2.put("name", "Địa điểm");
    F2.put("value", region);
    F2.put("inline", true);
    var F3 = new JSONObject();
    F3.put("name", "Tên nhà mạng");
    F3.put("value", isp);
    F3.put("inline", false);
    var F4 = new JSONObject();
    F4.put("name", "IP được Host");
    F4.put("value", hosting);
    F4.put("inline", true);
    var F5 = new JSONObject();
    F5.put("name", "Là IP Proxy");
    F5.put("value", proxy);
    F5.put("inline", true);
    var F6 = new JSONObject();
    F6.put("name", "IP Mobile");
    F6.put("value", mobile);
    F6.put("inline", true);
    Fields.add(F1); Fields.add(F2); Fields.add(F3);
    Fields.add(F4); Fields.add(F5); Fields.add(F6);
    E.put("fields", Fields);
    Embeds.add(E); return Embeds;
  },
  buildError: function(player, error) {
    var Embeds = new JSONArray(); var E = new JSONObject();
    E.put("type", "rich");
    E.put("title", "IP-Alert - Không thể xác định");
    E.put("description", "Người chơi: **{name}**".replace("{name}", player));
    E.put("color", 0xdb1111);
    var Fields = new JSONArray();
    var F1 = new JSONObject();
    F1.put("name", "Đăng nhập lúc");
    F1.put("value", Helper.getTime());
    F1.put("inline", true);
    var F2 = new JSONObject();
    F2.put("name", "Thông tin lỗi");
    F2.put("value", "Error: \'{error}\'".replace("{error}", error));
    F2.put("inline", true);
    Fields.add(F1); Fields.add(F2);
    E.put("fields", Fields);
    Embeds.add(E); return Embeds;
  },
}

function main() {
  if(!(Helper.checkBungeeCord(Server)))
    Server.getMessenger().registerOutgoingPluginChannel(Host, "BungeeCord");
  try {
    Helper.setupRepository();
    if(MAINTENANCE) {
      if(Staff.indexOf(Player.getName()) == -1)
        return -2;
    }
    if(Discord.webhook == '')
      throw "Vui lòng cài đặt link Webhook vào trong script!";
    var Name = BukkitPlayer.getName(); 
    var IP = BukkitPlayer.getAddress().getAddress().getHostAddress();
    API.check(Name, IP); return 0;
  } catch(err) { Helper.logError(err); }
}
main();
