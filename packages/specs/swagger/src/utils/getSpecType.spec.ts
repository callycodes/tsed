import {SpecTypes} from "@tsed/schema";
import {expect} from "chai";
import {getSpecType, getSpecTypeFromSpec} from "./getSpecType";

describe("getSpecType", () => {
  it("should return spect type from version", () => {
    expect(getSpecType("3.0.1")).to.equal(SpecTypes.OPENAPI);
  });
});

describe("getSpecTypeFromSpec", () => {
  it("should return spect type from version", () => {
    expect(getSpecTypeFromSpec({openapi: "3.0.1"})).to.equal(SpecTypes.OPENAPI);
  });
});
