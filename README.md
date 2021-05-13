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
