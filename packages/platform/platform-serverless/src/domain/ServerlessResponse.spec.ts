import {PlatformServerlessTest} from "@tsed/platform-serverless";

describe("ServerlessResponse", () => {
  beforeEach(() => PlatformServerlessTest.create());
  afterEach(() => PlatformServerlessTest.reset());
  describe("location()", () => {
    it("should set location", () => {
      const context = PlatformServerlessTest.createServerlessContext({
        endpoint: {} as any
      });

      context.response.location("/path/to");

      expect(context.response.getHeaders()).toEqual({
        location: "/path/to"
      });
    });
    it("should set location (back)", () => {
      const context = PlatformServerlessTest.createServerlessContext({
        endpoint: {} as any
      });

      context.request.headers["Referrer"] = "https://referrer.com";
      context.response.location("back");

      expect(context.response.getHeaders()).toEqual({
        location: "https://referrer.com"
      });
    });
  });
  describe("redirect()", () => {
    it("should set location", () => {
      const context = PlatformServerlessTest.createServerlessContext({
        endpoint: {} as any
      });

      context.response.redirect(301, "/path/to");

      expect(context.response.getHeaders()).toEqual({
        "content-length": 42,
        location: "/path/to"
      });
      expect(context.response.statusCode).toEqual(301);
      expect(context.response.getBody()).toEqual("Moved Permanently. Redirecting to /path/to");
    });
    it("should set location (back)", () => {
      const context = PlatformServerlessTest.createServerlessContext({
        endpoint: {} as any
      });

      context.request.headers["Referrer"] = "https://referrer.com";
      context.response.redirect(301, "back");

      expect(context.response.getHeaders()).toEqual({
        "content-length": 54,
        location: "https://referrer.com"
      });
      expect(context.response.statusCode).toEqual(301);
      expect(context.response.getStatus()).toEqual(301);
      expect(context.response.getContentLength()).toEqual(54);
      expect(context.response.getContentType()).toEqual("");
      expect(context.response.getBody()).toEqual("Moved Permanently. Redirecting to https://referrer.com");
    });
  });
});
