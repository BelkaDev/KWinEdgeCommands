 in=contents/code/source.template.js
 out=contents/code/source.js
 action="$(grep -oP '(?<=X-KDE-PluginInfo-Name=).*' metadata.desktop)"
 cat $in | sed -e "s/\${COMMANDNAME}/\"${action}\"/g" > $out
