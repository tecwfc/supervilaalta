// ─── CONFIG ───────────────────────────────────────────────────────────────
const API_URL =
  "https://script.google.com/macros/s/AKfycbxsHRqz4Xdn3RWQUMmHcN3vfpzlp4hXufwPP3IFlqcFDBoo_lgSxB0yk8pGjbWkpNfi/exec";

const CREDENCIAIS_FIXAS = {
  supervilaalta: { senha: "S0l@2003", nome: "caixa supervila alta" },
  supervilamuriti: { senha: "Ers626637", nome: "caixa supervila muriti" },
  admin: { senha: "admin10", nome: "admin" },
};

let usuarioLogado = null;
let chartPizza = null,
  chartBarras = null;
let dadosCache = { lista: [], saldoPrevio: 0 };

// ─── INIT ─────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("data").value = new Date()
    .toISOString()
    .split("T")[0];
  popularFiltroMesAno();
  verificarSessaoSalva();
  if (window.innerWidth >= 768)
    document.querySelector(".sidebar").style.display = "flex";
});
window.addEventListener("resize", () => {
  document.querySelector(".sidebar").style.display =
    window.innerWidth >= 768 ? "flex" : "none";
});

// ─── HELPERS ──────────────────────────────────────────────────────────────
function toggleSenha(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === "password" ? "text" : "password";
  btn.textContent = inp.type === "text" ? "🙈" : "👁️";
}

function fmt(v) {
  const num = parseFloat(v) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseDate(raw) {
  if (!raw) return null;
  try {
    if (String(raw).includes("T")) return new Date(raw);
    if (String(raw).includes("/")) {
      const p = String(raw).split("/");
      return p[0].length === 4
        ? new Date(+p[0], +p[1] - 1, +p[2])
        : new Date(+p[2], +p[1] - 1, +p[0]);
    }
    if (String(raw).includes("-")) {
      const p = String(raw).split("-");
      return new Date(+p[0], +p[1] - 1, +p[2]);
    }
  } catch (e) {}
  return null;
}

function fmtDateBR(raw) {
  const d = parseDate(raw);
  if (!d || isNaN(d)) return String(raw);
  return d.toLocaleDateString("pt-BR");
}

// ─── SESSÃO ───────────────────────────────────────────────────────────────
function verificarSessaoSalva() {
  const s = localStorage.getItem("supervilaSessao");
  if (!s) return;
  try {
    const d = JSON.parse(s);
    if (d.usuario && d.senha && d.nome) {
      usuarioLogado = d;
      entrarNoApp();
    } else localStorage.removeItem("supervilaSessao");
  } catch (e) {
    localStorage.removeItem("supervilaSessao");
  }
}

function entrarNoApp() {
  document.getElementById("telaLogin").classList.add("hidden");
  document.getElementById("app").classList.add("show");
  document.getElementById("txtUnidade").innerText = usuarioLogado.nome;
  document.getElementById("topUnidade").innerText = usuarioLogado.nome;
  document.getElementById("sideUnidade").innerText = usuarioLogado.nome;
  document.getElementById("sideUsuario").innerText = usuarioLogado.usuario;
  document.getElementById("nomeOperador").innerText =
    usuarioLogado.nome.split(" ")[0];

  // Configura atalhos
  configurarAtalhosLancamento();

  // Carregar descrições quando entrar
  setTimeout(() => {
    carregarDescricoesSelect();
  }, 500);

  atualizarTabela();
}

// ─── LOGIN ──────────────────────────────────────────────────────────────
async function verificarLogin() {
  const usuario = document
    .getElementById("inputUsuario")
    .value.toLowerCase()
    .trim();
  const senha = document.getElementById("inputSenha").value;
  const msgErro = document.getElementById("msgErro");
  const form = document.getElementById("loginForm");

  msgErro.classList.remove("show");

  if (!usuario || !senha) {
    msgErro.innerText = "❌ Preencha usuário e senha!";
    msgErro.classList.add("show");
    return;
  }

  form.style.pointerEvents = "none";
  form.classList.add("hidden");
  document.getElementById("carregando").classList.add("show");

  try {
    const res = await fetch(
      `${API_URL}?action=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`,
    );
    const data = await res.json();

    if (data && data.sucesso) {
      usuarioLogado = {
        usuario: data.usuario || usuario,
        senha: senha,
        nome: data.empresa || usuario,
      };

      localStorage.setItem("supervilaSessao", JSON.stringify(usuarioLogado));

      entrarNoApp();
    } else {
      if (
        CREDENCIAIS_FIXAS[usuario] &&
        CREDENCIAIS_FIXAS[usuario].senha === senha
      ) {
        usuarioLogado = {
          usuario: usuario,
          senha: senha,
          nome: CREDENCIAIS_FIXAS[usuario].nome,
        };

        localStorage.setItem("supervilaSessao", JSON.stringify(usuarioLogado));

        entrarNoApp();
      } else {
        document.getElementById("carregando").classList.remove("show");
        form.classList.remove("hidden");
        form.style.pointerEvents = "";

        msgErro.innerText = "❌ Usuário ou senha inválidos!";
        msgErro.classList.add("show");

        document.getElementById("inputSenha").value = "";
        document.getElementById("inputSenha").focus();
      }
    }
  } catch (e) {
    console.error("Erro na API, tentando credenciais locais:", e);

    if (
      CREDENCIAIS_FIXAS[usuario] &&
      CREDENCIAIS_FIXAS[usuario].senha === senha
    ) {
      usuarioLogado = {
        usuario: usuario,
        senha: senha,
        nome: CREDENCIAIS_FIXAS[usuario].nome,
      };

      localStorage.setItem("supervilaSessao", JSON.stringify(usuarioLogado));

      entrarNoApp();
    } else {
      document.getElementById("carregando").classList.remove("show");
      form.classList.remove("hidden");
      form.style.pointerEvents = "";

      msgErro.innerText = "❌ Erro de conexão. Tente novamente.";
      msgErro.classList.add("show");
    }
  }
}

// ─── TABS ─────────────────────────────────────────────────────────────────
function mudarTab(id, el) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");

  document
    .querySelectorAll(".bottom-nav .nav-btn")
    .forEach((b) => b.classList.remove("active"));

  document
    .querySelectorAll(".sidebar .nav-item")
    .forEach((b) => b.classList.remove("active"));

  const idx = ["dash", "lancar", "historico", "config"].indexOf(id);
  const mobileBtn = document.querySelectorAll(".bottom-nav .nav-btn")[idx];
  const desktopBtn = document.querySelectorAll(".sidebar .nav-item")[idx];
  if (mobileBtn) mobileBtn.classList.add("active");
  if (desktopBtn) desktopBtn.classList.add("active");

  document.querySelector(".content-scroll").scrollTop = 0;

  // Quando mudar para a tab de lançamento, garantir que select está carregado
  if (id === "lancar") {
    setTimeout(() => {
      carregarDescricoesSelect();
    }, 100);
  }
}

