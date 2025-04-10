// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  conversations: {
    allow: {
      view: "data.user.id == auth.id",
      create: "true",
      update: "data.user.id == auth.id",
      delete: "data.user.id == auth.id",
    },
  },
  messages: {
    allow: {
      view: "data.ref('conversation.user.id') == auth.id",
      create: "true",
      update: "data.ref('conversation.user.id') == auth.id",
      delete: "data.ref('conversation.user.id') == auth.id",
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
