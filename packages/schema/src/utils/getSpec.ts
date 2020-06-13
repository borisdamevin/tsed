import {Type} from "@tsed/core";
import {JsonSchemaStore} from "../domain/JsonSchemaStore";
import {SpecTypes} from "../domain/SpecTypes";
import {JsonSerializerOptions} from "../interfaces";
import {buildPath} from "./buildPath";
import {getOperationStores} from "./getOperationsStores";
import {mergeOperation} from "./mergeOperation";
import {operationIdFormatter} from "./operationIdFormatter";

export interface SpecSerializerOptions extends JsonSerializerOptions {
  /**
   * Paths
   */
  paths?: any;
  /**
   *
   */
  rootPath?: string;
  /**
   *
   * @param target
   * @param propertyKey
   */
  operationIdFormatter?: (name: string, propertyKey: string, path: string) => string;
  /**
   *
   */
  operationIdPattern?: string;
}

const caches: Map<Type<any>, Map<string, any>> = new Map();

function get(model: Type<any>, options: any, cb: any) {
  if (!caches.has(model)) {
    caches.set(model, new Map());
  }

  const cache = caches.get(model)!;
  const key = JSON.stringify(options);

  if (!cache.has(key)) {
    cache.set(key, cb());
  }

  return cache.get(key);
}

/**
 * Return the swagger or open spec for the given class
 * @param model
 * @param options
 */
export function getSpec(model: Type<any>, options: SpecSerializerOptions = {}) {
  if (!options.spec || options.spec === SpecTypes.JSON) {
    options.spec = SpecTypes.SWAGGER;
  }

  options = {
    operationIdFormatter: options.operationIdFormatter || operationIdFormatter(options.operationIdPattern),
    ...options,
    root: false,
    spec: options.spec
  };

  return get(model, options, () => {
    const store = JsonSchemaStore.from(model);
    const {spec = SpecTypes.SWAGGER, schemas = {}, paths = {}, rootPath = "/"} = options;
    const ctrlPath = store.path;

    const specJson: any = {paths};

    getOperationStores(model).forEach(operationStore => {
      const operation = operationStore.operation!.toJSON({...options, spec, schemas});

      operationStore.operation!.operationPaths.forEach(({path, method}) => {
        if (method) {
          mergeOperation(specJson, operation, {
            rootPath: buildPath(rootPath + ctrlPath),
            path,
            method,
            operationId: (path: string) =>
              options.operationIdFormatter?.(
                operationStore.parent.schema.get("name") || operationStore.parent.targetName,
                operationStore.propertyName,
                path
              )
          });
        }
      });
    });

    if (spec === SpecTypes.OPENAPI) {
      specJson.components = {
        schemas
      };
    } else {
      specJson.definitions = schemas;
    }

    return specJson;
  });
}