function fazerLogout() {
  if (confirm("Deseja realmente sair?")) {
    localStorage.removeItem("supervilaSessao");
    usuarioLogado = null;
    location.reload();
  }
}

// ─── FETCH + RENDER ───────────────────────────────────────────────────────
async function atualizarTabela() {
  if (!usuarioLogado) return;
  try {
    const res = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=ler`,
    );
    const data = await res.json();

    console.log("Dados recebidos da API:", data);

    if (data && data.lista !== undefined) {
      dadosCache.lista = data.lista || [];
      dadosCache.saldoPrevio = parseFloat(data.saldoPrevio) || 0;

      let tRec = 0,
        tPag = 0;
      dadosCache.lista.forEach((i) => {
        const recebido = parseFloat(String(i[3]).replace(",", ".")) || 0;
        const pago = parseFloat(String(i[4]).replace(",", ".")) || 0;
        tRec += recebido;
        tPag += pago;
      });
      const mov = tRec - tPag;

      document.getElementById("cardReceitas").innerText = fmt(tRec);
      document.getElementById("cardPago").innerText = fmt(tPag);
      document.getElementById("cardFluxo").innerText = fmt(mov);
      document.getElementById("cardPrevio").innerText = fmt(
        dadosCache.saldoPrevio,
      );
      document.getElementById("cardSaldo").innerText = fmt(
        dadosCache.saldoPrevio + mov,
      );
      document.getElementById("bannerPrevio").innerText = fmt(
        dadosCache.saldoPrevio,
      );
      document.getElementById("inputSaldoPrevio").value =
        dadosCache.saldoPrevio;

      renderCards(dadosCache.lista, dadosCache.saldoPrevio);
      renderGraficos(tRec, tPag);
    } else {
      console.error("Formato de dados inválido da API");
    }
  } catch (e) {
    console.error("Erro ao carregar dados:", e);
    alert("❌ Erro ao carregar dados da planilha");
  }
}

// ─── LIVRO DE CAIXA: CARDS ────────────────────────────────────────────────
function renderCards(lista, saldoPrevio) {
  const container = document.getElementById("libroCards");
  if (lista.length === 0) {
    container.innerHTML =
      '<div class="empty-state"><div class="icon">📭</div>Nenhum registro ainda.<br><small>Faça seu primeiro lançamento!</small></div>';
    return;
  }
  let acum = saldoPrevio,
    html = "";

  const listaOrdenada = [...lista].sort((a, b) => {
    const dateA = parseDate(a[1]) || new Date(0);
    const dateB = parseDate(b[1]) || new Date(0);
    return dateB - dateA;
  });

  listaOrdenada.forEach((item) => {
    const recebido = parseFloat(String(item[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(item[4]).replace(",", ".")) || 0;
    const isEntrada = recebido > 0;
    const valorExib = isEntrada ? recebido : pago;
    acum += recebido - pago;
    const descEsc = item[2]
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/'/g, "\\'");

    html += `<div class="entry-card ${isEntrada ? "entrada" : "saida"}">
  <div class="top-row">
    <div class="desc">${item[2]}</div>
    <span class="badge-tipo ${isEntrada ? "in" : "out"}">
      ${isEntrada ? "Entrada" : "Saída"}
    </span>
  </div>
      <div class="bot-row">
        <div class="meta">
          <span>📅 ${fmtDateBR(item[1])}</span>
          <span style="color:var(--slate-300)">|</span>
          <span>Saldo: <strong>${fmt(acum)}</strong></span>
        </div>
        <div class="valor ${isEntrada ? "in" : "out"}">${isEntrada ? "+" : "-"} ${fmt(valorExib)}</div>
      </div>
      <div class="actions">
        <button class="btn-edit" onclick="abrirModal('${item[0]}','${item[1]}','${descEsc}',${recebido},${pago})">✏️ Editar</button>
        <button class="btn-del" onclick="excluir('${item[0]}')">🗑️</button>
      </div>
    </div>`;
  });
  container.innerHTML = html;
}

// ─── GRAFICOS ─────────────────────────────────────────────────────────────
function renderGraficos(rec, pag) {
  const ctxP = document.getElementById("graficoPizza").getContext("2d");
  const ctxB = document.getElementById("graficoBarras").getContext("2d");
  if (chartPizza) chartPizza.destroy();
  if (chartBarras) chartBarras.destroy();
  chartPizza = new Chart(ctxP, {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [rec, pag],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { font: { size: 11 }, boxWidth: 14 },
        },
      },
    },
  });
  chartBarras = new Chart(ctxB, {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [rec, pag],
          backgroundColor: ["#10b981", "#ef4444"],
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { font: { size: 10 } } },
        x: { ticks: { font: { size: 11 } } },
      },
    },
  });
}

// ─── LANÇAMENTO ───────────────────────────────────────────────────────────
async function lancar() {
  console.log("Função lancar() foi chamada!");
  
  if (!usuarioLogado) {
    console.error("Usuário não está logado!");
    return;
  }

  // Pegar valores dos campos
  const tipo = document.getElementById("tipoOperacao").value;
  let valor = document.getElementById("valor").value;
  const dataInput = document.getElementById("data").value;
  
  // Pegar descrição
  const selectDesc = document.getElementById("desc");
  const manualDesc = document.getElementById("descManual");
  let desc = selectDesc.value;
  
  if (desc === "manual") {
    desc = manualDesc.value.trim();
  }

  console.log("Valores capturados:", {
    tipo: tipo,
    valor: valor,
    data: dataInput,
    desc: desc
  });

  // Validação básica
  if (!desc || !valor || !dataInput) {
    console.error("Campos obrigatórios não preenchidos!");
    alert("❌ Preencha todos os campos!");
    return;
  }

  // Converter valor
  valor = valor.replace(",", ".");
  const valorNum = parseFloat(valor) || 0;
  if (valorNum <= 0) {
    console.error("Valor inválido:", valorNum);
    alert("❌ Digite um valor válido maior que zero!");
    return;
  }

  // Formatar data
  const p = dataInput.split("-");
  const dataFmt = `${p[2]}/${p[1]}/${p[0]}`;

  console.log("Enviando para API:", {
    action: "lancar",
    usuario: usuarioLogado.usuario,
    desc: desc,
    data: dataFmt,
    recebido: tipo === "recebido" ? valorNum : 0,
    pago: tipo === "pago" ? valorNum : 0
  });

  // Mudar estado do botão
  const btn = document.getElementById("btnLancar");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Salvando...</span>';
  btn.disabled = true;
  btn.style.opacity = "0.8";
  btn.style.cursor = "wait";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "lancar",
        usuario: usuarioLogado.usuario,
        desc: desc,
        data: dataFmt,
        recebido: tipo === "recebido" ? valorNum : 0,
        pago: tipo === "pago" ? valorNum : 0,
      }),
    });

    const data = await response.json();
    console.log("Resposta da API:", data);

    if (data && data.status === "sucesso") {
      // Sucesso
      btn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Salvo!</span>';
      btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      
      setTimeout(() => {
        // Limpar campos
        selectDesc.value = "";
        if (manualDesc) {
          manualDesc.value = "";
          manualDesc.style.display = "none";
        }
        document.getElementById("valor").value = "";
        
        // Focar no campo de descrição
        selectDesc.focus();
        
        // Restaurar botão
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
          btn.disabled = false;
          btn.style.opacity = "1";
          btn.style.cursor = "pointer";
        }, 1000);
        
        // Atualizar tabela
        atualizarTabela();
      }, 500);
      
    } else {
      // Erro da API
      btn.innerHTML = '<span class="btn-icon">❌</span><span class="btn-text">Erro!</span>';
      btn.style.background = "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "";
        btn.disabled = false;
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
        alert("❌ Erro ao salvar: " + (data?.erro || "Verifique a conexão"));
      }, 1500);
    }
  } catch (e) {
    console.error("Erro na requisição:", e);
    
    btn.innerHTML = '<span class="btn-icon">⚠️</span><span class="btn-text">Falha!</span>';
    btn.style.background = "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)";
    
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.background = "";
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.cursor = "pointer";
      alert("❌ Erro de conexão com o servidor!");
    }, 1500);
  }
}

// Na função lancar(), após o sucesso:
btn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Salvo!</span>';
btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
btn.style.transform = "scale(0.95)";



function validarCamposLancamento() {
  const desc = document.getElementById("desc").value;
  const valor = document.getElementById("valor").value;
  const data = document.getElementById("data").value;
  
  const erros = [];
  
  if (!desc || desc === "") {
    erros.push("Selecione ou digite uma descrição");
    document.getElementById("desc").style.borderColor = "var(--rose)";
  }
  
  if (!valor || parseFloat(valor.replace(",", ".")) <= 0) {
    erros.push("Digite um valor válido maior que zero");
    document.getElementById("valor").style.borderColor = "var(--rose)";
  }
  
  if (!data) {
    erros.push("Selecione uma data");
    document.getElementById("data").style.borderColor = "var(--rose)";
  }
  
  return erros;
}


// Salvar descrições usadas recentemente
let historicoDescricoes = JSON.parse(localStorage.getItem('historicoDescricoes') || '[]');

function adicionarAoHistorico(descricao) {
  if (!descricao || descricao === 'manual') return;
  
  // Remover se já existir
  historicoDescricoes = historicoDescricoes.filter(d => d !== descricao);
  
  // Adicionar no início
  historicoDescricoes.unshift(descricao);
  
  // Manter apenas últimos 10
  historicoDescricoes = historicoDescricoes.slice(0, 10);
  
  localStorage.setItem('historicoDescricoes', JSON.stringify(historicoDescricoes));
}

// Chamar após salvar um lançamento
adicionarAoHistorico(desc);

// ─── EXCLUIR ──────────────────────────────────────────────────────────────
async function excluir(id) {
  if (
    !usuarioLogado ||
    !confirm("Excluir este registro permanentemente da planilha?")
  )
    return;
  try {
    const response = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=excluir&id=${id}`,
    );
    const data = await response.json();

    if (data && data.status === "ok") {
      alert("✅ Registro excluído com sucesso!");
      atualizarTabela();
    } else {
      alert("❌ Erro: " + (data?.erro || "Não foi possível excluir"));
    }
  } catch (e) {
    console.error("Erro:", e);
    alert("❌ Erro de conexão com a planilha!");
  }
}

