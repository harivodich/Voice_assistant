import { Conversation } from "../model/Conversation.js";

export const createMessage = async (userId, role, content) => {
  return await Conversation.create({
    userId,
    role,
    content,
  });
};

// GET USER CONVERSATIONS
export const getUserConversations = async (userId) => {
  return await Conversation.findAll({
    where: {
      userId,
    },
    order: [["createdAt", "DESC"]],
  });
};

// DELETE CONVERSATION
export const deleteConversation = async (conversationId) => {
  return await Conversation.destroy({
    where: {
      conversationId,
    },
  });
};

// GET LATEST MESSAGE
export const getLatestMessage = async (conversationId) => {
  return await Conversation.findOne({
    where: {
      conversationId,
    },
    order: [["createdAt", "DESC"]],
  });
};
