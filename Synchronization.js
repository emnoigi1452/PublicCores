'use strict';
/** @type {!Array} */
var _0x4423 = ["floor", "WATER", "getUniqueId", "toString", "loadConfiguration", "YamlConfiguration", " &bKh\u1ed1i Kim C\u01b0\u01a1ng", "getPlugin", "41IaYgHy", "clone", "Location", "&dSynchronization &8&l| &cL\u1ed7i: &fB\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n \u0111\u01b0\u1ee3c d\u00f9ng k\u0129 n\u0103ng n\u00e0y!", "getEnchantments", "1093709mZLLZb", "1020953vbjreR", "containsKey", "IRON_ORE", "1069961GdkKBT", "type", "BlockData.LAPIS_BLOCK", "file", "29aQsEKV", "739223OHAHMQ", "java.lang.System", 
"static", " &6Kh\u1ed1i V\u00e0ng", "Enchantment", "COAL_ORE", "PlaceholderAPI", "getBlockZ", " &fKh\u1ed1i S\u1eaft", "get", "%superior_island_location_x%", "toFixed", "12214hALeTY", "getBlockY", "SuperiorWorld", "bukkit", "getType", "\\PreventBlock", "save", "GOLD_ORE", "getDataFolder", "&eSynchronization &8&l| &f\u0110\u00e3 n\u00e9n t\u1ea5t c\u1ea3 kho\u00e1ng s\u1ea3n th\u00e0nh kh\u1ed1i trong &a", "name", "&f &e\u2756 &a+", "2027358ObDack", "getWorld", "viewer.daituong", "set", " &4Kh\u1ed1i \u0110\u00e1 \u0110\u1ecf", 
"BlockData.DIAMOND_BLOCK", "1BefmCq", "getItemInMainHand", "Material", " &0Kh\u1ed1i Than", "%superior_island_location_size%", "setPlaceholders", "add", "setZ", " &2Kh\u1ed1i L\u1ee5c B\u1ea3o", "1dyVXOD", "BlockData.COAL_BLOCK", "1HCmDyu", "getByName", "getBlock", "DIAMOND_ORE", "LAPIS_ORE", "java.io.File", "BlockData.GOLD_BLOCK", "subtract", "java.util.HashSet", "getBlockX", "java.util.ArrayList", "indexOf", "2SOxzcT", "BlockData.IRON_BLOCK", "nanoTime", "getInventory", "getLocation", "configuration", 
"26073syLwDK", "LOOT_BONUS_BLOCKS", "BlockData.EMERALD_BLOCK"];
/** @type {function(number, ?): ?} */
var _0x108cc6 = _0x4aee;
(function(data, oldPassword) {
  /** @type {function(number, ?): ?} */
  var toMonths = _0x4aee;
  for (; !![];) {
    try {
      /** @type {number} */
      var userPsd = -parseInt(toMonths(348)) * -parseInt(toMonths(312)) + parseInt(toMonths(265)) + -parseInt(toMonths(332)) * -parseInt(toMonths(272)) + -parseInt(toMonths(268)) * parseInt(toMonths(303)) + -parseInt(toMonths(326)) * -parseInt(toMonths(273)) + parseInt(toMonths(343)) * -parseInt(toMonths(285)) + parseInt(toMonths(297)) * -parseInt(toMonths(314));
      if (userPsd === oldPassword) {
        break;
      } else {
        data["push"](data["shift"]());
      }
    } catch (_0x20cb57) {
      data["push"](data["shift"]());
    }
  }
})(_0x4423, 751132);
var p = BukkitPlayer;
var Server = BukkitServer;
var Console = Server["getConsoleSender"]();
var YamlConfiguration = org[_0x108cc6(288)][_0x108cc6(331)][_0x108cc6(271)][_0x108cc6(340)];
var File = Java[_0x108cc6(269)](_0x108cc6(319));
var db = Server["getPluginManager"]()[_0x108cc6(342)](_0x108cc6(279))[_0x108cc6(293)]() + _0x108cc6(290);
var HashSet = Java[_0x108cc6(269)](_0x108cc6(322));
var transparent = new HashSet;
var ArrayList = Java[_0x108cc6(269)](_0x108cc6(324));
transparent["add"](org[_0x108cc6(288)][_0x108cc6(305)]["STATIONARY_WATER"]), transparent["add"](org[_0x108cc6(288)][_0x108cc6(305)][_0x108cc6(336)]), transparent["add"](org["bukkit"][_0x108cc6(305)]["AIR"]), transparent[_0x108cc6(309)](org[_0x108cc6(288)][_0x108cc6(305)]["TRAP_DOOR"]);
/**
 * @param {number} array
 * @return {?}
 */
