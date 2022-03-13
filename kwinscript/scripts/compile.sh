 in=/home/belka/Dbus_script/kwinscript/contents/code/source.template.js
 out=/home/belka/Dbus_script/kwinscript/contents/code/source.js
 action="$(grep -oP '(?<=X-KDE-PluginInfo-Name=).*' metadata.desktop)"
 cat $in | sed -e "s/\${COMMANDNAME}/\"${action}\"/g" > $out
