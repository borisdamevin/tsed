import {expect} from "chai";
import * as Proxyquire from "proxyquire";
import * as Sinon from "sinon";
import {FakeResponse} from "../../../../../../test/helper";

const middleware: any = Sinon.stub();
const useAfterStub: any = Sinon.stub();

const {Redirect} = Proxyquire.load("../../../../src/mvc/decorators/method/redirect", {
  "./useAfter": {UseAfter: useAfterStub}
});

class Test {}

describe("Redirect", () => {
  beforeEach(() => {
    useAfterStub.returns(middleware);
  });
  afterEach(() => useAfterStub.reset());
  describe("with one parameter", () => {
    it("should create middleware", () => {
      const descriptor = {};
      const options = "test";

      Redirect(options)(Test, "test", descriptor);

      expect(useAfterStub.args[0][0]).to.be.a("function");
      expect(middleware).to.have.been.calledWithExactly(Test, "test", descriptor);
    });

    it("should call response method", () => {
      const descriptor = {};
      const nextSpy = Sinon.stub();
      const response = new FakeResponse();
      const options = "test";
      Sinon.stub(response, "redirect");

      Redirect(options)(Test, "test", descriptor);
      const middleware = useAfterStub.args[0][0];

      middleware({}, response, nextSpy);

      // @ts-ignore
      expect(response.redirect).to.have.been.calledWithExactly("test");
      expect(nextSpy).to.have.been.calledWithExactly();
    });

    it("should call response method", () => {
      const descriptor = {};
      const nextSpy = Sinon.stub();
      const response = new FakeResponse();
      const options = "test";

      response.headersSent = true;
      Sinon.stub(response, "type");

      Redirect(options)(Test, "test", descriptor);
      const middleware = useAfterStub.args[0][0];

      middleware({}, response, nextSpy);
      expect(nextSpy).to.have.been.calledWithExactly();
    });
  });

  describe("with two parameters", () => {
    it("should call response method", () => {
      const nextSpy = Sinon.stub();
      const response = new FakeResponse();
      Sinon.stub(response, "redirect");

      const descriptor = {};
      Redirect(200, "test2")(Test, "test", descriptor);
      const middleware = useAfterStub.args[0][0];

      middleware({}, response, nextSpy);
      // @ts-ignore
      expect(response.redirect).to.have.been.calledWithExactly(200, "test2");
      expect(nextSpy).to.have.been.calledWithExactly();
    });
  });
});