// ─── MODAL EDITAR ─────────────────────────────────────────────────────────
function abrirModal(id, data, desc, rec, pag) {
  let dataInput = data;
  try {
    const d = parseDate(data);
    if (d) {
      const y = d.getFullYear(),
        m = String(d.getMonth() + 1).padStart(2, "0"),
        dd = String(d.getDate()).padStart(2, "0");
      dataInput = `${y}-${m}-${dd}`;
    }
  } catch (e) {}
  document.getElementById("editId").value = id;
  document.getElementById("editData").value = dataInput;
  document.getElementById("editDesc").value = desc;

  const isEntrada = rec > 0;
  document.getElementById("editTipo").value = isEntrada ? "recebido" : "pago";
  document.getElementById("editValor").value = isEntrada ? rec : pag;

  const select = document.getElementById("editTipo");
  if (isEntrada) {
    select.style.borderColor = "var(--green)";
    select.style.color = "var(--green)";
  } else {
    select.style.borderColor = "var(--rose)";
    select.style.color = "var(--rose)";
  }

  document.getElementById("modalEditar").classList.add("show");
}

document.addEventListener("DOMContentLoaded", function () {
  const selects = ["tipoOperacao", "editTipo"];

  selects.forEach((selectId) => {
    const select = document.getElementById(selectId);
    if (select) {
      updateSelectColor(select);
      select.addEventListener("change", function () {
        updateSelectColor(this);
      });
    }
  });

  function updateSelectColor(selectElement) {
    if (selectElement.value === "recebido") {
      selectElement.style.borderColor = "var(--green)";
      selectElement.style.color = "var(--green)";
      selectElement.style.fontWeight = "700";
    } else if (selectElement.value === "pago") {
      selectElement.style.borderColor = "var(--rose)";
      selectElement.style.color = "var(--rose)";
      selectElement.style.fontWeight = "700";
    }
  }
});

