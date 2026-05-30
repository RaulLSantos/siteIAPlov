const PASTA_FOTOS_NOME = "Fotos - Encontro de Casais";
const MAX_FOTO_BYTES = 10 * 1024 * 1024;
const TIPOS_FOTO_PERMITIDOS = ["image/jpeg", "image/pjpeg", "image/png", "image/webp"];
const VERSAO_SCRIPT = "inscricao-simples-2026-05-29";

const CABECALHOS = [
  "id_inscricao",
  "data",
  "nome",
  "conjuge",
  "email",
  "whatsapp",
  "whatsapp_normalizado",
  "email_normalizado",
  "status",
  "observacao",
  "foto_url",
  "foto_arquivo_id",
  "foto_nome"
];

function doGet() {
  return respostaJSON({
    status: "ok",
    mensagem: "Endpoint de inscricao ativo. Use POST para cadastrar.",
    versao: VERSAO_SCRIPT
  });
}

function doPost(e) {
  const resultado = processarInscricao(e);
  return respostaJSON(resultado);
}

function configurarPlanilha() {
  migrarPlanilhaParaColunasAtuais();
}

function migrarPlanilhaParaColunasAtuais() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const dados = sheet.getDataRange().getValues();

  if (dados.length === 0 || dados[0].every(function (valor) { return String(valor || "").trim() === ""; })) {
    sheet.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
    removerColunasExtras(sheet);
    return;
  }

  const cabecalhosAtuais = dados[0].map(function (cabecalho) {
    return String(cabecalho || "").trim();
  });
  const indices = criarMapaPorLista(cabecalhosAtuais);
  const novosDados = [CABECALHOS];

  for (let i = 1; i < dados.length; i++) {
    const linhaAtual = dados[i];
    const novaLinha = CABECALHOS.map(function (cabecalho) {
      const indice = indices[cabecalho];

      if (indice !== undefined && linhaAtual[indice] !== "") {
        return linhaAtual[indice];
      }

      if (cabecalho === "whatsapp_normalizado") {
        return normalizarWhatsapp(obterValorPorIndice(linhaAtual, indices, "whatsapp"));
      }

      if (cabecalho === "email_normalizado") {
        return normalizarEmail(obterValorPorIndice(linhaAtual, indices, "email"));
      }

      return "";
    });
    novosDados.push(novaLinha);
  }

  sheet.clearContents();
  sheet.getRange(1, 1, novosDados.length, CABECALHOS.length).setValues(novosDados);
  removerColunasExtras(sheet);
}

function removerColunasNaoUsadas() {
  migrarPlanilhaParaColunasAtuais();
}

function testarInscricaoSemFoto() {
  return processarInscricao({
    parameter: {
      idInscricao: Utilities.getUuid(),
      nome: "Teste Casal",
      conjuge: "Teste Conjuge",
      email: "teste.casal@example.com",
      whatsapp: "(45) 99999-0001",
      whatsappNumeros: "5545999990001"
    }
  });
}

