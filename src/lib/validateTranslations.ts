import en from "../messages/en.json";
import sn from "../messages/sn.json";
import nd from "../messages/nd.json";

type JsonObject = { [key: string]: string | JsonObject | string[] };

function getAllKeys(obj: JsonObject | string[], prefix = ""): string[] {
  if (Array.isArray(obj)) {
    return obj.map((_, i) => `${prefix}[${i}]`);
  }

  return Object.keys(obj).reduce((keys: string[], key: string) => {
    const value = obj[key] as JsonObject | string[];
    const newPrefix = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      return [...keys, ...getAllKeys(value, newPrefix)];
    }

    return [...keys, newPrefix];
  }, []);
}

export function validateTranslationCompleteness(): {
  valid: boolean;
  missing: Record<string, string[]>;
} {
  const enKeys = new Set(getAllKeys(en as JsonObject));
  const snKeys = new Set(getAllKeys(sn as JsonObject));
  const ndKeys = new Set(getAllKeys(nd as JsonObject));

  const missing = {
    sn: [] as string[],
    nd: [] as string[],
  };

  enKeys.forEach((key) => {
    if (!snKeys.has(key)) missing.sn.push(key);
    if (!ndKeys.has(key)) missing.nd.push(key);
  });

  const valid = missing.sn.length === 0 && missing.nd.length === 0;

  if (!valid && process.env.NODE_ENV === "development") {
    console.warn("⚠️ TRANSATION INCOMPLETE WARN ⚠️");
    if (missing.sn.length > 0) {
      console.warn(`Missing Shona (sn) translations: ${missing.sn.join(", ")}`);
    }
    if (missing.nd.length > 0) {
      console.warn(`Missing Ndebele (nd) translations: ${missing.nd.join(", ")}`);
    }
  }

  return { valid, missing };
}
