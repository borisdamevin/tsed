import {ancestorsOf, DecoratorParameters, Deprecated, Store, Type} from "@tsed/core";
import {PROPERTIES_METADATA} from "../../converters/constants/index";
import {PropertyMetadata} from "../class/PropertyMetadata";

export class PropertyRegistry {
  /**
   *
   * @param target
   * @param propertyKey
   * @returns {PropertyMetadata}
   */
  static get(target: Type<any>, propertyKey: string | symbol): PropertyMetadata {
    const properties = this.getOwnProperties(target);

    if (!properties.has(propertyKey)) {
      this.set(target, propertyKey, new PropertyMetadata(target, propertyKey));
    }

    return properties.get(propertyKey)!;
  }

  /**
   *
   * @param target
   * @param options
   * @returns {Array}
   */
  static getProperties(target: Type<any>, options: Partial<{withIgnoredProps: boolean}> = {}): Map<string | symbol, PropertyMetadata> {
    const map = new Map<string | symbol, PropertyMetadata>();
    const ignored: string[] = [];

    ancestorsOf(target).forEach(klass => {
      this.getOwnProperties(klass).forEach((v: PropertyMetadata, k: string) => {
        /* istanbul ignore next */
        if (ignored.indexOf(k) !== -1) {
          return;
        }
        if (options.withIgnoredProps) {
          map.set(k, v);
        } else {
          if (!v.ignoreProperty) {
            map.set(k, v);
          } else {
            map.delete(k);
            ignored.push(k);
          }
        }
      });
    });

    return map;
  }

  /**
   *
   * @param {Type<any>} target
   * @returns {Map<string | symbol, PropertyMetadata>}
   */
  static getOwnProperties(target: Type<any>): Map<string | symbol, PropertyMetadata> {
    const store = Store.from(target);

    if (!store.has(PROPERTIES_METADATA)) {
      store.set(PROPERTIES_METADATA, new Map<string | symbol, PropertyMetadata>());
    }

    return store.get(PROPERTIES_METADATA);
  }

  /**
   *
   * @param target
   * @param propertyKey
   * @param property
   */
  static set(target: Type<any>, propertyKey: string | symbol, property: PropertyMetadata): void {
    const properties = this.getOwnProperties(target);

    properties.set(propertyKey, property);
  }
}
