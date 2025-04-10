// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  conversations: {
    allow: {
      view: "auth.id in data.ref('user.id')",
      create: "true",
      update: "auth.id in data.ref('user.id')",
      delete: "auth.id in data.ref('user.id')",
    },
  },
  messages: {
    allow: {
      view: "auth.id in data.ref('conversation.user.id')",
      create: "true",
      update: "auth.id in data.ref('conversation.user.id')",
      delete: "auth.id in data.ref('conversation.user.id')",
    },
  },
  $files: {
    allow: {
      view: "true",
      create: "true",
      delete: "true"
    }
  }
} satisfies InstantRules;

export default rules;
