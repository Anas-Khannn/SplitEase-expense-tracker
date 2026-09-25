const HEARTBEAT_INTERVAL_MS = 15000;
const MAX_CONNECTION_LIFETIME_MS = 45000;

const clientGroups = new Map();

const setSSEHeaders = (res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
};

const addClient = (userId, res) => {
  let group = clientGroups.get(String(userId));
  if (!group) {
    group = new Set();
    clientGroups.set(String(userId), group);
  }
  group.add(res);
  res.write(": connected\n\n");
};

const removeClient = (userId, res) => {
  const group = clientGroups.get(String(userId));
  if (!group) return;
  group.delete(res);
  if (group.size === 0) {
    clientGroups.delete(String(userId));
  }
};

const closeClient = (userId, res) => {
  removeClient(userId, res);
  try {
    res.end();
  } catch {
    // client already disconnected
  }
};

const broadcast = (userId, data) => {
  const group = clientGroups.get(String(userId));
  if (!group || group.size === 0) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;

  for (const res of group) {
    try {
      res.write(payload);
    } catch {
      removeClient(userId, res);
    }
  }
};

setInterval(() => {
  for (const [userId, group] of clientGroups) {
    for (const res of group) {
      try {
        res.write(": ping\n\n");
      } catch {
        removeClient(userId, res);
      }
    }
  }
}, HEARTBEAT_INTERVAL_MS).unref();

module.exports = {
  MAX_CONNECTION_LIFETIME_MS,
  setSSEHeaders,
  addClient,
  removeClient,
  closeClient,
  broadcast,
};
