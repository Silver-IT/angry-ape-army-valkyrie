const FalloutCrystal = require("./Valkyries.json");
const createKeccakHash = require("keccak");

for (let value of FalloutCrystal.abi) {
  if (value.type === "error") {
    let name = value.name;
    name += "(";
    let length = value.inputs?.length;
    if (length && length > 0) {
      for (let i = 0; i < length - 1; i++) {
        name += value.inputs[i].type + ",";
      }
      name += value.inputs[length - 1].type;
    }
    name += ")";
    const code =
      "0x" +
      createKeccakHash("keccak256").update(name).digest("hex").slice(0, 8);
    console.log({
      code: code,
      name: name,
    });
  }
}