function fecharModal() {
  const select = document.getElementById("editTipo");
  if (select) {
    select.style.borderColor = "";
    select.style.color = "";
    select.style.fontWeight = "";
  }

  document.getElementById("modalEditar").classList.remove("show");
}

async function salvarEditar() {
  const btn = document.getElementById("btnSalvarEditar");
  const id = document.getElementById("editId").value;
  const dataInput = document.getElementById("editData").value;
  const desc = document.getElementById("editDesc").value;
  const tipo = document.getElementById("editTipo").value;
  let valor = document.getElementById("editValor").value;

  if (!dataInput || !desc || !valor) {
    alert("❌ Preencha todos os campos!");
    return;
  }

  valor = valor.replace(",", ".");
  const valorNum = parseFloat(valor) || 0;

  if (valorNum <= 0) {
    alert("❌ Digite um valor válido maior que zero!");
    return;
  }

  const p = dataInput.split("-");
  const dataFmt = `${p[2]}/${p[1]}/${p[0]}`;

  btn.innerText = "Salvando…";
  btn.disabled = true;
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "editar",
        usuario: usuarioLogado.usuario,
        id: id,
        data: dataFmt,
        desc: desc,
        recebido: tipo === "recebido" ? valorNum : 0,
        pago: tipo === "pago" ? valorNum : 0,
      }),
    });

    const data = await response.json();

    if (data && data.status === "ok") {
      alert("✅ Registro editado com sucesso!");
      fecharModal();
      atualizarTabela();
    } else {
      alert("❌ Erro: " + (data?.erro || "Não foi possível editar"));
    }
  } catch (e) {
    console.error("Erro:", e);
    alert("❌ Erro de conexão com a planilha!");
  } finally {
    btn.innerText = "Salvar";
    btn.disabled = false;
  }
}

