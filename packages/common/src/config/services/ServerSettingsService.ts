import {Env} from "@tsed/core";
import {DIConfiguration, Injectable, ProviderScope, ProviderType} from "@tsed/di";
import {$log} from "@tsed/logger";
import * as Https from "https";
import {IErrorsSettings, ILoggerSettings, IServerMountDirectories} from "../interfaces";
import {IConverterSettings} from "../interfaces/IConverterSettings";

const rootDir = process.cwd();

/**
 * `ServerSettingsService` contains all information about your Server configuration.
 */
@Injectable({
  scope: ProviderScope.SINGLETON,
  global: true
})
export class ServerSettingsService extends DIConfiguration {
  constructor() {
    super({
      rootDir,
      env: (process.env.NODE_ENV as Env) || Env.DEV,
      httpPort: 8080,
      httpsPort: 8000,
      version: "1.0.0",
      uploadDir: "${rootDir}/uploads",
      scopes: {
        [ProviderType.CONTROLLER]: ProviderScope.SINGLETON
      },
      logger: {
        debug: false,
        level: "info",
        logRequest: true,
        jsonIndentation: process.env.NODE_ENV === Env.PROD ? 0 : 2
      },
      errors: {
        headerName: "errors"
      },
      mount: {
        "/rest": "${rootDir}/controllers/**/*.ts"
      },
      exclude: ["**/*.spec.ts", "**/*.spec.js"],
      componentsScan: [
        "${rootDir}/mvc/**/*.ts",
        "${rootDir}/services/**/*.ts",
        "${rootDir}/middlewares/**/*.ts",
        "${rootDir}/converters/**/*.ts"
      ]
    });
  }

  get version() {
    return this.getRaw("version");
  }

  set version(v: string) {
    this.setRaw("version", v);
  }

  get rootDir() {
    return this.getRaw("rootDir");
  }

  set rootDir(value: string) {
    this.setRaw("rootDir", value);
  }

  get port(): string | number | false {
    return this.httpPort;
  }

  set port(value: string | number | false) {
    this.httpPort = value;
  }

  get httpsOptions(): Https.ServerOptions {
    return this.getRaw("httpsOptions");
  }

  set httpsOptions(value: Https.ServerOptions) {
    this.setRaw("httpsOptions", value);
  }

  get httpPort(): string | number | false {
    return this.getRaw("httpPort");
  }

  set httpPort(value: string | number | false) {
    this.setRaw("httpPort", value);
  }

  get httpsPort(): string | number | false {
    return this.getRaw("httpsPort");
  }

  set httpsPort(value: string | number | false) {
    this.setRaw("httpsPort", value);
  }

  get uploadDir(): string {
    return this.get("uploadDir");
  }

  set uploadDir(value: string) {
    this.setRaw("uploadDir", value);
  }

  get env(): Env {
    return this.getRaw("env");
  }

  set env(value: Env) {
    this.setRaw("env", value);
  }

  get mount(): IServerMountDirectories {
    return this.get("mount");
  }

  set mount(value: IServerMountDirectories) {
    this.setRaw("mount", value);
  }

  get componentsScan(): string[] {
    return this.resolve(this.getRaw("componentsScan"));
  }

  set componentsScan(value: string[]) {
    this.setRaw("componentsScan", value);
  }

  get statics(): IServerMountDirectories {
    return this.getRaw("statics") || {};
  }

  set statics(value: IServerMountDirectories) {
    this.setRaw("statics", value);
  }


  get acceptMimes(): string[] {
    return this.getRaw("acceptMimes") || ["application/json"];
  }

  set acceptMimes(value: string[]) {
    this.setRaw("acceptMimes", value || []);
  }

  get debug(): boolean {
    return this.logger.level === "debug";
  }

  set debug(debug: boolean) {
    this.logger = {...this.logger, level: debug ? "debug" : "info"};
  }

  get converter(): Partial<IConverterSettings> {
    return this.get("converter") || {};
  }

  set converter(options: Partial<IConverterSettings>) {
    this.setRaw("converter", options);
  }

  get logger(): Partial<ILoggerSettings> {
    return this.get("logger");
  }

  set logger(value: Partial<ILoggerSettings>) {
    const logger = {...this.logger, ...value};
    logger.debug = logger.level === "debug";

    this.setRaw("logger", logger);
    this.setRaw("debug", logger.debug);

    if (logger.format) {
      $log.appenders.set("stdout", {
        type: "stdout",
        levels: ["info", "debug"],
        layout: {
          type: "pattern",
          pattern: logger.format
        }
      });

      $log.appenders.set("stderr", {
        levels: ["trace", "fatal", "error", "warn"],
        type: "stderr",
        layout: {
          type: "pattern",
          pattern: logger.format
        }
      });
    }
  }

  get exclude() {
    return this.get("exclude");
  }

  set exclude(exclude: string[]) {
    this.setRaw("exclude", exclude);
  }

  /**
   *
   * @returns {IRouterSettings}
   */
  get errors(): IErrorsSettings {
    return this.get("errors");
  }

  /**
   *
   * @param {IRouterSettings} options
   */
  set errors(options: IErrorsSettings) {
    this.setRaw("errors", options);
  }

  /**
   *
   * @param addressPort
   * @returns {{address: string, port: number}}
   */
  private static buildAddressAndPort(addressPort: string | number): {address: string; port: number} {
    let address = "0.0.0.0";
    let port = addressPort;

    if (typeof addressPort === "string" && addressPort.indexOf(":") > -1) {
      [address, port] = addressPort.split(":");
      port = +port;
    }

    return {address, port: port as number};
  }

  /**
   *
   * @returns {string|number}
   */
  getHttpPort(): {address: string; port: number} {
    return ServerSettingsService.buildAddressAndPort(this.getRaw("httpPort"));
  }

  /**
   *
   * @param settings
   */
  setHttpPort(settings: {address: string; port: number}) {
    this.setRaw("httpPort", `${settings.address}:${settings.port}`);
  }

  /**
   *
   * @returns {string|number}
   */
  getHttpsPort(): {address: string; port: number} {
    return ServerSettingsService.buildAddressAndPort(this.getRaw("httpsPort"));
  }

  /**
   *
   * @param settings
   */
  setHttpsPort(settings: {address: string; port: number}) {
    this.setRaw("httpsPort", `${settings.address}:${settings.port}`);
  }
}
