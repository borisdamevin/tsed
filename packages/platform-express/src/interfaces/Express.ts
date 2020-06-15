import {RequestContext} from "@tsed/common";

namespace Express {
  export interface NextFunction extends Function {
    isCalled: boolean;
  }

  export interface Response {
    headersSent: boolean;
  }

  export interface Application {}

  export interface Request {
    id: string;
    ctx: RequestContext;
  }
}