function testarInscricaoComFoto() {
  const png1x1 =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";

  return processarInscricao({
    parameter: {
      idInscricao: Utilities.getUuid(),
      nome: "Teste Casal Foto",
      conjuge: "Teste Conjuge Foto",
      email: "teste.casal.foto@example.com",
      whatsapp: "(45) 99999-0002",
      whatsappNumeros: "5545999990002",
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

    const idInscricao = String(parametros.idInscricao || parametros.id_inscricao || Utilities.getUuid()).trim();
    const nome = String(parametros.nome || "").trim();
    const conjuge = String(parametros.conjuge || "").trim();
    const email = String(parametros.email || "").trim();
    const whatsapp = String(parametros.whatsapp || "").trim();
    const whatsappNormalizado = normalizarWhatsapp(parametros.whatsappNumeros || whatsapp);
    const emailNormalizado = normalizarEmail(email);

    if (!nome || !emailNormalizado || !whatsappNormalizado) {
      return {
        status: "erro",
        mensagem: "Preencha nome, e-mail e WhatsApp corretamente.",
        versao: VERSAO_SCRIPT
      };
    }

    const dados = sheet.getDataRange().getValues();
    const indices = criarMapaCabecalhos(sheet);

    if (idInscricao && existeIdInscricao(dados, indices, idInscricao)) {
      return {
        status: "sucesso",
        mensagem: "Inscricao ja recebida.",
        versao: VERSAO_SCRIPT
      };
    }

    let statusPlanilha = "Nova inscricao";
    let observacao = "-";
    let statusResposta = "sucesso";
    let mensagem = "Inscricao realizada com sucesso.";

    for (let i = 1; i < dados.length; i++) {
      const whatsappExistente = normalizarWhatsapp(
        obterValorDaLinha(dados[i], indices, "whatsapp_normalizado", ["whatsapp"])
      );
      const emailExistente = normalizarEmail(
        obterValorDaLinha(dados[i], indices, "email_normalizado", ["email"])
      );

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

    const foto = salvarFotoNoDrive({
      fotoBase64: parametros.fotoBase64,
      fotoNome: parametros.fotoNome,
      fotoTipo: parametros.fotoTipo,
      nome,
      whatsappNormalizado,
      idInscricao
    });

    adicionarLinha(sheet, {
      id_inscricao: idInscricao,
      data: new Date(),
      nome,
      conjuge,
      email,
      whatsapp,
      whatsapp_normalizado: whatsappNormalizado,
      email_normalizado: emailNormalizado,
      status: statusPlanilha,
      observacao,
      foto_url: foto.url,
      foto_arquivo_id: foto.id,
      foto_nome: foto.nome
    });

    return {
      status: statusResposta,
      mensagem,
      versao: VERSAO_SCRIPT
    };
  } catch (erro) {
    return {
      status: "erro",
      mensagem: erro && erro.message ? erro.message : "Erro ao enviar inscricao. Tente novamente.",
      versao: VERSAO_SCRIPT
    };
  } finally {
    lock.releaseLock();
  }
}

function garantirCabecalhos(sheet) {
  const primeiraLinha = sheet.getRange(1, 1, 1, CABECALHOS.length).getValues()[0];
  const cabecalhosVazios = primeiraLinha.every(function (valor) {
    return String(valor || "").trim() === "";
  });

  if (cabecalhosVazios) {
    sheet.getRange(1, 1, 1, CABECALHOS.length).setValues([CABECALHOS]);
  }
}

function removerColunasExtras(sheet) {
  const colunasExtras = sheet.getMaxColumns() - CABECALHOS.length;

  if (colunasExtras > 0) {
    sheet.deleteColumns(CABECALHOS.length + 1, colunasExtras);
  }
}

function criarMapaCabecalhos(sheet) {
  const primeiraLinha = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  return criarMapaPorLista(primeiraLinha);
}

function criarMapaPorLista(lista) {
  return lista.reduce(function (mapa, cabecalho, index) {
    const nome = String(cabecalho || "").trim();
    if (nome) mapa[nome] = index;
    return mapa;
  }, {});
}

function existeIdInscricao(dados, indices, idInscricao) {
  const indice = indices.id_inscricao;

  if (indice === undefined) return false;

  for (let i = 1; i < dados.length; i++) {
    if (String(dados[i][indice] || "").trim() === idInscricao) {
      return true;
    }
  }

  return false;
}

function obterValorPorIndice(linha, indices, cabecalho) {
  const indice = indices[cabecalho];
  return indice === undefined ? "" : linha[indice];
}

function obterValorDaLinha(linha, indices, cabecalho, alternativas) {
  const nomes = [cabecalho].concat(alternativas || []);

  for (let i = 0; i < nomes.length; i++) {
    const indice = indices[nomes[i]];

    if (indice !== undefined && linha[indice] !== undefined && linha[indice] !== "") {
      return linha[indice];
    }
  }

  return "";
}

function adicionarLinha(sheet, valores) {
  const indices = criarMapaCabecalhos(sheet);
  const totalColunas = Math.max(sheet.getLastColumn(), CABECALHOS.length);
  const linha = new Array(totalColunas).fill("");

  Object.keys(valores).forEach(function (cabecalho) {
    const indice = indices[cabecalho];

    if (indice !== undefined) {
      linha[indice] = valores[cabecalho];
    }
  });

  sheet.appendRow(linha);
}

function salvarFotoNoDrive(dadosFoto) {
  if (!dadosFoto.fotoBase64) {
    return {
      url: "",
      id: "",
      nome: ""
    };
  }

  const tipo = normalizarTipoFoto(dadosFoto.fotoTipo, dadosFoto.fotoNome, dadosFoto.fotoBase64);

  if (TIPOS_FOTO_PERMITIDOS.indexOf(tipo) === -1) {
    throw new Error("Envie uma foto nos formatos JPEG, JPG, PNG ou WEBP.");
  }

  const base64 = String(dadosFoto.fotoBase64).replace(/^data:[^;]+;base64,/, "");
  const bytes = Utilities.base64Decode(base64);

  if (bytes.length > MAX_FOTO_BYTES) {
    throw new Error("A foto deve ter no maximo 10 MB.");
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

function normalizarTipoFoto(tipoInformado, nomeArquivo, dataUrl) {
  const tipo = String(tipoInformado || "").trim().toLowerCase();

  if (tipo === "image/jpg" || tipo === "image/pjpeg") {
    return "image/jpeg";
  }

  if (TIPOS_FOTO_PERMITIDOS.indexOf(tipo) !== -1) {
    return tipo;
  }

  const dataUrlTexto = String(dataUrl || "").toLowerCase();

  if (dataUrlTexto.indexOf("data:image/jpeg;") === 0 || dataUrlTexto.indexOf("data:image/jpg;") === 0) {
    return "image/jpeg";
  }

  if (dataUrlTexto.indexOf("data:image/png;") === 0) {
    return "image/png";
  }

  if (dataUrlTexto.indexOf("data:image/webp;") === 0) {
    return "image/webp";
  }

  const nome = String(nomeArquivo || "").trim().toLowerCase();

  if (nome.endsWith(".jpg") || nome.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (nome.endsWith(".png")) {
    return "image/png";
  }

  if (nome.endsWith(".webp")) {
    return "image/webp";
  }

  return tipo;
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

function respostaJSON(objeto) {
  return ContentService
    .createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}
