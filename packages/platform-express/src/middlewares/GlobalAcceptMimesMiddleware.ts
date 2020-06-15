import {IMiddleware, Middleware, Req} from "@tsed/common";
import {Configuration} from "@tsed/di";
import {NotAcceptable} from "@tsed/exceptions";

/**
 * @middleware
 */
@Middleware()
export class GlobalAcceptMimesMiddleware implements IMiddleware {
  constructor(@Configuration() private configuration: Configuration) {}

  use(@Req() request: Req) {
    const find = this.configuration.acceptMimes.find((mime: any) => !!request.accepts(mime));

    if (!find) {
      throw new NotAcceptable(this.configuration.acceptMimes.join(", "));
    }
  }
}