// ─── LIMPAR CAMPOS DO LANÇAMENTO ──────────────────────────────────────────
function limparCamposLancamento() {
  const selectDesc = document.getElementById("desc");
  const manualDesc = document.getElementById("descManual");
  
  // Limpar campos
  selectDesc.value = "";
  if (manualDesc) {
    manualDesc.value = "";
    manualDesc.style.display = "none";
  }
  document.getElementById("valor").value = "";
  document.getElementById("data").value = new Date().toISOString().split("T")[0];
  
  // Focar na descrição
  selectDesc.focus();
}

// ─── CONFIGURAR ATALHOS ──────────────────────────────────────────────────
function configurarAtalhosLancamento() {
  document.getElementById("valor").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      lancar();
    }
  });

  document.getElementById("desc").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById("valor").focus();
    }
  });
}

// ─── DESCRIÇÕES ──────────────────────────────────────────────────────────
// Carregar descrições para o select
async function carregarDescricoesSelect() {
  try {
    const res = await fetch(`${API_URL}?action=buscarDescricoes`);
    const data = await res.json();
    
    if (data.status === 'ok') {
      // Atualizar select no lançamento
      const select = document.getElementById('desc');
      select.innerHTML = '<option value="">Selecione uma descrição...</option>';
      
      data.descricoes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.descricao;
        option.textContent = item.descricao;
        select.appendChild(option);
      });
      
      // Adicionar opção para digitar manualmente
      const manualOption = document.createElement('option');
      manualOption.value = "manual";
      manualOption.textContent = "✏️ Digitar manualmente...";
      select.appendChild(manualOption);
      
      // Atualizar lista na aba configurações
      renderDescricoes(data.descricoes);
    }
  } catch (e) {
    console.error('Erro ao carregar descrições:', e);
    // Em caso de erro, pelo menos adicionar a opção manual
    const select = document.getElementById('desc');
    const manualOption = document.createElement('option');
    manualOption.value = "manual";
    manualOption.textContent = "✏️ Digitar manualmente...";
    select.appendChild(manualOption);
  }
}