function calculate_product(array) {
  var makeTransactionID = _0x108cc6;
  var _0x3c80ed = p[makeTransactionID(329)]()[makeTransactionID(304)]();
  if (_0x3c80ed == null) {
    return array;
  } else {
    var p = _0x3c80ed[makeTransactionID(347)]();
    var val = org[makeTransactionID(288)]["enchantments"][makeTransactionID(277)][makeTransactionID(315)](makeTransactionID(333));
    return p[makeTransactionID(266)](val) ? p[makeTransactionID(282)](val) * array : array;
  }
}
/**
 * @param {?} size
 * @return {?}
 */
function check_block(size) {
  var findMiddlePosition = _0x108cc6;
  var leftBranch = size[findMiddlePosition(330)]();
  var rightBranch = leftBranch[findMiddlePosition(344)]()[findMiddlePosition(309)](0, 1, 0);
  var _0x50c7d7 = leftBranch[findMiddlePosition(344)]()[findMiddlePosition(321)](0, 1, 0);
  return rightBranch[findMiddlePosition(316)]()[findMiddlePosition(289)]()[findMiddlePosition(295)]()["indexOf"](findMiddlePosition(336)) != -1 && _0x50c7d7["getBlock"]()[findMiddlePosition(289)]()["name"]() == "FENCE";
}
/**
 * @param {number} totalExpectedResults
 * @param {?} entrySelector
 * @return {?}
 */
function _0x4aee(totalExpectedResults, entrySelector) {
  /** @type {number} */
  totalExpectedResults = totalExpectedResults - 265;
  var _0x442390 = _0x4423[totalExpectedResults];
  return _0x442390;
}
/**
 * @param {?} myPreferences
 * @return {?}
 */
function is_in_island(myPreferences) {
  var decodeURIComponent = _0x108cc6;
  if (myPreferences[decodeURIComponent(298)]()["getName"]() != decodeURIComponent(287)) {
    return ![];
  }
  /** @type {number} */
  var num = parseInt(PlaceholderAPI[decodeURIComponent(275)][decodeURIComponent(308)](p, decodeURIComponent(283)));
  /** @type {number} */
  var i = parseInt(PlaceholderAPI[decodeURIComponent(275)]["setPlaceholders"](p, "%superior_island_location_z%"));
  /** @type {number} */
  var offset = parseInt(PlaceholderAPI[decodeURIComponent(275)][decodeURIComponent(308)](p, decodeURIComponent(307)));
  /** @type {number} */
  var str = num + offset;
  /** @type {number} */
  var end = num - offset;
  /** @type {number} */
  var start = i + offset;
  /** @type {number} */
  var min = i - offset;
  /** @type {number} */
  var ref = 0;
  /** @type {!Array} */
  var _this = [];
  /** @type {!Array} */
  var data = [];
  /** @type {number} */
  var value = str;
  for (; value >= end; value--) {
    /** @type {number} */
    _this[ref] = value;
    ref++;
  }
  /** @type {number} */
  ref = 0;
  /** @type {number} */
  var time = start;
  for (; time >= min; time--) {
    /** @type {number} */
    data[ref] = time;
    ref++;
  }
  myPreferences = p[decodeURIComponent(330)]();
  var templatePathFrom = myPreferences[decodeURIComponent(323)]();
  var parameter = myPreferences[decodeURIComponent(280)]();
  return _this[decodeURIComponent(325)](templatePathFrom) != -1 && data[decodeURIComponent(325)](parameter) != -1;
}
/**
 * @return {?}
 */
