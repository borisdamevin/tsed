import {Type} from "@tsed/core";
import {JsonMapperMethods} from "../interfaces/JsonMapperMethods";

// tslint:disable-next-line:variable-name
const JsonMapperTypesContainer: Map<any, {token: Type<JsonMapperMethods>; instance: JsonMapperMethods}> = new Map();

export function registerJsonTypeMapper(type: any, token: Type<JsonMapperMethods>) {
  JsonMapperTypesContainer.set(type, {token, instance: new token()});
}

export function getJsonMapperTypes(): Map<any, JsonMapperMethods> {
  return new Map(
    Array.from(JsonMapperTypesContainer.entries()).map(([key, {instance}]) => {
      return [key, instance];
    })
  );
}
