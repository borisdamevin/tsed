import {isArrayOrArrayClass, Type} from "@tsed/core";
import {IProvider, registerController} from "@tsed/di";
import {PathParamsType} from "../../interfaces";

export interface IControllerMiddlewares {
  useBefore: any[];
  use: any[];
  useAfter: any[];
}

export interface IControllerOptions extends Partial<IProvider<any>> {
  path?: PathParamsType;
  children?: Type<any>[];
  routerOptions?: any;
  middlewares?: Partial<IControllerMiddlewares>;
}

/**
 * Declare a new controller with his Rest path. His methods annotated will be collected to build the routing list.
 * This routing listing will be built with the `express.Router` object.
 *
 * ::: tip
 * See [Controllers](/docs/controllers.md) section for more details
 * :::
 *
 * ```typescript
 *  @Controller("/calendars")
 *  export provide CalendarCtrl {
 *
 *    @Get("/:id")
 *    public get(
 *      @Req() request: Req,
 *      @Res() response: Res,
 *      @Next() next: Next
 *    ): void {
 *
 *    }
 *  }
 * ```
 *
 * @param options
 * @param children
 * @returns {Function}
 * @decorator
 */
export function Controller(options: PathParamsType | IControllerOptions, ...children: Type<any>[]): Function {
  return (target: any): void => {
    if (typeof options === "string" || options instanceof RegExp || isArrayOrArrayClass(options)) {
      registerController({
        provide: target,
        path: options,
        children
      });
    } else {
      registerController({
        provide: target,
        children: (options as IControllerOptions).children,
        ...options
      });
    }
  };
}
