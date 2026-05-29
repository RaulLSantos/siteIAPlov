const PASTA_FOTOS_NOME = "Fotos - Encontro de Casais";
const MAX_FOTO_BYTES = 3 * 1024 * 1024;
const TIPOS_FOTO_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];

const CABECALHOS = [
  "id_inscricao",
  "data",
  "nome",
  "email",
  "whatsapp",
  "whatsapp_normalizado",
  "email_normalizado",
  "evento",
  "origem",
  "status",
  "observacao",
  "foto_url",
  "foto_arquivo_id",
  "foto_nome",
  "mensagem_inicial_enviada",
  "data_mensagem_inicial",
  "confirmacao_enviada",
  "data_confirmacao",
  "erro_envio",
  "data_ultimo_processamento"
];

function doGet(e) {
  const resultado = processarInscricao(e);
  const parametros = (e && e.parameter) || {};
  return respostaJSONP(resultado, parametros.callback);
}

function doPost(e) {
  const resultado = processarInscricao(e);
  return respostaJSON(resultado);
}

function configurarPlanilha() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  garantirCabecalhos(sheet);
}

function testarInscricaoSemFoto() {
  return processarInscricao({
    parameter: {
      nome: "Teste Casal",
      email: "teste.casal@example.com",
      whatsapp: "(45) 99999-0001",
      whatsappNumeros: "5545999990001",
      evento: "Encontro de Casais",
      origem: "Teste Apps Script"
    }
  });
}

function testarInscricaoComFoto() {
  const png1x1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

  return processarInscricao({
    parameter: {
      nome: "Teste Casal Foto",
      email: "teste.casal.foto@example.com",
      whatsapp: "(45) 99999-0002",
      whatsappNumeros: "5545999990002",
      evento: "Encontro de Casais",
      origem: "Teste Apps Script",
      fotoBase64: png1x1,
      fotoNome: "teste-casal.png",
      fotoTipo: "image/png"
    }
  });
}

function processarInscricao(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const parametros = (e && e.parameter) || {};
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    garantirCabecalhos(sheet);

    const nome = String(parametros.nome || "").trim();
    const email = String(parametros.email || "").trim();
    const whatsapp = String(parametros.whatsapp || "").trim();
    const evento = String(parametros.evento || "Encontro de Casais").trim();
    const origem = String(parametros.origem || "Site").trim();

    const whatsappNormalizado = normalizarWhatsapp(parametros.whatsappNumeros || whatsapp);
    const emailNormalizado = normalizarEmail(email);

    if (!nome || !emailNormalizado || !whatsappNormalizado) {
      return {
        status: "erro",
        mensagem: "Preencha nome, e-mail e WhatsApp corretamente."
      };
    }

    const dados = sheet.getDataRange().getValues();
    const indices = criarMapaCabecalhos(sheet);

    let statusPlanilha = "Nova inscricao";
    let observacao = "-";
    let statusResposta = "sucesso";
    let mensagem = "Inscricao realizada com sucesso.";

    for (let i = 1; i < dados.length; i++) {
      const whatsappExistente = normalizarWhatsapp(dados[i][indices.whatsapp_normalizado]);
      const emailExistente = normalizarEmail(dados[i][indices.email_normalizado]);

      if (whatsappExistente && whatsappExistente === whatsappNormalizado) {
        statusPlanilha = "Duplicado";
        observacao = "WhatsApp ja cadastrado";
        statusResposta = "duplicado";
        mensagem = "Este WhatsApp ja possui uma inscricao cadastrada.";
        break;
      }

      if (emailExistente && emailExistente === emailNormalizado) {
        statusPlanilha = "Possivel duplicado";
        observacao = "E-mail ja cadastrado com WhatsApp diferente";
        statusResposta = "possivel_duplicado";
        mensagem = "Encontramos um e-mail ja cadastrado. Sua inscricao foi registrada para analise.";
      }
    }

    const idInscricao = Utilities.getUuid();
    const foto = salvarFotoNoDrive({
      fotoBase64: parametros.fotoBase64,
      fotoNome: parametros.fotoNome,
      fotoTipo: parametros.fotoTipo,
      nome,
      whatsappNormalizado,
      idInscricao
    });

    sheet.appendRow([
      idInscricao,
      new Date(),
      nome,
      email,
      whatsapp,
      whatsappNormalizado,
      emailNormalizado,
      evento,
      origem,
      statusPlanilha,
      observacao,
      foto.url,
      foto.id,
      foto.nome,
      "",
      "",
      "",
      "",
      "",
      ""
    ]);

    return {
      status: statusResposta,
      mensagem
    };
  } catch (erro) {
    return {
      status: "erro",
      mensagem: erro && erro.message ? erro.message : "Erro ao enviar inscricao. Tente novamente."
    };
  } finally {
    lock.releaseLock();
  }
}

function garantirCabecalhos(sheet) {
  sheet.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
}

function criarMapaCabecalhos(sheet) {
  const primeiraLinha = sheet.getRange(1, 1, 1, CABECALHOS.length).getValues()[0];
  return primeiraLinha.reduce(function (mapa, cabecalho, index) {
    mapa[cabecalho] = index;
    return mapa;
  }, {});
}

function salvarFotoNoDrive(dadosFoto) {
  if (!dadosFoto.fotoBase64) {
    return {
      url: "",
      id: "",
      nome: ""
    };
  }

  const tipo = String(dadosFoto.fotoTipo || "").trim();

  if (TIPOS_FOTO_PERMITIDOS.indexOf(tipo) === -1) {
    throw new Error("Envie uma foto nos formatos JPG, PNG ou WEBP.");
  }

  const base64 = String(dadosFoto.fotoBase64).replace(/^data:[^;]+;base64,/, "");
  const bytes = Utilities.base64Decode(base64);

  if (bytes.length > MAX_FOTO_BYTES) {
    throw new Error("A foto deve ter no maximo 3 MB.");
  }

  const extensao = extensaoPorTipo(tipo);
  const nomeArquivo = montarNomeArquivo(dadosFoto.nome, dadosFoto.whatsappNormalizado, dadosFoto.idInscricao, extensao);
  const blob = Utilities.newBlob(bytes, tipo, nomeArquivo);
  const pasta = obterOuCriarPastaFotos();
  const arquivo = pasta.createFile(blob);

  arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    url: arquivo.getUrl(),
    id: arquivo.getId(),
    nome: nomeArquivo
  };
}

function obterOuCriarPastaFotos() {
  const pastas = DriveApp.getFoldersByName(PASTA_FOTOS_NOME);

  if (pastas.hasNext()) {
    return pastas.next();
  }

  return DriveApp.createFolder(PASTA_FOTOS_NOME);
}

function montarNomeArquivo(nome, whatsappNormalizado, idInscricao, extensao) {
  const nomeLimpo = String(nome || "casal")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return [nomeLimpo || "casal", whatsappNormalizado, idInscricao].join("-") + "." + extensao;
}

function extensaoPorTipo(tipo) {
  if (tipo === "image/png") return "png";
  if (tipo === "image/webp") return "webp";
  return "jpg";
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
      .createTextOutput('callback_invalido({"status":"erro","mensagem":"Callback invalido."});')
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
