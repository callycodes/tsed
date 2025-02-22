import {Env, Type} from "@tsed/core";
import {createContainer, InjectorService, setLoggerLevel} from "@tsed/di";
import {$log, Logger} from "@tsed/logger";
import {JsonEntityStore} from "@tsed/schema";
import type {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
  APIGatewayProxyHandler,
  APIGatewayProxyResult,
  Context
} from "aws-lambda";
import {v4} from "uuid";
import {ServerlessContext} from "../domain/ServerlessContext";
import {PlatformServerlessHandler} from "./PlatformServerlessHandler";

function getReqId(event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>, context: Context) {
  if (event?.headers && event.headers["x-request-id"]) {
    return event.headers["x-request-id"];
  }

  return event?.requestContext?.requestId || context?.awsRequestId || v4().replace(/-/gi, "");
}

/**
 * @platform
 */
export class PlatformServerless {
  readonly name: string = "PlatformServerless";

  #injector: InjectorService;
  #promise: Promise<void>;

  get injector(): InjectorService {
    return this.#injector;
  }

  get settings() {
    return this.injector.settings;
  }

  get promise() {
    return this.#promise;
  }

  static bootstrap(settings: Partial<TsED.Configuration> & {lambda?: Type[]} = {}): PlatformServerless {
    const platform = new PlatformServerless();

    platform.bootstrap(settings);

    return platform;
  }

  public callbacks(tokens: Type | Type[] = [], exports = {}): Record<string, APIGatewayProxyHandler> {
    return this.settings
      .get<Type[]>("lambda", [])
      .concat(tokens)
      .map((token) => {
        const store = JsonEntityStore.from(token);

        return [...store.children.values()].reduce((list, store) => {
          const operationId = store.operation?.get("operationId");

          return operationId ? [...list, {store, operationId}] : list;
        }, []);
      })
      .flat()
      .reduce((exports, {store, operationId}) => {
        return {
          ...exports,
          [operationId]: this.callback(store.token, store.propertyName)
        };
      }, exports);
  }

  public callback(token: Type<any>, propertyKey: string): APIGatewayProxyHandler {
    const entity = JsonEntityStore.fromMethod(token, propertyKey);
    let handler: ($ctx: ServerlessContext) => Promise<APIGatewayProxyResult>;

    return async (event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>, context: Context) => {
      await this.#promise;

      if (!handler) {
        const platformHandler = this.#injector.get<PlatformServerlessHandler>(PlatformServerlessHandler)!;
        handler = await platformHandler.createHandler(token, propertyKey);
      }

      const $ctx = new ServerlessContext({
        event,
        context,
        id: getReqId(event, context),
        logger: this.injector.logger as Logger,
        injector: this.injector,
        endpoint: entity
      });

      return handler($ctx);
    };
  }

  public async ready() {
    await this.#injector.emit("$onReady");
  }

  public async stop() {
    await this.#injector.emit("$onDestroy");
    return this.injector.destroy();
  }

  protected bootstrap(settings: Partial<TsED.Configuration> = {}) {
    this.#promise = this.createInjector({
      ...settings,
      PLATFORM_NAME: this.name
    })
      .loadInjector()
      .then(() => this.ready());

    return this;
  }

  protected createInjector(settings: any) {
    this.#injector = new InjectorService();
    this.#injector.logger = $log;
    this.#injector.settings.set(settings);

    if (this.#injector.settings.get("env") === Env.TEST && !settings?.logger?.level) {
      $log.stop();
    }

    return this;
  }

  protected async loadInjector() {
    const container = createContainer();

    setLoggerLevel(this.#injector);

    await this.#injector.emit("$beforeInit");

    await this.#injector.load(container);

    await this.#injector.emit("$afterInit");
  }
}
