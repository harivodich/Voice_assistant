import { MEMORY_RULES } from "../constant/memory_patterns.js";
import {
  getUserProfile,
  updateUserProfile,
} from "../repository/userRepository.js";
import { cleanupAsrText } from "../utils/helper.js";

function isInvalidMemoryValue(value) {
  const invalid = ["gì", "bao nhiêu", "ở đâu", "khi nào", "là ai", "thế nào"];
  return invalid.some((k) => value.includes(k));
}

async function saveMemory(userId, field, value) {
  const profile = await getUserProfile(userId);

  const oldValue = profile?.[field];

  if (field === "hobbies") {
    const normalizedValue = typeof value === "string" ? value.trim() : value;

    const hobbies = new Set(profile.hobbies || []);

    if (hobbies.has(normalizedValue)) {
      return false;
    }

    hobbies.add(normalizedValue);

    await updateUserProfile(userId, {
      hobbies: [...hobbies],
    });

    return true;
  }

  if (oldValue === value) {
    return false;
  }

  await updateUserProfile(userId, {
    [field]: value,
  });

  return true;
}
export async function handlePersonalization(userId, text) {
  text = cleanupAsrText(text);

  for (const rule of MEMORY_RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);

      if (!match) continue;

      const value = rule.value || match[1]?.trim();

      if (!value || isInvalidMemoryValue(value)) {
        return null;
      }

      const saved = await saveMemory(userId, rule.field, value);

      if (!saved) {
        return null;
      }

      return rule.template.replace("{}", value);
    }
  }

  return null;
}
