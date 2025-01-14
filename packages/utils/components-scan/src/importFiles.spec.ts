import {join} from "path";
import {importFiles} from "./importFiles";
import {Test1} from "./data/Test1";
import {Test2} from "./data/Test2";

describe("importFiles", () => {
  it("should import symbols", async () => {
    const symbols = await importFiles([join(__dirname, "data/*.ts")], []);

    expect(symbols).toEqual(["value", Test1, "value", Test2]);
  });

  it("should import symbols without excluded files", async () => {
    const symbols = await importFiles([join(__dirname, "data/*.ts")], [join(__dirname, "data/Test2.ts")]);

    expect(symbols).toEqual(["value", Test1]);
  });
});
