import { describe, expect, it } from "vitest";
import {
  createInscricaoPayload,
  digitsOnly,
  formatWhatsapp,
  localWhatsappDigits,
  normalizedBrazilWhatsapp,
  validateInscricao,
} from "./inscricao";

describe("inscricao helpers", () => {
  describe("digitsOnly", () => {
    it("remove caracteres que nao sao numeros", () => {
      expect(digitsOnly("+55 (45) 99999-9999")).toBe("5545999999999");
    });

    it("trata valores nulos e indefinidos como vazio", () => {
      expect(digitsOnly(null)).toBe("");
      expect(digitsOnly(undefined)).toBe("");
    });

    it("aceita tipos inesperados sem quebrar", () => {
      expect(digitsOnly(45999999999)).toBe("45999999999");
      expect(digitsOnly({ phone: "45999999999" })).toBe("");
    });
  });

  describe("normalizacao de WhatsApp", () => {
    it("trata formatos locais como o mesmo numero com DDI 55", () => {
      expect(normalizedBrazilWhatsapp("(45) 99999-9999")).toBe("5545999999999");
      expect(normalizedBrazilWhatsapp("45 99999-9999")).toBe("5545999999999");
      expect(normalizedBrazilWhatsapp("45999999999")).toBe("5545999999999");
      expect(normalizedBrazilWhatsapp("+55 45 99999-9999")).toBe("5545999999999");
    });

    it("extrai o numero local quando o DDI ja foi informado", () => {
      expect(localWhatsappDigits("+55 45 99999-9999")).toBe("45999999999");
    });

    it("nao considera numeros incompletos como normalizados com DDI", () => {
      expect(normalizedBrazilWhatsapp("4599999")).toBe("4599999");
      expect(normalizedBrazilWhatsapp("abc")).toBe("");
    });

    it("formata o campo visualmente com DDD", () => {
      expect(formatWhatsapp("45999999999")).toBe("(45) 99999-9999");
      expect(formatWhatsapp("+55 45 99999-9999")).toBe("(45) 99999-9999");
    });
  });

  describe("validacao", () => {
    const validValues = {
      nome: "Raul Santos",
      email: "raul@example.com",
      whatsapp: "(45) 99999-9999",
    };

    it("aceita cadastro valido", () => {
      expect(validateInscricao(validValues)).toEqual({ valid: true });
    });

    it("rejeita nome vazio", () => {
      expect(validateInscricao({ ...validValues, nome: " " }).valid).toBe(false);
    });

    it("rejeita email vazio", () => {
      expect(validateInscricao({ ...validValues, email: " " }).valid).toBe(false);
    });

    it("rejeita whatsapp vazio ou invalido", () => {
      expect(validateInscricao({ ...validValues, whatsapp: "" }).valid).toBe(false);
      expect(validateInscricao({ ...validValues, whatsapp: "123" }).valid).toBe(false);
    });

    it("rejeita valores nulos", () => {
      expect(validateInscricao({ nome: null, email: null, whatsapp: null }).valid).toBe(false);
    });

    it("nao quebra com tipos incorretos", () => {
      expect(validateInscricao({ nome: 123, email: true, whatsapp: { value: "45999999999" } }).valid).toBe(false);
    });
  });

  describe("payload", () => {
    it("cria payload pronto para o Apps Script", () => {
      expect(
        createInscricaoPayload({
          nome: "  Raul Santos ",
          email: "  RAUL@EMAIL.COM ",
          whatsapp: "+55 45 99999-9999",
        }),
      ).toEqual({
        nome: "Raul Santos",
        email: "RAUL@EMAIL.COM",
        whatsapp: "(45) 99999-9999",
        whatsappNumeros: "5545999999999",
        evento: "Encontro de Casais",
        origem: "Site",
      });
    });
  });
});
