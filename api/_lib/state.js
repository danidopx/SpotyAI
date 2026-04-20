import crypto from "node:crypto";
import { getEnv } from "./env.js";

function toBase64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

export function encodeState(payload) {
  const secret = getEnv("SPOTYAI_STATE_SECRET");
  const json = JSON.stringify(payload);
  const encodedPayload = toBase64Url(json);
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function decodeState(input) {
  const secret = getEnv("SPOTYAI_STATE_SECRET");
  const [encodedPayload, signature] = String(input || "").split(".");

  if (!encodedPayload || !signature) {
    throw new Error("State invalido.");
  }

  const expected = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  if (signature !== expected) {
    throw new Error("Assinatura de state invalida.");
  }

  return JSON.parse(fromBase64Url(encodedPayload));
}

