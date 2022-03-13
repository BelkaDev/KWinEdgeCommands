id="$(grep -oP '(?<=X-KDE-PluginInfo-Name=).*' metadata.desktop)"
if kpackagetool5 --list | grep "^$id$" > /dev/null; then
    kpackagetool5 --type=KWin/Script -u .
else
    kpackagetool5 --type=KWin/Script -i .
fi
