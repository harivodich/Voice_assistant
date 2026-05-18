import { getUserConversations } from "../repository/conversationRepository.js";

export const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await getUserConversations(userId);
    return res.status(200).json({ history });
  } catch (error) {
    console.error("Get History Error:", error);
    return res.status(500).json({
      error: "Failed to fetch chat history",
    });
  }
};
