import {GlobalProviders, ProviderType} from "@tsed/di";
import {ControllerProvider} from "../domain/ControllerProvider";
import {PlatformRouter} from "../services/PlatformRouter";

GlobalProviders.createRegistry(ProviderType.CONTROLLER, ControllerProvider, {
  onInvoke(provider: ControllerProvider, locals: any) {
    locals.set(PlatformRouter, provider.getRouter());
  }
});
