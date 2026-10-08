import type { FaqItem, Spec } from "@/lib/types";

/** أدوات تحويل بين صفوف النص في النموذج والمصفوفات — مشتركة بين الخادم والصفحة. */

export function joinLines(values: string[] | undefined): string {
  return (values ?? []).join("\n");
}

export function formatSpecs(specs: Spec[] | undefined): string {
  return (specs ?? []).map((s) => `${s.label} | ${s.value}`).join("\n");
}

export function formatFaqs(faqs: FaqItem[] | undefined): string {
  return (faqs ?? []).map((f) => `${f.question} | ${f.answer}`).join("\n");
}

export function parseLines(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseSpecs(raw: string): Spec[] {
  return parseLines(raw)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), value: rest.join("|").trim() };
    })
    .filter((spec) => spec.label || spec.value);
}

export function parseFaqs(raw: string): FaqItem[] {
  return parseLines(raw)
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return { question: (question ?? "").trim(), answer: rest.join("|").trim() };
    })
    .filter((faq) => faq.question || faq.answer);
}