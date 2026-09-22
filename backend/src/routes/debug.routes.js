const express = require("express");
const router = express.Router();
const { getServiceMethod, listServices } = require("../utils/service-registry");
const HTTP_STATUSES = require("../constants/http-statuses");

router.get("/services", (req, res) => {
  return res.status(HTTP_STATUSES.OK).json({
    success: true,
    services: listServices(),
  });
});

router.get("/service/:service/:method", async (req, res) => {
  const serviceName = req.params.service;
  const methodName = req.params.method;

  const entry = getServiceMethod(serviceName, methodName);

  if (!entry) {
    return res.status(HTTP_STATUSES.NOT_FOUND).json({
      success: false,
      error: `Unknown service method "${serviceName}.${methodName}"`,
    });
  }

  let args = [];
  if (req.query.args) {
    try {
      args = JSON.parse(req.query.args);
    } catch (error) {
      return res.status(HTTP_STATUSES.BAD_REQUEST).json({
        success: false,
        error: `args must be a valid JSON array: ${error.message}`,
      });
    }
  }

  try {
    const result = await entry.method(...args);
    return res.status(HTTP_STATUSES.OK).json({
      success: true,
      service: serviceName,
      method: methodName,
      result,
    });
  } catch (error) {
    const status =
      error && error.statusCode
        ? error.statusCode
        : HTTP_STATUSES.INTERNAL_SERVER_ERROR;

    return res.status(status).json({
      success: false,
      service: serviceName,
      method: methodName,
      error: error && error.message ? error.message : String(error),
    });
  }
});

module.exports = router;