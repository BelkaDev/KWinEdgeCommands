 #! /bin/sh


npm run stop

pgrep -f "$HOME/.local/share/kservices5/edgescript/src/index.js" | grep -v $$ | xargs kill &>/dev/null

[ -d "$HOME/.local/share/kservices5/edgescript/" ] && rm -r $HOME/.local/share/kservices5/edgescript/; 

[ -f "$HOME/.local/share/dbus-1/services/edgescript.service" ] && rm $HOME/.local/share/dbus-1/services/edgescript.service; 


kdialog --title "Success" --msgbox "<br>Uninstalled successfully!<br>"

printf "Done."

