import {CollectionOf, Generics, OperationPath, Property, Returns, SpecTypes} from "@tsed/schema";
import {expect} from "chai";
import {getSpec} from "../../utils/getSpec";

describe("@Returns", () => {
  it("should declare a return type", async () => {
    // WHEN
    class Controller {
      @OperationPath("POST", "/")
      @(Returns(200, String).Description("description"))
      method() {}
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.SWAGGER});

    expect(spec).to.deep.equal({
      definitions: {},
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            responses: {
              "200": {
                description: "description",
                schema: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    });
  });
  it("should declare a return type with content-type", async () => {
    // WHEN
    class Controller {
      @OperationPath("POST", "/")
      @(Returns(200, String)
        .Description("description")
        .ContentType("text/json"))
      method() {}
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.OPENAPI});

    expect(spec).to.deep.equal({
      components: {
        schemas: {}
      },
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            responses: {
              "200": {
                content: {
                  "text/json": {
                    schema: {
                      type: "string"
                    }
                  }
                },
                description: "description"
              }
            }
          }
        }
      }
    });
  });
  it("should declare error response", async () => {
    // WHEN
    class Controller {
      @OperationPath("POST", "/")
      @(Returns(400).Description("Bad request"))
      @(Returns(200).Description("Success"))
      method() {}
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.SWAGGER});

    expect(spec).to.deep.equal({
      definitions: {},
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            responses: {
              "200": {
                description: "Success",
                schema: {
                  type: "string"
                }
              },
              "400": {
                description: "Bad request",
                schema: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    });
  });
  it("should throw an error when using of with String", async () => {
    // WHEN
    let actualError: any;
    try {
      class Controller {
        @OperationPath("POST", "/")
        @(Returns(200, String)
          .Of(Array)
          .Description("description"))
        method() {}
      }
    } catch (er) {
      actualError = er;
    }

    actualError.message.should.eq("Returns.Of cannot be used with the following primitive classes: String, Number, Boolean");
  });
  it("should throw an error when using of with Collection", async () => {
    // WHEN
    let actualError: any;
    try {
      class Controller {
        @OperationPath("POST", "/")
        @(Returns(200, Array)
          .Nested(Set)
          .Description("description"))
        method() {}
      }
    } catch (er) {
      actualError = er;
    }

    actualError.message.should.eq("Returns.Nested cannot be used with the following classes: Map, Set, Array, String, Number, Boolean");
  });
  it("should throw an error when the decorator isn't correctly used", async () => {
    class Test {}

    // WHEN
    let actualError: any;
    try {
      // @ts-ignore
      Returns(200)(Test, "property");
    } catch (er) {
      actualError = er;
    }

    actualError.message.should.eq("Returns cannot be used as property.static decorator on Test.property");
  });
  it("should declare an Array of string", async () => {
    // WHEN
    class Controller {
      @OperationPath("POST", "/")
      @(Returns(200, Array)
        .Of(String)
        .Description("description"))
      method() {}
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.SWAGGER});

    expect(spec).to.deep.equal({
      definitions: {},
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            produces: ["text/json"],
            responses: {
              "200": {
                description: "description",
                schema: {
                  items: {
                    type: "string"
                  },
                  type: "array"
                }
              }
            }
          }
        }
      }
    });
  });
  it("should declare an Array of Model", async () => {
    // WHEN
    class Model {
      @Property()
      id: string;
    }

    class Controller {
      @OperationPath("POST", "/")
      @(Returns(200, Array)
        .Of(Model)
        .Description("description"))
      method() {}
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.SWAGGER});

    expect(spec).to.deep.equal({
      definitions: {
        Model: {
          properties: {
            id: {
              type: "string"
            }
          },
          type: "object"
        }
      },
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            produces: ["text/json"],
            responses: {
              "200": {
                description: "description",
                schema: {
                  items: {
                    $ref: "#/definitions/Model"
                  },
                  type: "array"
                }
              }
            }
          }
        }
      }
    });
  });
  it("should declare an Generic of Model", async () => {
    // WHEN
    @Generics("T")
    class Pagination<T> {
      @CollectionOf("T")
      data: T[];

      @Property()
      totalCount: number;
    }

    @Generics("T")
    class Submission<T> {
      @Property()
      _id: string;

      @Property("T")
      data: T;
    }

    class Product {
      @Property()
      title: string;
    }

    class Controller {
      @OperationPath("POST", "/")
      @(Returns(200, Pagination)
        .Of(Submission)
        .Nested(Product)
        .Description("description"))
      async method(): Promise<Pagination<Submission<Product>> | null> {
        return null;
      }
    }

    // THEN
    const spec = getSpec(Controller, {spec: SpecTypes.SWAGGER});

    expect(spec).to.deep.equal({
      definitions: {
        Product: {
          properties: {
            title: {
              type: "string"
            }
          },
          type: "object"
        }
      },
      paths: {
        "/": {
          post: {
            operationId: "controllerMethod",
            parameters: [],
            produces: ["text/json"],
            responses: {
              "200": {
                description: "description",
                schema: {
                  properties: {
                    data: {
                      items: {
                        type: "object",
                        properties: {
                          _id: {
                            type: "string"
                          },
                          data: {
                            $ref: "#/definitions/Product"
                          }
                        }
                      },
                      type: "array"
                    },
                    totalCount: {
                      type: "number"
                    }
                  },
                  type: "object"
                }
              }
            }
          }
        }
      }
    });
  });
});
