const readFile = require("fs").readFileSync;
const dbus = require("dbus-native");
const { createDbusInterface } = require("./dbus-connection");

const sessionBus = dbus.sessionBus();
if (!sessionBus) throw new Error("Failed to connect to the session bus");

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}
var actions = [];
try {
  actions = JSON.parse(
    readFile(
      `${require("os").homedir()}/.local/share/kservices5/edgescript/config.json`
    )
  );
} catch {
  actions = JSON.parse(readFile(`./config.json`));
}

const DBusEvents = actions.map((action) => ({
  [camelize(action.name)]: () => require("child_process").exec(action.command),
}));

createDbusInterface({
  Path: "/Commands",
  DBusEvents,
});
