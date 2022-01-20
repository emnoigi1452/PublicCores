var System = Java.type("java.lang.System");
var NewYear = 1643648400;

function main() {
  var CurrentTime = Math.floor(System.currentTimeMillis() / 1000);
  var Seconds = NewYear - CurrentTime;
  if(Seconds < 0) return "&dHappy New Year!";
  else {
    var Days = Math.floor(Seconds / 86400);
    Seconds -= (Days * 86400);
    var Hours = Math.floor(Seconds / 3600);
    Seconds -= (Days * 3600);
    var Minutes = Math.floor(Seconds / 60);
    var Seconds = Seconds % 60;
    // Formatting smh
    var FormatDay = "%d ngày ";
    var FormatHour = "%h giờ ";
    var FormatMin = "%m phút ";
    var FormatSec = "%s giây";
    var FullMessage = "";
    if(Days > 0)
      FullMessage += FormatDay.replace("%d", Days.toString());
    if(Hour > 0)
      FullMessage += FormatHour.replace("%h", Hours.toString());
    if(Minutes > 0)
      FullMessage += FormatMin.replace("%m", Minutes.toString());
    FullMessage += FormatSec.replace("%s", Seconds.toString());
    return FullMessage; 
  }
}
main();
