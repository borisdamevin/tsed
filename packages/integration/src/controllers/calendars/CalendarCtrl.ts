import {
  BodyParams,
  ContentType,
  Context,
  Controller,
  CookiesParams,
  Delete,
  Get,
  Header,
  HeaderParams,
  Locals,
  Next,
  PathParams,
  Post,
  Put,
  QueryParams,
  Req,
  Request,
  Required,
  Res,
  Response,
  Status,
  Use,
  UseAfter
} from "@tsed/common";
import {MulterFileSize, MultipartFile} from "@tsed/multipartfiles";
import {Deprecated, Description, Returns, Security} from "@tsed/swagger";
import * as Express from "express";
import {OAuth} from "../../decorators/oauth";
import {CalendarModel} from "../../models/Calendar";
import {TokenService} from "../../services/TokenService";
import {BaseController} from "../base/BaseController";
import {EventCtrl} from "./EventCtrl";

interface ICalendar {
  id: string;
  name: string;
}

/**
 * Add @ControllerProvider annotation to declare your provide as Router controller. The first param is the global path for your controller.
 * The others params is the children controllers.
 *
 * In this case, EventCtrl is a dependency of CalendarCtrl. All routes of EventCtrl will be mounted on the `/calendars` path.
 */
@Controller("/calendars", EventCtrl)
@Description("Controller description")
export class CalendarCtrl extends BaseController {
  constructor(private tokenService: TokenService) {
    super(tokenService);
  }

  /**
   *
   * @param request
   * @param response
   * @param next
   */
  static middleware(request: any, response: Express.Response, next: Express.NextFunction) {
    request["user"] = 1;
    response.locals.id = "local-10909";
    request.ctx.set("uid", "ctx-10909");

    // console.log(request.headers)
    next();
  }

  /**
   *
   * @param request
   * @param response
   * @param next
   */
  static middleware2(request: Req, response: Res, next: Next) {
    request.ctx.data.id = 10909;

    // console.log(request.headers)
    next();
  }

  /**
   * Example of classic call. Use `@Get` for routing a request to your method.
   * In this case, this route "/calendar/classic/:id" are mounted on the "integration/" path (call /integration/calendar/classic/:id
   * to test your service).
   *
   * By default, the response is sent with status 200 and is serialized in JSON.
   *
   * @param request
   * @param response
   * @returns {{id: any, name: string}}
   */
  @Get("/classic/:id")
  public findClassic(request: any, response: any): CalendarModel {
    const model = new CalendarModel();
    model.id = request.params.id;
    model.name = "test";

    return model;
  }

  @Get("/token")
  public getToken(@CookiesParams("authorization") authorization: string): string {
    if (authorization) {
      const token = this.tokenService.token();

      return token;
      // console.log('TOKEN', this.tokenService, token);
    }

    return "";
  }

  @Get("/token/:token")
  public updateToken(
    @PathParams("token")
    @Description("Token required to update token")
    token: string
  ): string {
    this.tokenService.token(token);

    return "token updated";
  }

  /**
   * Example of customised call. You can use decorators to inject express object like `response` as `@Response`,
   * `request` as `@Request` and `next` as `@Next`.
   *
   * Another decorators are available to access quickly to the pathParams request. `@PathParamsType` take an expression in
   * first parameter.
   *
   * @param request
   * @param id
   * @param next
   * @param response
   * @returns {{id: any, name: string}}
   */

  @Get("/annotation/test/:id")
  public findWithAnnotation(
    @Response() response: Express.Response,
    @PathParams("id")
    @Required()
    id: string
  ): void {
    const model = new CalendarModel();
    model.id = "1";
    model.name = "test";

    response.status(200).json(model);
  }

  /**
   * Your method can return a Promise to respond to a request.
   *
   * By default, the response is sent with status 200 and is serialized in JSON.
   *
   * @param id
   * @returns {Promise<ICalendar>}
   */
  @Get("/annotation/promised/:id")
  public findWithPromise(@PathParams("id") id: string): Promise<ICalendar> {
    //
    const model = new CalendarModel();
    model.id = id;
    model.name = "test";

    return new Promise<ICalendar>((resolve, reject) => {
      resolve(model);
    });
  }

  /**
   * Your method can return a Promise to respond to a request.
   *
   * By default, the response is sent with status 200 and is serialized in JSON.
   *
   * @param request Express request
   * @param response Express response
   * @param id
   * @returns {Promise<ICalendar>}
   */
  @Get("/annotation/status/:id")
  public findAndChangeStatusCode(
    @Request() request: Express.Request,
    @Response() response: Express.Response,
    @PathParams("id") id: string
  ): Promise<ICalendar> {
    const model = new CalendarModel();
    model.id = id;
    model.name = "test";

    return new Promise<ICalendar>((resolve, reject) => {
      response.status(202);

      resolve(model);
    });
  }

  @Get("/query")
  public getQuery(@QueryParams("search") search: string, @Request() request: any): string {
    return search || "EMPTY";
  }

  /**
   *
   * @param auth
   * @param name
   * @returns {{id: number, name: string}}
   */
  @Put("/")
  @Returns(CalendarModel)
  public save(
    @BodyParams("name")
    @Required()
    name: string
  ): CalendarModel {
    const model = new CalendarModel();
    model.id = "2";
    model.name = "test";

    return model;
  }

  @Delete("/")
  @Status(204)
  @Security("global_auth", "read:global")
  @Security("calendar_auth", "write:calendar", "read:calendar")
  public remove(
    @BodyParams("id")
    @Required()
    id: string
  ): void {
    return undefined;
  }

  @Delete("/token")
  @Status(204)
  @OAuth({role: "admin", scopes: ["write:calendar", "read:calendar"]})
  public removeWithToken(@BodyParams("id") @Required() id: string): void {
    return undefined;
  }

  /**
   *
   * @param request
   * @param auth
   * @returns {{user: (number|any|string)}}
   */
  @Get("/middleware")
  @Use(CalendarCtrl.middleware)
  public getWithMiddleware(@Request() request: any, @HeaderParams("authorization") auth: string): any {
    return {
      user: request.user,
      token: auth
    };
  }

  @Get("/mvc")
  @Use(CalendarCtrl.middleware)
  public testStackMiddlewares(@Request("user") user: any, @Locals("id") id: any, @Context("uid") uid: string): CalendarModel {
    const model = new CalendarModel();
    model.id = `${user}-${id}-${uid}`;
    model.name = "test";

    return model;
  }

  @Get("/middlewares2")
  @UseAfter(CalendarCtrl.middleware2)
  public testUseAfter(@Request("user") user: any): Object {
    const model = new CalendarModel();
    model.id = user;
    model.name = "test";

    return model;
  }

  /**
   * Test the Header decorators.
   * @param request
   * @returns {{id: any, name: string}}
   */
  @Get("/headers")
  @Header("x-token-test", "test")
  @Header("x-token-test-2", "test2")
  @Status(200)
  @ContentType("application/xml")
  @Deprecated()
  testResponseHeader(@Request() request: Express.Request) {
    return "<xml></xml>";
  }

  @Post("/documents")
  testMultipart(@MultipartFile("files") files: any[]) {
    return files;
  }

  @Post("/documents/1")
  @MulterFileSize(2048)
  testMultipart2(@MultipartFile("file1") file: any) {
    console.log("====>", file);

    return "DONE";
  }
}
