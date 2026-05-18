import { User } from "../model/User.js";

function deepMerge(oldObj = {}, newObj = {}) {
  const result = structuredClone(oldObj);

  for (const key in newObj) {
    if (
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key]) &&
      typeof newObj[key] === "object" &&
      !Array.isArray(newObj[key])
    ) {
      result[key] = deepMerge(result[key], newObj[key]);
    } else {
      result[key] = newObj[key];
    }
  }

  return result;
}
export const findUserById = async (id, options = {}) => {
  const user = await User.findByPk(id, options);
  if (!user) throw new Error("User not found");
  return user;
};

export const findUserByEmail = async (email) => {
  const user = await User.findOne({ where: { email } });
  return user;
};

export const createUser = async ({ name, email, hashedPassword, profile }) => {
  const user = await User.create({ name, email, hashedPassword, profile });
  return user;
};

export const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, { attributes: ["id", "profile"] });
  return user?.profile || {};
};

export const updateUserProfile = async (userId, newData) => {
  const user = await User.findByPk(userId);
  if (!user) return null;

  user.profile = deepMerge(user.profile || {}, newData);

  await user.save();

  return user.profile;
};
