import {CustomKeys, getJsonSchema, getSpec, OperationPath, Path, Returns} from "@tsed/schema";
import {expect} from "chai";
import {CustomKey} from "./customKey";

describe("@CustomKey", () => {
  it("should declare customKey field", () => {
    // WHEN
    class Model {
      @CustomKey("range", [1, 2])
      num: number;
    }

    // THEN
    const schema = getJsonSchema(Model, {customKeys: true});

    expect(schema).to.deep.equal({
      properties: {
        num: {
          type: "number",
          range: [1, 2]
        }
      },
      type: "object"
    });
  });

  it("should return the spec (OS3)", () => {
    // WHEN
    class Model {
      @CustomKey("range", [1, 2])
      num: number;
    }

    @Path("/")
    class MyController {
      @OperationPath("GET", "/")
      @Returns(200, Model)
      get() {}
    }

    // THEN
    const spec = getSpec(MyController);

    expect(spec).to.deep.equal({
      components: {
        schemas: {
          Model: {
            properties: {
              num: {
                type: "number"
              }
            },
            type: "object"
          }
        }
      },
      paths: {
        "/": {
          get: {
            operationId: "myControllerGet",
            parameters: [],
            responses: {
              "200": {
                content: {
                  "application/json": {
                    schema: {
                      $ref: "#/components/schemas/Model"
                    }
                  }
                },
                description: "Success"
              }
            },
            tags: ["MyController"]
          }
        }
      },
      tags: [
        {
          name: "MyController"
        }
      ]
    });
  });

  it("should declare customKey field (keys)", () => {
    // WHEN
    class Model {
      @CustomKeys({range: [1, 2]})
      num: number;
    }

    // THEN
    const schema = getJsonSchema(Model, {customKeys: true});

    expect(schema).to.deep.equal({
      properties: {
        num: {
          type: "number",
          range: [1, 2]
        }
      },
      type: "object"
    });
  });
});
