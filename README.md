# CustomCore - Public cores (13/05/2021)

**Core No.1** - PreventBlock - A custom block-compression system for **PreventHopper-ORE**.

**What is PreventBlock?** As stated above, it's a custom JavaScript expansion that
allow players/users to interact with the PreventHopper's data file, therefore allowing
for the modification of ore data, which then allow for the creation of the block
compression system, a system which allows players to craft an unlimited amount of blocks
in a matter of seconds, with no effort and no physical limit to the storage system.

**Dependencies:** The code relies on a few main plugins in order to work, which would of
course include PreventHopper itself, as well as a few other plugins, but it's up to the
likings of administrators to adjust the dependencies in the code itself.

**What can it do?** The script acts as a placeholder for PlaceholderAPI itself, as well as
a "plugin", if you could say it that way. As of right now, the core can do several things
such as: Compress ores into blocks, Send blocks within your storage to others, Convert
the blocks to SuperiorCore's Wand Database, and send the blocks to other SuperiorCore
databases - For player's with custom BuildWands to use.

**How does it work?** The following part will give a more in-depth look into the code, and
how it works, to give the viewer a better understanding of what's going on.

***Part I: Condense - Craft blocks from ores inside data files.***

This is the main usage of the script, being able to freely manipulate the data files in order
for the quick and easy compression of ores into blocks. First off, we begin by checking if
the input material type is valid, as well as getting information from the in-game storage
of the player requesting to compress their minerals:
```javascript
var backup_node = args[1].toLowerCase(); var update = "javascript_preventhopper_update";
if(numeric_id(backup_node) == -1)
  return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!";
PlaceholderAPI.static.setPlaceholders(p, "%" + update + "%");
var placeholder = "javascript_preventhopper_get," + backup_node;
var count = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%"));
if(count < 9) return "&8[&eKho&8] &cLỗi: &fBạn không có đủ khoáng sản để thực hiện nén khối!";
```

