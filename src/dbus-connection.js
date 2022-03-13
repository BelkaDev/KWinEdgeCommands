const dbus = require("dbus-native");

const sessionBus = dbus.sessionBus();
if (!sessionBus) throw new Error("Could not connect to session bus");
sessionBus.requestName("com.belka.edgescript", 0x04, (err, code) => {
  if (err) throw new Error(err);

  if (code === 3) throw new Error(`Another instance is already running`);
  if (code !== 1) {
    throw new Error(
      `Received code ${code} while requesting service name "com.belka.edgescript"`
    );
  }
});

module.exports.createDbusInterface = ({ Path, DBusEvents }) => {
  const InterfaceDesc = {
    name: "com.belka.edgescript",
    methods: Object.assign(
      ...DBusEvents.map((event) => ({
        [Object.keys(event)[0]]: ["s", "", ["args"], []],
      }))
    ),
  };

  sessionBus.exportInterface(Object.assign(...DBusEvents), Path, InterfaceDesc);
};
