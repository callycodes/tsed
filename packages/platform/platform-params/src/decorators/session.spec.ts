import {Session} from "./session";
import {expect} from "chai";
import {ParamMetadata} from "../domain/ParamMetadata";
import {ParamTypes} from "../domain/ParamTypes";

describe("@Session", () => {
  it("should call ParamFilter.useParam method with the correct parameters", () => {
    class Test {}

    class Ctrl {
      test(@Session({expression: "expression", useType: Test}) body: Test) {}
    }

    const param = ParamMetadata.get(Ctrl, "test", 0);
    expect(param.expression).to.eq("expression");
    expect(param.paramType).to.eq(ParamTypes.SESSION);
    expect(param.type).to.eq(Test);
  });
});
