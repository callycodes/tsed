import {InjectorService} from "@tsed/di";
import {PlatformContext} from "../domain/PlatformContext";
import {PlatformRequest} from "../services/PlatformRequest";
import {PlatformResponse} from "../services/PlatformResponse";
import {IncomingEvent} from "../interfaces/IncomingEvent";
import {PlatformViews} from "@tsed/platform-views";

const uuidv4 = require("uuid").v4;
const defaultReqIdBuilder = (req: any) => req.get("x-request-id") || uuidv4().replace(/-/gi, "");

/**
 * Create the TsED context to wrap request, response, injector, etc...
 * @param injector
 * @ignore
 */
export function createContext(injector: InjectorService) {
  const ResponseKlass = injector.getProvider(PlatformResponse)?.useClass;
  const RequestKlass = injector.getProvider(PlatformRequest)?.useClass;
  const platformViews = injector.get<PlatformViews>(PlatformViews)!;
  const {reqIdBuilder = defaultReqIdBuilder, ...loggerOptions} = injector.settings.logger || {};

  return async (event: IncomingEvent): Promise<PlatformContext> => {
    const ctx = new PlatformContext({
      event,
      id: reqIdBuilder(event.request),
      logger: injector.logger,
      ...loggerOptions,
      injector,
      ResponseKlass,
      RequestKlass
    });

    ctx.response.platformViews = platformViews;

    ctx.response.onEnd(async () => {
      await ctx.emit("$onResponse", ctx);
      await ctx.destroy();
    });

    await ctx.emit("$onRequest", ctx);

    return ctx;
  };
}
