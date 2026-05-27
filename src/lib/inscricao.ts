export interface InscricaoFormValues {
  nome: unknown;
  email: unknown;
  whatsapp: unknown;
}

export interface InscricaoPayload {
  nome: string;
  email: string;
  whatsapp: string;
  whatsappNumeros: string;
  evento: string;
  origem: string;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const toText = (value: unknown) => String(value ?? "");

export const digitsOnly = (value: unknown) => toText(value).replace(/\D/g, "");

export const localWhatsappDigits = (value: unknown) => {
  const digits = digitsOnly(value);

  if (digits.startsWith("55") && digits.length > 11) {
    return digits.slice(2, 13);
  }

  return digits.slice(0, 11);
};

export const normalizedBrazilWhatsapp = (value: unknown) => {
  const localDigits = localWhatsappDigits(value);
  return localDigits.length === 11 ? `55${localDigits}` : localDigits;
};

export const formatWhatsapp = (value: unknown) => {
  const digits = localWhatsappDigits(value);
  const ddd = digits.slice(0, 2);
  const firstPart = digits.slice(2, 7);
  const secondPart = digits.slice(7, 11);

  if (digits.length <= 2) {
    return ddd ? `(${ddd}` : "";
  }

  if (digits.length <= 7) {
    return `(${ddd}) ${firstPart}`;
  }

  return `(${ddd}) ${firstPart}-${secondPart}`;
};

export const validateInscricao = ({ nome, email, whatsapp }: InscricaoFormValues): ValidationResult => {
  const cleanNome = toText(nome).trim();
  const cleanEmail = toText(email).trim();
  const cleanWhatsapp = localWhatsappDigits(whatsapp);

  if (!cleanNome || !cleanEmail || cleanWhatsapp.length !== 11) {
    return {
      valid: false,
      message: "Preencha nome, e-mail e WhatsApp corretamente.",
    };
  }

  return { valid: true };
};

export const createInscricaoPayload = (values: InscricaoFormValues): InscricaoPayload => ({
  nome: toText(values.nome).trim(),
  email: toText(values.email).trim(),
  whatsapp: formatWhatsapp(values.whatsapp),
  whatsappNumeros: normalizedBrazilWhatsapp(values.whatsapp),
  evento: "Encontro de Casais",
  origem: "Site",
});
