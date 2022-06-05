 #! /bin/sh

set -eE -o functrace

throw_err() {
  local lineno=$1;local msg=$2
  printf "\nError at $lineno: $msg"
  kdialog --detailederror "\nError at $lineno" "$msg"
  qdbus $dbusRef close
  exit 1
}

trap 'throw_err ${LINENO} "$BASH_COMMAND"' ERR


camelize() {
res="$(echo "$*" | sed 's/[^ ]\+/\L\u&/g')"
res="${res,}"
echo "${res// /}"
}

if [ -d "$HOME/.local/share/kservices5/edgescript" ]; then
cd "$HOME/.local/share/kservices5/edgescript" 
else 
repdir=$(mktemp -d)
git clone https://github.com/BelkaDev/KWinEdgeCommands $repdir
cd $repdir
fi

[ ! -d "$HOME/.local/share/kservices5/" ] && mkdir -p $HOME/.local/share/kservices5/
[ ! -d "$HOME/.local/share/kservices5/edgescript" ] && mkdir -p $HOME/.local/share/kservices5/edgescript
[ ! -d "$HOME/.local/share/dbus-1/services/" ] && mkdir -p $HOME/.local/share/dbus-1/services/


name=$(kdialog  --geometry 300X1200+750+500 --title "New Edge Command" --inputbox "<center><br>Enter the command name (<b>letters only</b>)<br><br></center>") 
[[ -z "$name" ]] && kdialog --error "Name can't be empty" && exit 1
command=$(kdialog  --geometry 300X1200+750+500 --title "New Edge Command " --inputbox "<center><br>Paste your command here (or <b>absolute</b> path to a script file)<br></center><i>*notice</i>: <i>Make sure to try your commands before adding them.</i><br><br><br>")
[[ -z "$command" ]] && kdialog --error "Command can't be empty" && exit 1




jq -n --arg name "$name" --arg command "$command" '[{name:$name,command:$command}]' > config.json.tmp

if [ -f $HOME/.local/share/kservices5/edgescript/config.json.tmp ]; then
actions="$(jq -s '.[0] + .[1]' config.json.tmp $HOME/.local/share/kservices5/edgescript/config.json | jq 'unique_by(.name)')"
echo "$actions" > $HOME/.local/share/kservices5/edgescript/config.json
else
cp config.json.tmp "$HOME/.local/share/kservices5/edgescript/config.json"
fi
rm config.json.tmp

chmod +x src/main.js

cd kwinscript


id=$(camelize $name)
sed -i "s\\^Name=.*$\\Name=$name\\" metadata.desktop
sed -i "s\\^X-KDE-PluginInfo-Name=.*$\\X-KDE-PluginInfo-Name=${id}\\" metadata.desktop

if kpackagetool5 --list | grep "^$id$" > /dev/null; then
    status="Updat"
else
    status="Install"
fi

dbusRef=$(kdialog --progressbar "${status}ing command \"$name\"" 4)

qdbus $dbusRef Set "" value 1

[ ! -d node_modules/ ] && npm install
npm run bundle
qdbus $dbusRef Set "" value 2
npm run start


cd ..

sed "s|%{BASE_DIR}|$HOME|g" edgescript.service > $HOME/.local/share/dbus-1/services/edgescript.service

[ ! -d node_modules/ ] && npm install
npm run stop
npm run start &

qdbus $dbusRef Set "" value 3

rsync -a  --exclude="config.json" --exclude=".*" --exclude "assets" . $HOME/.local/share/kservices5/edgescript

qdbus $dbusRef Set "" value 4
qdbus $dbusRef close
printf "\nInstallation complete."
kdialog --title "Success" --msgbox "<br>Command \"$name\" ${status}ed successfully!<br>"