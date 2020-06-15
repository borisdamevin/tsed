import {ErrorObject, Options} from "ajv";

/**
 *
 */
export interface AjvErrorObject extends ErrorObject {
  modelName: string;
}

/**
 *
 */
export type ErrorFormatter = (error: AjvErrorObject) => string;

/**
 *
 */
export interface IAjvSettings extends Options {
  errorFormatter?: ErrorFormatter;
}
