#!/usr/bin/env node
const realLog = console.log;
console.log = (...args) => {
  process.stderr.write(`${args.join(" ")}\n`);
};

const registry = () => require("../src/utils/service-registry");

const printJson = (payload) => {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
};

const positionals = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const shouldSync = process.argv.includes("--sync");

const [target, rawArgs] = positionals;

if (!target || target === "--list" || target === "-l") {
  printJson({ success: true, services: registry().listServices() });
  process.exit(0);
}

const [serviceName, methodName] = target.split(".");

if (!serviceName || !methodName) {
  printJson({
    success: false,
    error: `Expected <service>.<method> [argsJson] or --list, got "${target}"`,
  });
  process.exit(1);
}

let args = [];
if (rawArgs) {
  try {
    args = JSON.parse(rawArgs);
    if (!Array.isArray(args)) throw new Error("expected a JSON array");
  } catch (error) {
    printJson({ success: false, error: `Invalid args JSON: ${error.message}` });
    process.exit(1);
  }
}

const run = async () => {
  if (shouldSync) {
    const { sequelize } = require("../src/database/models");
    await sequelize.sync();
  }

  const entry = registry().getServiceMethod(serviceName, methodName);

  if (!entry) {
    printJson({
      success: false,
      error: `Unknown service method "${target}". Use --list to see available services.`,
    });
    process.exit(1);
  }

  try {
    const result = await entry.method(...args);
    printJson({ success: true, service: serviceName, method: methodName, result });
  } catch (error) {
    const statusCode = error && error.statusCode ? error.statusCode : undefined;
    printJson({
      success: false,
      service: serviceName,
      method: methodName,
      error: error && error.message ? error.message : String(error),
      statusCode,
    });
    process.exit(1);
  }
};

run();