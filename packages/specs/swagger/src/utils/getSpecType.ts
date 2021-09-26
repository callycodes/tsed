import {OpenSpec3} from "@tsed/openspec";
import {SpecTypes} from "@tsed/schema";

/**
 * @ignore
 * @param version
 */
export function getSpecType(version: string) {
  return SpecTypes.OPENAPI;
}

/**
 * @ignore
 * @param spec
 */
export function getSpecTypeFromSpec(spec: Partial<OpenSpec3>) {
  return SpecTypes.OPENAPI;
}
