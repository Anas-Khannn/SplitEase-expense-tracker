const safeUserFields = ["user_id", "name", "email", "created_at", "updated_at"];

const formatUser = (user) => {
  const data = user.toJSON ? user.toJSON() : user;
  const safe = {};
  safeUserFields.forEach((field) => {
    safe[field] = data[field];
  });
  return safe;
};

module.exports = { formatUser };
