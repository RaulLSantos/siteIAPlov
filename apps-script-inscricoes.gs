const CABECALHOS = [
  "data",
  "nome",
  "email",
  "whatsapp",
  "whatsapp_normalizado",
  "email_normalizado",
  "evento",
  "origem",
  "status",
  "observacao"
];

function doGet(e) {
  const resultado = processarInscricao(e);
  return respostaJSONP(resultado, e.parameter.callback);
}

function doPost(e) {
  const resultado = processarInscricao(e);
  return respostaJSON(resultado);
}

function processarInscricao(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    garantirCabecalhos(sheet);

    const nome = String(e.parameter.nome || "").trim();
    const email = String(e.parameter.email || "").trim();
    const whatsapp = String(e.parameter.whatsapp || "").trim();
    const evento = String(e.parameter.evento || "Encontro de Casais").trim();
    const origem = String(e.parameter.origem || "Site").trim();

    const whatsappNormalizado = normalizarWhatsapp(e.parameter.whatsappNumeros || whatsapp);
    const emailNormalizado = normalizarEmail(email);

    if (!nome || !emailNormalizado || !whatsappNormalizado) {
      return {
        status: "erro",
        mensagem: "Preencha nome, e-mail e WhatsApp corretamente."
      };
    }

    const dados = sheet.getDataRange().getValues();

    const COL_WHATSAPP_NORMALIZADO = 4;
    const COL_EMAIL_NORMALIZADO = 5;

    let statusPlanilha = "Nova inscrição";
    let observacao = "-";
    let statusResposta = "sucesso";
    let mensagem = "Inscrição realizada com sucesso.";

    for (let i = 1; i < dados.length; i++) {
      const whatsappExistente = normalizarWhatsapp(dados[i][COL_WHATSAPP_NORMALIZADO]);
      const emailExistente = normalizarEmail(dados[i][COL_EMAIL_NORMALIZADO]);

      if (whatsappExistente && whatsappExistente === whatsappNormalizado) {
        statusPlanilha = "Duplicado";
        observacao = "WhatsApp já cadastrado";
        statusResposta = "duplicado";
        mensagem = "Este WhatsApp já possui uma inscrição cadastrada.";
        break;
      }

      if (emailExistente && emailExistente === emailNormalizado) {
        statusPlanilha = "Possível duplicado";
        observacao = "E-mail já cadastrado com WhatsApp diferente";
        statusResposta = "possivel_duplicado";
        mensagem = "Encontramos um e-mail já cadastrado. Sua inscrição foi registrada para análise.";
      }
    }

    sheet.appendRow([
      new Date(),
      nome,
      email,
      whatsapp,
      whatsappNormalizado,
      emailNormalizado,
      evento,
      origem,
      statusPlanilha,
      observacao
    ]);

    return {
      status: statusResposta,
      mensagem
    };
  } catch (erro) {
    return {
      status: "erro",
      mensagem: "Erro ao enviar inscrição. Tente novamente."
    };
  } finally {
    lock.releaseLock();
  }
}

function garantirCabecalhos(sheet) {
  const primeiraLinha = sheet.getRange(1, 1, 1, CABECALHOS.length).getValues()[0];
  const precisaCriar = CABECALHOS.some((cabecalho, index) => primeiraLinha[index] !== cabecalho);

  if (precisaCriar) {
    sheet.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
  }
}

function normalizarEmail(valor) {
  return String(valor || "").trim().toLowerCase();
}

function normalizarWhatsapp(valor) {
  let numeros = String(valor || "").replace(/\D/g, "");

  if (!numeros) return "";

  if (numeros.startsWith("55")) {
    numeros = numeros.slice(0, 13);
  } else {
    numeros = "55" + numeros.slice(0, 11);
  }

  return numeros.length === 13 ? numeros : "";
}

function respostaJSONP(objeto, callback) {
  const callbackSeguro = String(callback || "").replace(/[^\w.$]/g, "");

  if (!callbackSeguro) {
    return ContentService
      .createTextOutput('callback_invalido({"status":"erro","mensagem":"Callback inválido."});')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  const payload = JSON.stringify(objeto).replace(/</g, "\\u003c");

  return ContentService
    .createTextOutput(`${callbackSeguro}(${payload});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function respostaJSON(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
