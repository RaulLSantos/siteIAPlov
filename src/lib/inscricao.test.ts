import { describe, expect, it } from "vitest";
import {
  createInscricaoPayload,
  digitsOnly,
  formatWhatsapp,
  localWhatsappDigits,
  MAX_PHOTO_BYTES,
  normalizedBrazilWhatsapp,
  validatePhotoFile,
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
          conjuge: "  Maria Santos ",
          email: "  RAUL@EMAIL.COM ",
          whatsapp: "+55 45 99999-9999",
        }),
      ).toEqual({
        nome: "Raul Santos",
        conjuge: "Maria Santos",
        email: "RAUL@EMAIL.COM",
        whatsapp: "(45) 99999-9999",
        whatsappNumeros: "5545999999999",
      });
    });

    it("inclui metadados da foto quando informada", () => {
      expect(
        createInscricaoPayload(
          {
            nome: "Raul Santos",
            conjuge: "Maria Santos",
            email: "raul@email.com",
            whatsapp: "45999999999",
          },
          {
            dataUrl: "data:image/jpeg;base64,abc",
            name: "casal.jpg",
            type: "image/jpeg",
          },
        ),
      ).toMatchObject({
        fotoBase64: "data:image/jpeg;base64,abc",
        fotoNome: "casal.jpg",
        fotoTipo: "image/jpeg",
      });
    });
  });

  describe("foto", () => {
    it("aceita foto ausente", () => {
      expect(validatePhotoFile(null)).toEqual({ valid: true });
    });

    it("aceita formatos de imagem permitidos", () => {
      expect(validatePhotoFile({ size: 1000, type: "image/jpeg" })).toEqual({ valid: true });
      expect(validatePhotoFile({ size: 1000, type: "image/pjpeg" })).toEqual({ valid: true });
      expect(validatePhotoFile({ size: 1000, type: "image/png" })).toEqual({ valid: true });
      expect(validatePhotoFile({ size: 1000, type: "image/webp" })).toEqual({ valid: true });
    });

    it("aceita jpg e jpeg pela extensao quando o navegador nao informa o tipo", () => {
      expect(validatePhotoFile({ name: "casal.jpg", size: 1000, type: "" })).toEqual({ valid: true });
      expect(validatePhotoFile({ name: "casal.jpeg", size: 1000, type: "" })).toEqual({ valid: true });
    });

    it("rejeita arquivo que nao e imagem permitida", () => {
      expect(validatePhotoFile({ name: "documento.pdf", size: 1000, type: "application/pdf" })).toEqual({
        valid: false,
        message: "Envie uma foto nos formatos JPEG, JPG, PNG ou WEBP.",
      });
    });

    it("rejeita imagem maior que o limite", () => {
      expect(validatePhotoFile({ size: MAX_PHOTO_BYTES + 1, type: "image/jpeg" })).toEqual({
        valid: false,
        message: "A foto deve ter no maximo 10 MB.",
      });
    });
  });
});