This code snippet may look quite messy, but once you break it down, it should be quite simple to
understand what's going on. First we allow ourselves to backup the users input, as we will be
parsing other placeholders in the process of our code
```javascript
var backup_node = args[1].toLowerCase();
```
Next, we begin checking whether the input is valid or not, we can check through the function
defined near the beginning of the code, which is **numeric_id**, which looks like this
```javascript
function numeric_id(param) {
	switch(param.toLowerCase()) {
		case "coal": return 173;
		case "lapis": return 22;
		case "redstone": return 152;
		case "iron": return 42;
		case "gold": return 41;
		case "diamond": return 57;
		case "emerald": return 133;
		default: return -1;
	}
}
```
The function returns all of the block ids in mMinecraft, if the input is not any of minerals
other than the 7 mineral blocks, it'll return **-1**, indicating that the input is invalid.
We can check the input via the backup variable defined earlier
```javascript
if(numeric_id(backup_node) == -1)
  return "&eBlock &8&l| &cLỗi: &fLoại khoáng sản không hợp lệ!";
```
If the input is valid, we shall move to the next step, which is to parse an update to the
user's data, then we check if the amount of minerals is enough to perform a compression
process to be executed. The default check value will be 9, as opposed to a single block.
```javascript
var update = "javascript_preventhopper_update"; // The placeholder to update the player's data (1)
PlaceholderAPI.static.setPlaceholders(p, "%" + update + "%"); // Parsing the placeholder (1)
var placeholder = "javascript_preventhopper_get," + backup_node; // The placeholder to get the mineral count (1)
var count = parseInt(PlaceholderAPI.static.setPlaceholders(p, "%" + placeholder + "%")); // Parsing the placeholder (2)
if(count < 9) return "&8[&eKho&8] &cLỗi: &fBạn không có đủ khoáng sản để thực hiện nén khối!"; // Checking...
```
If our player manages to went through all the checks, the compression process shall begin. Starting
off, we will perform a kick command to temporaily block the user from the user, which will give
us time to modify the user's data file. The kick message will be a sort of prediction as to how
many blocks were compressed from the data file
```javascript
var block_count = Math.floor(count / 9);
var message = "&8[&eKho&8] &fĐã nén khối thành công &a✔ &8[&a+" + block_count.toString() + " khối&8]";
p.kickPlayer(message.replace(/&/g, "§"));
```
Afterwards, we begin by initializing the path to our data file, as well as setting up the data lines
in an ArrayList object, to which can be imported via the NashornAPI
```javascript
var server = BukkitServer; 
var plugin_instance = server.getPluginManager().getPlugin("PreventHopper-ORE"); 
var ArrayList = Java.type("java.util.ArrayList");
var p = BukkitPlayer; var p_uid = p.getUniqueId().toString(); 
var data = new ArrayList();
var path = plugin_instance.getDataFolder() + "\\userdata\\" + p_uid + ".yml";
```
Once completed, we begin scanning the file to initialize our ArrayList:
```javascript
var File = Java.type(java.io.File); var Scanner = Java.type("java.util.Scanner");
var data_file = new File(path); var file_reader = new Scanner(data_file);
while(file_reader.hasNextLine()) {
	var string = file_reader.nextLine(); data.add(string);
}
```
After we finish setting things up, we begin the compression, first we calculated the
amount of minerals remaining, then replacing it into the ArrayList, which we can
get the line of the exact mineral type via a function written above:
```javascript
function read_data_line(param) {
	switch(param.toLowerCase()) {
		case "coal": return 3;
		case "lapis": return 4;
		case "redstone": return 5;
		case "iron": return 6;
		case "gold": return 7;
		case "diamond": return 8;
		case "emerald": return 9;
	}
}

var remain = count - (block_count*9);
var new_string = data.get(read_data_line(backup_node)).replace(count, remain);
data.set(read_data_line(backup_node), new_string);
```
After that, we simply rewrite the file to save the new, edited data.
```javascript
var PrintWriter = Java.type("java.io.PrintWriter"); var writer = new PrintWriter(data_file);
for each(var s in data)
	writer.println(s);
writer.flush(); writer.close();
```
Once completed, we new begin loading in the blocks the the player's block database, which
is accessable via the Data object provided by JavaScriptExpansion. We will generate a
new HashMap object, referring to the data map that the script holds.
```javascript
var HashMap = Java.type("java.util.HashMap");
var data_map = Data.exists(p_uid) ? Data.get(p_uid) : new HashMap();
```
We then initialize the map, filling in missing keys, if there's one:
```javascript
function initializeMap(map) {
	if(!map.containsKey("COAL_BLOCK")) 
		map.put("COAL_BLOCK", 0);
	if(!map.containsKey("REDSTONE_BLOCK"))
		map.put("REDSTONE_BLOCK", 0);
	if(!map.containsKey("LAPIS_BLOCK"))
		map.put("LAPIS_BLOCK", 0);
	if(!map.containsKey("IRON_BLOCK"))
		map.put("IRON_BLOCK", 0);
	if(!map.containsKey("GOLD_BLOCK"))
		map.put("GOLD_BLOCK", 0);
	if(!map.containsKey("DIAMOND_BLOCK"))
		map.put("DIAMOND_BLOCK", 0);
	if(!map.containsKey("EMERALD_BLOCK"))
		map.put("EMERALD_BLOCK", 0);
	return map;
}
data_map = initializeMap(data_map);
```
Then, we begin modifying the database's saved data of our player:
```javascript
function read_name(param) {
	return param.toUpperCase() + "_BLOCK";
}
var storage_count = data_map.get(read_name(backup_node));
storage_count += block_count;
data_map.put(read_name(backup_node), storage_count);
Data.set(p_uid, data_map); 
Placeholder.saveData();
```
And there we go, our player has successfully crafted all their minerals into
blocks in the matter of seconds.

***I'm too lazy to write the explanation of the other mods. I'll try and complete
them when I have free time again, bye.***
