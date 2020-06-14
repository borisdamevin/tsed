import {Controller, Get, MergeParams, PathParams, QueryParams, UseBefore} from "@tsed/common";
import {Hidden} from "../../../../../packages/swagger/src";
import {Test2Middleware} from "../../middlewares/middleware";

@Controller("/:eventId/tasks")
@MergeParams()
@UseBefore(Test2Middleware)
export class TaskCtrl {
  @Get("/")
  async get(@PathParams("test") value: string, @PathParams("eventId") id: string) {
    return {value, id};
  }

  @Get("/hidden")
  @Hidden()
  async getHidden() {
    return {};
  }

  @Get("/hiddenparam")
  async getHiddenParams(
    @Hidden()
    @QueryParams("token")
    t: string,
    @QueryParams("q") q: string
  ) {
    return {};
  }
}