// Quando selecionar uma descrição
function preencherDescricao(valor) {
  const descManual = document.getElementById('descManual');
  
  if (valor === "manual") {
    // Mostrar campo para digitar manualmente
    descManual.style.display = 'block';
    descManual.value = '';
    descManual.focus();
  } else if (valor) {
    // Ocultar campo manual
    descManual.style.display = 'none';
    descManual.value = '';
  } else {
    // Nada selecionado
    descManual.style.display = 'none';
  }
}

// Mostrar lista de descrições na aba configurações
function renderDescricoes(descricoes) {
  const container = document.getElementById("listaDescricoes");

  if (!descricoes || descricoes.length === 0) {
    container.innerHTML =
      '<p style="color: var(--slate-400); text-align: center; padding: 20px;">Nenhuma descrição cadastrada ainda.</p>';
    return;
  }

  let html = "";
  descricoes.forEach((item) => {
    html += `
      <div class="descricao-item">
        <div style="flex: 1;">
          <span style="font-weight: 600; color: var(--slate-700); display: block; margin-bottom: 2px;">${item.descricao}</span>
        </div>
        <button class="btn-excluir-desc" onclick="excluirDescricao('${item.descricao.replace(/'/g, "\\'")}')">
          🗑️
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Cadastrar nova descrição
async function cadastrarDescricao() {
  const descricao = document.getElementById("novaDescricao").value.trim();
  const msgErro = document.getElementById("msgErroDescricao");
  const msgSucesso = document.getElementById("msgSucessoDescricao");

  // Limpar mensagens
  msgErro.style.display = "none";
  msgSucesso.style.display = "none";

  if (!descricao) {
    msgErro.innerText = "❌ Digite uma descrição!";
    msgErro.style.display = "block";
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "cadastrarDescricao",
        descricao: descricao,
      }),
    });

    const data = await response.json();

    if (data.status === "ok") {
      // Sucesso
      msgSucesso.innerText = "✅ " + data.mensagem;
      msgSucesso.style.display = "block";

      // Limpar campo
      document.getElementById("novaDescricao").value = "";

      // Recarregar lista
      await carregarDescricoesSelect();

      // Esconder mensagem após 3 segundos
      setTimeout(() => {
        msgSucesso.style.display = "none";
      }, 3000);
    } else {
      // Erro
      msgErro.innerText = "❌ " + data.mensagem;
      msgErro.style.display = "block";
    }
  } catch (e) {
    console.error("Erro:", e);
    msgErro.innerText = "❌ Erro de conexão!";
    msgErro.style.display = "block";
  }
}

// Excluir descrição
async function excluirDescricao(descricao) {
  if (!confirm(`Excluir a descrição "${descricao}"?`)) return;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "excluirDescricao",
        descricao: descricao,
      }),
    });

    const data = await response.json();

    if (data.status === "ok") {
      alert("✅ Descrição excluída!");
      await carregarDescricoesSelect();
    } else {
      alert("❌ Erro: " + (data.mensagem || "Não foi possível excluir"));
    }
  } catch (e) {
    console.error("Erro:", e);
    alert("❌ Erro de conexão!");
  }
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────
async function salvarConfiguracoes() {
  if (!usuarioLogado) return;
  let saldo = document.getElementById("inputSaldoPrevio").value;
  const senha = document.getElementById("senhaConfirmacao").value;
  const msgE = document.getElementById("msgErroConfig");
  const msgS = document.getElementById("msgSucessoConfig");
  const btn = document.getElementById("btnSalvarConfig");
  msgE.classList.remove("show");
  msgS.classList.remove("show");

  if (!saldo) {
    msgE.innerText = "❌ Digite o novo saldo!";
    msgE.classList.add("show");
    return;
  }

  if (!senha) {
    msgE.innerText = "❌ Digite a senha!";
    msgE.classList.add("show");
    return;
  }

  if (senha !== usuarioLogado.senha) {
    msgE.innerText = "❌ Senha incorreta!";
    msgE.classList.add("show");
    document.getElementById("senhaConfirmacao").value = "";
    return;
  }

  saldo = saldo.replace(",", ".");
  const novoSaldo = parseFloat(saldo);

  if (isNaN(novoSaldo)) {
    msgE.innerText = "❌ Valor inválido! Digite um número.";
    msgE.classList.add("show");
    return;
  }

  if (!confirm(`Alterar saldo inicial para ${fmt(novoSaldo)}?`)) return;

  btn.innerText = "Salvando…";
  btn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "salvarConfig",
        usuario: usuarioLogado.usuario,
        salario: novoSaldo,
      }),
    });

    const data = await response.json();

    if (data && data.status === "ok") {
      document.getElementById("senhaConfirmacao").value = "";
      msgS.innerText = "✅ Saldo atualizado com sucesso!";
      msgS.classList.add("show");

      await atualizarTabela();
    } else {
      msgE.innerText = "❌ " + (data?.erro || "Erro ao atualizar saldo");
      msgE.classList.add("show");
    }
  } catch (e) {
    console.error("Erro na API:", e);
    msgE.innerText = "❌ Erro de conexão com o servidor";
    msgE.classList.add("show");
  } finally {
    setTimeout(() => {
      btn.innerText = "Atualizar Saldo";
      btn.disabled = false;
      setTimeout(() => {
        msgE.classList.remove("show");
      }, 3000);
    }, 500);
  }
}

// ─── FILTRO PDF ───────────────────────────────────────────────────────────
function popularFiltroMesAno() {
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const selM = document.getElementById("filtroMes");
  const selA = document.getElementById("filtroMesAno");
  const hoje = new Date();
  meses.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = m;
    if (i === hoje.getMonth()) o.selected = true;
    selM.appendChild(o);
  });
  for (let a = hoje.getFullYear(); a >= 2020; a--) {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a;
    if (a === hoje.getFullYear()) o.selected = true;
    selA.appendChild(o);
  }
}

function atualizarFiltroPeriodo() {
  const tipo = document.getElementById("filtroTipo").value;
  document.getElementById("wrapMes").style.display =
    tipo === "mes" ? "contents" : "none";
  document.getElementById("wrapPeriodo").style.display =
    tipo === "periodo" ? "contents" : "none";
}

function obterPeriodoFiltro() {
  const tipo = document.getElementById("filtroTipo").value;
  if (tipo === "mes") {
    const m = parseInt(document.getElementById("filtroMes").value);
    const a = parseInt(document.getElementById("filtroMesAno").value);
    return { inicio: new Date(a, m, 1), fim: new Date(a, m + 1, 0) };
  }
  const i = document.getElementById("filtroPeriodoInicio").value;
  const f = document.getElementById("filtroPeriodoFim").value;
  if (!i || !f) return null;
  return {
    inicio: new Date(i + "T00:00:00"),
    fim: new Date(f + "T23:59:59"),
  };
}

// ─── GERAR PDF ────────────────────────────────────────────────────────────
async function gerarPDFLivroCaixa() {
  if (!usuarioLogado) return;
  const periodo = obterPeriodoFiltro();
  if (!periodo) return alert("Selecione um período válido!");

  let lista, saldoPrevio;
  try {
    const res = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=ler`,
    );
    const data = await res.json();
    lista = data.lista || [];
    saldoPrevio = parseFloat(data.saldoPrevio) || 0;
  } catch (e) {
    console.error("Erro ao buscar dados:", e);
    alert("❌ Erro ao carregar dados para o PDF");
    return;
  }

  const filtrada = lista.filter((item) => {
    const d = parseDate(item[1]);
    if (!d || isNaN(d)) return false;
    const cmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return cmp >= periodo.inicio && cmp <= periodo.fim;
  });

  if (!filtrada.length) return alert("Nenhum registro no período selecionado.");

  filtrada.sort((a, b) => (parseDate(a[1]) || 0) - (parseDate(b[1]) || 0));

  let tRec = 0,
    tPag = 0;
  filtrada.forEach((i) => {
    const recebido = parseFloat(String(i[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(i[4]).replace(",", ".")) || 0;
    tRec += recebido;
    tPag += pago;
  });
  const mov = tRec - tPag;

  const fmtMoeda = (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) return "R$ 0,00";
    const abs = Math.abs(n),
      p = abs.toFixed(2).split(".");
    return (
      (n < 0 ? "-" : "") +
      "R$ " +
      p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".") +
      "," +
      p[1]
    );
  };

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  doc.setFont("helvetica");
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`LIVRO DE CAIXA - ${usuarioLogado.nome.toUpperCase()}`, 105, 20, {
    align: "center",
  });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const fD = (d) =>
    d
      .toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ de /g, " ");
  doc.text(`Período: ${fD(periodo.inicio)} até ${fD(periodo.fim)}`, 105, 28, {
    align: "center",
  });

  const body = [["", "SALDO PRÉVIO", "", "", fmtMoeda(saldoPrevio)]];
  let acum = saldoPrevio;
  filtrada.forEach((item) => {
    const recebido = parseFloat(String(item[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(item[4]).replace(",", ".")) || 0;
    acum += recebido - pago;
    const d = parseDate(item[1]);
    const dStr = d ? fD(d) : String(item[1]);
    body.push([
      dStr,
      item[2] || "-",
      recebido > 0 ? fmtMoeda(recebido).replace("R$ ", "") : "",
      pago > 0 ? fmtMoeda(pago).replace("R$ ", "") : "",
      fmtMoeda(acum),
    ]);
  });
  body.push(["", "", "", "", ""]);
  body.push(["", "TOTAL RECEBIDO", fmtMoeda(tRec).replace("R$ ", ""), "", ""]);
  body.push(["", "TOTAL PAGO", "", fmtMoeda(tPag).replace("R$ ", ""), ""]);
  body.push(["", "SALDO MOVIMENTAÇÃO", "", "", fmtMoeda(mov)]);
  body.push(["", "SALDO PRÉVIO", "", "", fmtMoeda(saldoPrevio)]);
  body.push(["", "SALDO FINAL EM CAIXA", "", "", fmtMoeda(saldoPrevio + mov)]);

  doc.autoTable({
    startY: 35,
    head: [["DATA", "DESCRIÇÃO", "RECEBIDO", "PAGO", "SALDO"]],
    body,
    theme: "grid",
    headStyles: {
      fillColor: [227, 29, 26],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { halign: "center", cellWidth: 25 },
      1: { halign: "left", cellWidth: 70 },
      2: { halign: "right", cellWidth: 28 },
      3: { halign: "right", cellWidth: 28 },
      4: { halign: "right", cellWidth: 32 },
    },
    didParseCell(data) {
      if (data.section === "body" && data.row.index === 0) {
        data.cell.styles.fillColor = [240, 240, 240];
        data.cell.styles.fontStyle = "bold";
      }
      if (data.section === "body" && data.row.index >= body.length - 5) {
        data.cell.styles.fillColor = [255, 255, 0];
        data.cell.styles.fontStyle = "bold";
      }
    },
  });

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    14,
    doc.internal.pageSize.height - 10,
  );

  const pad = (n) => String(n).padStart(2, "0");
  const nome = `Livro_Caixa_${usuarioLogado.nome.replace(/\s/g, "_")}_${periodo.inicio.getFullYear()}${pad(periodo.inicio.getMonth() + 1)}${pad(periodo.inicio.getDate())}_a_${periodo.fim.getFullYear()}${pad(periodo.fim.getMonth() + 1)}${pad(periodo.fim.getDate())}.pdf`;
  doc.save(nome);
  alert(`✅ PDF gerado! (${filtrada.length} registros)`);
}
