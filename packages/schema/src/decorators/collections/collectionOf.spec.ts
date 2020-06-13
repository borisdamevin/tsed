import {expect} from "chai";
import {JsonSchemaStore} from "../../domain/JsonSchemaStore";
import {CollectionContains} from "./collectionContains";
import {CollectionOf} from "./collectionOf";

describe("@CollectionOf", () => {
  it("should declare a collection (Array of)", () => {
    // WHEN
    class Model {
      @CollectionOf(Number)
      num: number[];
    }

    // THEN
    const classSchema = JsonSchemaStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      properties: {
        num: {
          items: {
            type: "number"
          },
          type: "array"
        }
      },
      type: "object"
    });
  });
  it("should declare a collection (Map of)", () => {
    // WHEN
    class Model {
      @(CollectionOf(Number)
        .MinProperties(2)
        .MaxProperties(5))
      num: Map<string, number>;
    }

    // THEN
    const classSchema = JsonSchemaStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      properties: {
        num: {
          additionalProperties: {
            type: "number"
          },
          maxProperties: 5,
          minProperties: 2,
          type: "object"
        }
      },
      type: "object"
    });
  });
  it("should declare a collection (Set of)", () => {
    // WHEN
    class Model {
      @CollectionOf(Number)
      num: Set<number>;
    }

    // THEN
    const classSchema = JsonSchemaStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      properties: {
        num: {
          items: {
            type: "number"
          },
          type: "array",
          uniqueItems: true
        }
      },
      type: "object"
    });
  });
  it("should declare collection with additional props", () => {
    // WHEN
    class Model {
      @(CollectionOf(String)
        .MinItems(0)
        .MaxItems(10))
      words: string[];
    }

    // THEN
    const classSchema = JsonSchemaStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      properties: {
        words: {
          type: "array",
          items: {
            type: "string"
          },
          maxItems: 10,
          minItems: 0
        }
      },
      type: "object"
    });
  });
  it("should declare collection with additional props and contains", () => {
    // WHEN
    class Model {
      @(CollectionContains(String)
        .MinItems(0)
        .MaxItems(10))
      words: string[];
    }

    // THEN
    const classSchema = JsonSchemaStore.from(Model);

    expect(classSchema.schema.toJSON()).to.deep.equal({
      properties: {
        words: {
          type: "array",
          contains: {
            type: "string"
          },
          maxItems: 10,
          minItems: 0
        }
      },
      type: "object"
    });
  });
});
