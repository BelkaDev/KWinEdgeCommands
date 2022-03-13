const DomParser = require("dom-parser");
const parser = new DomParser();

const registeredBorders = [];

function execSync(method) {
  return () =>
    callDBus(
      "com.belka.edgescript",
      "/Commands",
      "com.belka.edgescript",
      method
    );
}
function init() {
  for (var i in registeredBorders) {
    unregisterScreenEdge(registeredBorders[i]);
  }
  var borders = readConfig("BorderActivate", "").toString().split(",");
  for (var i in borders) {
    var border = parseInt(borders[i]);
    if (isFinite(border)) {
      registeredBorders.push(border);
      registerScreenEdge(border, execSync("gogogo"));
    }
  }
}

options.configChanged.connect(init);

init();