function main() {
  var parseInt = _0x108cc6;
  if (!p["hasPermission"](parseInt(299))) {
    return parseInt(346);
  }
  /** @type {string} */
  var jsPlugins = db + "\\" + p[parseInt(337)]()[parseInt(338)]() + ".yml";
  /** @type {!File} */
  var initScriptFile = new File(jsPlugins);
  var _controlCommandNames = p["getLocation"]()[parseInt(344)]();
  var groupsize = _controlCommandNames[parseInt(323)]();
  var len = _controlCommandNames["getBlockZ"]();
  /** @type {number} */
  var sync = groupsize - 35;
  /** @type {number} */
  var cardNstart = len - 35;
  var fIdent = _controlCommandNames[parseInt(286)]() + 1;
  var fakeWebdav = new (org[parseInt(288)][parseInt(345)])(p[parseInt(298)](), sync, fIdent, cardNstart);
  /** @type {number} */
  var dec2hex = 0;
  /** @type {number} */
  var optionalDivisorsKeys = 0;
  /** @type {number} */
  var jsarray = 0;
  /** @type {number} */
  var formats = 0;
  /** @type {number} */
  var fns = 0;
  /** @type {number} */
  var playerList = 0;
  /** @type {number} */
  var countries = 0;
  var frontpageItems = Java[parseInt(269)](parseInt(274));
  var pixelSizeTargetMax = frontpageItems[parseInt(328)]();
  /** @type {number} */
  var _0x4c68c6 = 0;
  for (; _0x4c68c6 < 70; ++_0x4c68c6) {
    /** @type {number} */
    var _0x2d517d = 0;
    for (; _0x2d517d < 70; ++_0x2d517d) {
      fakeWebdav = fakeWebdav[parseInt(309)](0, 0, 1);
      var tagsize = fakeWebdav[parseInt(316)]();
      if (is_in_island(tagsize["getLocation"]()) && check_block(tagsize)) {
        switch(tagsize[parseInt(289)]()[parseInt(295)]()) {
          case parseInt(278):
            dec2hex++;
            break;
          case parseInt(318):
            optionalDivisorsKeys++;
            break;
          case "REDSTONE_ORE":
            jsarray++;
            break;
          case parseInt(267):
            formats++;
            break;
          case parseInt(292):
            fns++;
            break;
          case parseInt(317):
            playerList++;
            break;
          case "EMERALD_ORE":
            countries++;
            break;
        }
      }
    }
    fakeWebdav["setX"](fakeWebdav["getBlockX"]() + 1);
    fakeWebdav[parseInt(310)](cardNstart);
  }
  var zeroSizeMax = frontpageItems[parseInt(328)]();
  var card = YamlConfiguration[parseInt(339)](initScriptFile);
  dec2hex = Math[parseInt(335)](calculate_product(dec2hex) / 9);
  optionalDivisorsKeys = Math[parseInt(335)](calculate_product(optionalDivisorsKeys) / 9);
  jsarray = Math[parseInt(335)](calculate_product(jsarray) / 9);
  formats = Math[parseInt(335)](calculate_product(formats) / 9);
  fns = Math[parseInt(335)](calculate_product(fns) / 9);
  playerList = Math[parseInt(335)](calculate_product(playerList) / 9);
  countries = Math[parseInt(335)](calculate_product(countries) / 9);
  card[parseInt(300)](parseInt(313), card[parseInt(282)](parseInt(313)) + dec2hex);
  card[parseInt(300)]("BlockData.LAPIS_BLOCK", card[parseInt(282)](parseInt(270)) + optionalDivisorsKeys);
  card[parseInt(300)]("BlockData.REDSTONE_BLOCK", card[parseInt(282)]("BlockData.REDSTONE_BLOCK") + jsarray);
  card[parseInt(300)](parseInt(327), card[parseInt(282)](parseInt(327)) + formats);
  card[parseInt(300)](parseInt(320), card[parseInt(282)](parseInt(320)) + fns);
  card["set"]("BlockData.DIAMOND_BLOCK", card[parseInt(282)](parseInt(302)) + playerList);
  card[parseInt(300)](parseInt(334), card[parseInt(282)](parseInt(334)) + countries);
  card[parseInt(291)](initScriptFile);
  /** @type {string} */
  var _0x3c0007 = parseInt(294) + ((zeroSizeMax - pixelSizeTargetMax) / 1E8)[parseInt(284)](1) + "s!";
  return _0x3c0007 = _0x3c0007 + ("\n" + parseInt(296) + dec2hex[parseInt(284)]() + parseInt(306)), _0x3c0007 = _0x3c0007 + ("\n" + parseInt(296) + optionalDivisorsKeys["toFixed"]() + " &1Kh\u1ed1i L\u01b0u Ly"), _0x3c0007 = _0x3c0007 + ("\n" + parseInt(296) + jsarray["toFixed"]() + parseInt(301)), _0x3c0007 = _0x3c0007 + ("\n" + parseInt(296) + formats[parseInt(284)]() + parseInt(281)), _0x3c0007 = _0x3c0007 + ("\n" + "&f &e\u2756 &a+" + fns[parseInt(284)]() + parseInt(276)), _0x3c0007 = _0x3c0007 + 
  ("\n" + parseInt(296) + playerList[parseInt(284)]() + parseInt(341)), _0x3c0007 = _0x3c0007 + ("\n" + parseInt(296) + countries[parseInt(284)]() + parseInt(311)), _0x3c0007;
}
main();
