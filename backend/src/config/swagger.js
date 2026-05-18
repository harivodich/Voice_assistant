import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Voice Assistant Backend API",
      version: "1.0.0",
      description: "Backend API cho ứng dụng trợ lý ảo giọng nói",
      contact: {
        name: "API Support",
        email: "support@voice-assistant.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://api.voice-assistant.com",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from login endpoint",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email", "password"],
          properties: {
            id: {
              type: "string",
              description: "User ID",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password (min 6 characters)",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/User",
            },
            token: {
              type: "string",
              description: "JWT authentication token",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: {
                  type: "string",
                  description: "Error code",
                },
                message: {
                  type: "string",
                  description: "Error message",
                },
              },
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              description: "Server health status",
            },
            service: {
              type: "string",
              description: "Service name",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Response timestamp",
            },
          },
        },
        ChatRequest: {
          type: "object",
          required: ["message"],
          properties: {
            message: {
              type: "string",
              description: "Message to send to assistant",
            },
          },
        },
        ChatResponse: {
          type: "object",
          properties: {
            reply: {
              type: "string",
              description: "Assistant response",
            },
            action: {
              type: "object",
              description: "Action to be performed",
            },
          },
        },
        SpeakRequest: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              description: "Text to convert to speech",
            },
          },
        },
        HistoryResponse: {
          type: "object",
          properties: {
            conversations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    description: "Conversation ID",
                  },
                  message: {
                    type: "string",
                    description: "User message",
                  },
                  reply: {
                    type: "string",
                    description: "Assistant reply",
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time",
                    description: "Conversation timestamp",
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const specs = swaggerJsdoc(options);
