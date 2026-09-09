import "server-only";

import type { Locale } from "./config";
import en from "@/messages/en.json";
import ti from "@/messages/ti.json";
import am from "@/messages/am.json";

const dictionaries = { en, ti, am } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
