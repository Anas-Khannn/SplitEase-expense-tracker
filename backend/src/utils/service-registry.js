const services = {
  auth: require("../services/auth.service"),
  group: require("../services/group.service"),
  expense: require("../services/expense.service"),
  balance: require("../services/balance.service"),
  payment: require("../services/payment.service"),
  activity: require("../services/activity.service"),
  reaction: require("../services/reaction.service"),
  summary: require("../services/summary.service"),
  dashboard: require("../services/dashboard.service"),
};

const listServices = () => {
  return Object.entries(services).map(([name, service]) => ({
    service: name,
    methods: Object.keys(service).filter((key) => typeof service[key] === "function"),
  }));
};

const getServiceMethod = (serviceName, methodName) => {
  const service = services[serviceName];
  if (!service) return null;

  const method = service[methodName];
  if (typeof method !== "function") return null;

  return { service, method };
};

module.exports = { listServices, getServiceMethod, services };