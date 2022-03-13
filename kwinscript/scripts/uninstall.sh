#!/bin/bash
id=$(kdialog  --geometry 300X1200+750+500 --title "Remove Edge command" --inputbox "<center><br>Enter the command name to delete<br><br></center>")
#id="$(grep -oP '(?<=X-KDE-PluginInfo-Name=).*' metadata.desktop)"
if kpackagetool5 --type=KWin/Script --list | grep "^$id$" > /dev/null; then
    kpackagetool5 --type=KWin/Script -r "$id"
fi

kwriteconfig5 --file kwinrc --group Plugins --key "${id}Enabled" --delete

is_loaded="$(qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.isScriptLoaded "$id")"
if [[ "$is_loaded" == "true" ]]; then
    qdbus org.kde.KWin /Scripting org.kde.kwin.Scripting.unloadScript "$id" > /dev/null
	kdialog --title "Success" --msgbox "<br>Command $id was removed.<br>"  
fi
