import {PLATFORM_ROUTER_OPTIONS, PlatformHandler, PlatformRouter} from "@tsed/common";
import {Configuration, Inject, OverrideProvider} from "@tsed/di";
import * as Express from "express";

declare global {
  namespace TsED {
    export interface Router extends Express.Router {}
  }
}

@OverrideProvider(PlatformRouter)
export class PlatformExpressRouter extends PlatformRouter {
  constructor(
    platform: PlatformHandler,
    @Configuration() configuration: Configuration,
    @Inject(PLATFORM_ROUTER_OPTIONS) routerOptions: any
  ) {
    super(platform);

    this.raw = Express.Router(Object.assign({}, configuration.routers, routerOptions));
  }
}
