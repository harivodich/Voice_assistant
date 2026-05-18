export const MEMORY_RULES = [
  /* =========================
   * CONTROL RULES
   * ========================= */

  {
    field: "answer_length",
    patterns: [
      /\b(trả lời ngắn gọn|nói ngắn thôi|ngắn gọn thôi|đừng dài dòng)\b/i,
    ],
    value: "short",
    template: "Đã ghi nhớ bạn thích câu trả lời ngắn gọn.",
  },

  {
    field: "answer_length",
    patterns: [/giải thích (kỹ hơn|chi tiết hơn)/i],
    value: "detailed",
    template: "Đã ghi nhớ bạn thích giải thích chi tiết.",
  },

  {
    field: "tone",
    patterns: [/nói (lịch sự hơn|trang trọng hơn)/i],
    value: "formal",
    template: "Đã ghi nhớ phong cách trả lời lịch sự.",
  },

  {
    field: "tone",
    patterns: [/nói (tự nhiên|bình thường|thoải mái) thôi/i],
    value: "casual",
    template: "Đã ghi nhớ phong cách trả lời tự nhiên.",
  },

  /* =========================
   * PERSONAL INFO
   * ========================= */

  {
    field: "name",
    patterns: [/(?:tên tôi là|mình tên là|tôi tên là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ tên của bạn là {}.",
  },

  {
    field: "assistant_name",
    patterns: [
      /(?:tên (?:trợ lý|bạn) là|gọi (?:trợ lý|bạn) là|đặt tên (?:trợ lý|bạn) là)\s+(.+)/i,
      /assistant name is\s+(.+)/i,
    ],
    valueFromGroup: 1,
    template: "Đã ghi nhớ tên của tôi là {}.",
  },

  {
    field: "age",
    patterns: [/(?:tôi|mình)\s+(\d{1,3})\s+tuổi/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ bạn {} tuổi.",
  },

  {
    field: "hometown",
    patterns: [/(?:tôi quê ở|mình quê ở|quê tôi ở)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ quê của bạn là {}.",
  },

  {
    field: "location",
    patterns: [/(?:tôi sống ở|mình sống ở|tôi ở|mình ở)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ nơi ở của bạn là {}.",
  },

  {
    field: "education",
    patterns: [/(?:tôi học (?:ở|tại)|mình học (?:ở|tại))\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ bạn học tại {}.",
  },

  {
    field: "major",
    patterns: [/(?:tôi học ngành|mình học ngành|ngành của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ ngành học của bạn là {}.",
  },

  {
    field: "occupation",
    patterns: [/(?:tôi làm nghề|mình làm nghề|nghề của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ nghề nghiệp của bạn là {}.",
  },

  {
    field: "company",
    patterns: [/(?:tôi làm ở|mình làm ở|công ty của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ công ty của bạn là {}.",
  },

  /* =========================
   * PREFERENCES
   * ========================= */

  {
    field: "favorite_color",
    patterns: [/(?:tôi thích màu|màu yêu thích của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ màu yêu thích của bạn là {}.",
  },

  {
    field: "favorite_food",
    patterns: [/(?:tôi thích ăn|món yêu thích của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ món ăn yêu thích của bạn là {}.",
  },

  {
    field: "favorite_drink",
    patterns: [/(?:tôi thích uống|đồ uống yêu thích của tôi là)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ đồ uống yêu thích của bạn là {}.",
  },

  {
    field: "hobbies",
    patterns: [/(?:tôi thích|mình thích)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ sở thích của bạn là {}.",
  },

  {
    field: "pet",
    patterns: [/(?:tôi nuôi|mình nuôi|tôi có nuôi)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ thú cưng của bạn là {}.",
  },

  {
    field: "goal",
    patterns: [
      /mục tiêu của (?:tôi|mình) là\s+(.+)/i,
      /(?:tôi|mình)\s+muốn\s+(.+)/i,
    ],
    valueFromGroup: 1,
    template: "Đã ghi nhớ mục tiêu của bạn là {}.",
  },

  /* =========================
   * OTHER
   * ========================= */

  {
    field: "birthday",
    patterns: [/(?:sinh nhật tôi là|tôi sinh ngày|mình sinh ngày)\s+(.+)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ sinh nhật của bạn là {}.",
  },

  {
    field: "relationship_status",
    patterns: [
      /(độc thân|có người yêu|đã có người yêu|đã kết hôn|lấy vợ|lấy chồng)/i,
    ],
    valueFromGroup: 1,
    template: "Đã ghi nhớ tình trạng hiện tại của bạn là {}.",
  },

  {
    field: "gender",
    patterns: [/(?:tôi là|mình là)\s+(nam|nữ|phi nhị nguyên|không muốn nói)/i],
    valueFromGroup: 1,
    template: "Đã ghi nhớ giới tính của bạn là {}.",
  },
];

export const PROFILE_QUERY_PATTERNS = [
  {
    field: "name",
    patterns: [/(?:tên tôi là gì|tôi tên gì)/i],
    template: "Bạn tên là {}.",
  },

  {
    field: "assistant_name",
    patterns: [
      /(?:tên (?:trợ lý|bạn) là gì|bạn tên gì|tôi đặt tên bạn là gì)/i,
    ],
    template: "Tên của tôi là {}.",
  },

  {
    field: "age",
    patterns: [/(?:tôi bao nhiêu tuổi|tuổi tôi bao nhiêu)/i],
    template: "Bạn {} tuổi.",
  },

  {
    field: "hometown",
    patterns: [/(?:tôi quê ở đâu|quê tôi ở đâu)/i],
    template: "Bạn quê ở {}.",
  },

  {
    field: "location",
    patterns: [/(?:tôi sống ở đâu|tôi đang ở đâu)/i],
    template: "Bạn đang sống ở {}.",
  },

  {
    field: "education",
    patterns: [/(?:tôi học ở đâu|tôi học trường nào)/i],
    template: "Bạn học tại {}.",
  },

  {
    field: "major",
    patterns: [/(?:tôi học ngành gì|ngành của tôi là gì)/i],
    template: "Bạn học ngành {}.",
  },

  {
    field: "occupation",
    patterns: [/(?:tôi làm nghề gì|nghề của tôi là gì)/i],
    template: "Bạn làm {}.",
  },

  {
    field: "company",
    patterns: [/(?:tôi làm ở đâu|tôi làm công ty nào)/i],
    template: "Bạn làm tại {}.",
  },

  {
    field: "favorite_food",
    patterns: [/(?:món ăn yêu thích của tôi là gì|tôi thích ăn gì)/i],
    template: "Món ăn yêu thích của bạn là {}.",
  },

  {
    field: "favorite_color",
    patterns: [/(?:màu yêu thích của tôi là gì|tôi thích màu gì)/i],
    template: "Màu yêu thích của bạn là {}.",
  },

  {
    field: "favorite_drink",
    patterns: [/(?:đồ uống yêu thích của tôi là gì|tôi thích uống gì)/i],
    template: "Đồ uống yêu thích của bạn là {}.",
  },

  {
    field: "hobbies",
    patterns: [/(?:tôi thích gì|sở thích của tôi là gì)/i],
    template: "Bạn thích {}.",
  },

  {
    field: "pet",
    patterns: [/(?:tôi nuôi gì|tôi có thú cưng không|thú cưng của tôi là gì)/i],
    template: "Thú cưng của bạn là {}.",
  },

  {
    field: "goal",
    patterns: [/(?:mục tiêu của tôi là gì|tôi muốn gì)/i],
    template: "Mục tiêu của bạn là {}.",
  },

  {
    field: "birthday",
    patterns: [/(?:sinh nhật tôi khi nào|tôi sinh ngày nào)/i],
    template: "Sinh nhật của bạn là {}.",
  },

  {
    field: "gender",
    patterns: [/(?:giới tính của tôi là gì|tôi là nam hay nữ)/i],
    template: "Giới tính của bạn là {}.",
  },

  {
    field: "relationship_status",
    patterns: [/(?:tình trạng quan hệ của tôi|tôi có người yêu chưa)/i],
    template: "Bạn hiện {}.",
  },
];
