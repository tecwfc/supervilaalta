// ─── CONFIG ───────────────────────────────────────────────────────────────
const API_URL = "https://script.google.com/macros/s/AKfycbxsHRqz4Xdn3RWQUMmHcN3vfpzlp4hXufwPP3IFlqcFDBoo_lgSxB0yk8pGjbWkpNfi/exec";

const CREDENCIAIS_FIXAS = {
  supervilaalta: { senha: "S0l@2003", nome: "caixa supervila alta" },
  supervilamuriti: { senha: "Ers626637", nome: "caixa supervila muriti" },
  admin: { senha: "admin10", nome: "admin" },
};

// ─── LOGIN ──────────────────────────────────────────────────────────────
async function verificarLogin() {
  const empresa = document.getElementById('inputEmpresa').value;
  const usuario = document.getElementById('inputUsuario').value.toLowerCase().trim();
  const senha = document.getElementById('inputSenha').value;
  const msgErro = document.getElementById('msgErro');
  const form = document.getElementById('loginForm');

  msgErro.classList.remove('show');

  // Validação básica
  if (!usuario || !senha) {
    msgErro.innerText = '❌ Preencha usuário e senha!';
    msgErro.classList.add('show');
    return;
  }

  // Mostrar loading
  form.style.pointerEvents = 'none';
  form.classList.add('hidden');
  document.getElementById('carregando').classList.add('show');

  try {
    // Tentar login via API
    const res = await fetch(
      `${API_URL}?action=login&usuario=${encodeURIComponent(usuario)}&senha=${encodeURIComponent(senha)}`
    );
    const data = await res.json();

    if (data && data.sucesso) {
      // Login via API bem-sucedido
      usuarioLogado = {
        usuario: data.usuario || usuario,
        senha: senha,
        nome: data.empresa || usuario,
        empresaId: empresa // Adicionar ID da empresa
      };

      localStorage.setItem('supervilaSessao', JSON.stringify(usuarioLogado));
      entrarNoApp();
    } else {
      // Tentar credenciais locais
      verificarCredenciaisLocais(usuario, senha, empresa);
    }
  } catch (e) {
    console.error('Erro na API, tentando credenciais locais:', e);
    verificarCredenciaisLocais(usuario, senha, empresa);
  }
}

// Modificar a função verificarCredenciaisLocais
function verificarCredenciaisLocais(usuario, senha, empresaId) {
  const empresa = empresasDisponiveis.find(e => e.id === empresaId);
  
  if (empresa && empresa.senha === senha) {
    // Login local bem-sucedido
    usuarioLogado = {
      usuario: empresaId,
      senha: senha,
      nome: empresa.nome,
      empresaId: empresaId
    };

    localStorage.setItem('supervilaSessao', JSON.stringify(usuarioLogado));
    entrarNoApp();
  } else {
    // Credenciais inválidas
    document.getElementById('carregando').classList.remove('show');
    const form = document.getElementById('loginForm');
    form.classList.remove('hidden');
    form.style.pointerEvents = '';

    const msgErro = document.getElementById('msgErro');
    msgErro.innerText = '❌ Usuário ou senha inválidos!';
    msgErro.classList.add('show');

    document.getElementById('inputSenha').value = '';
    document.getElementById('inputSenha').focus();
  }
}

function verificarCredenciaisLocais(usuario, senha) {
  if (CREDENCIAIS_FIXAS[usuario] && CREDENCIAIS_FIXAS[usuario].senha === senha) {
    // Login local bem-sucedido
    usuarioLogado = {
      usuario: usuario,
      senha: senha,
      nome: CREDENCIAIS_FIXAS[usuario].nome,
    };

    localStorage.setItem("supervilaSessao", JSON.stringify(usuarioLogado));
    entrarNoApp();
  } else {
    // Credenciais inválidas
    document.getElementById("carregando").classList.remove("show");
    const form = document.getElementById("loginForm");
    form.classList.remove("hidden");
    form.style.pointerEvents = "";

    const msgErro = document.getElementById("msgErro");
    msgErro.innerText = "❌ Usuário ou senha inválidos!";
    msgErro.classList.add("show");

    document.getElementById("inputSenha").value = "";
    document.getElementById("inputSenha").focus();
  }
}


// ─── GESTÃO DE MULTI-EMPRESA ──────────────────────────────────────────────
let empresasDisponiveis = [
  { id: 'supervilaalta', nome: 'Supervila Alta', senha: 'S0l@2003' },
  { id: 'supervilamuriti', nome: 'Supervila Muriti', senha: 'Ers626637' },
  { id: 'admin', nome: 'Administrador', senha: 'admin10' }
];

function onEmpresaChange() {
  const empresaSelect = document.getElementById('inputEmpresa');
  const usuarioInput = document.getElementById('inputUsuario');
  
  if (empresaSelect.value) {
    // Preencher automaticamente o usuário com o ID da empresa selecionada
    usuarioInput.value = empresaSelect.value;
    usuarioInput.readOnly = true;
    usuarioInput.style.background = '#f1f5f9';
    
    // Focar na senha
    document.getElementById('inputSenha').focus();
  } else {
    usuarioInput.readOnly = false;
    usuarioInput.style.background = '';
    usuarioInput.value = '';
  }
}

function mostrarSelecaoEmpresa() {
  // Esconder o link de trocar empresa
  document.getElementById('trocarEmpresaLink').style.display = 'none';
  
  // Mostrar o seletor de empresa
  const empresaSelect = document.querySelector('.field[style*="display: none"]');
  if (empresaSelect) {
    empresaSelect.style.display = 'block';
  }
}

// function mostrarTrocarEmpresa() {
//   if (confirm('Deseja trocar para outra empresa?\nVocê precisará fazer login novamente.')) {
//     // Limpar apenas a empresa atual, mantendo usuário/senha se quiser
//     localStorage.removeItem('supervilaSessao');
//     usuarioLogado = null;
    
//     // Mostrar tela de login com foco no seletor de empresa
//     document.getElementById('telaLogin').classList.remove('hidden');
//     document.getElementById('app').classList.remove('show');
    
//     // Resetar formulário
//     document.getElementById('inputEmpresa').value = '';
//     document.getElementById('inputUsuario').value = '';
//     document.getElementById('inputUsuario').readOnly = false;
//     document.getElementById('inputUsuario').style.background = '';
//     document.getElementById('inputSenha').value = '';
    
//     // Mostrar link de trocar empresa (se já estiver logado antes)
//     document.getElementById('trocarEmpresaLink').style.display = 'block';
//   }
// }

// Modificar a função entrarNoApp para incluir o nome da empresa
function entrarNoApp() {
  // Ocultar tela de login
  document.getElementById('telaLogin').classList.add('hidden');
  document.getElementById('app').classList.add('show');
  
  // Esconder o link de trocar empresa (já está dentro do app)
  document.getElementById('trocarEmpresaLink').style.display = 'none';
  
  // Atualizar informações do usuário
  const nomeEmpresa = empresasDisponiveis.find(e => e.id === usuarioLogado.usuario)?.nome || usuarioLogado.nome;
  
  document.getElementById('txtUnidade').innerText = nomeEmpresa;
  document.getElementById('topUnidade').innerText = nomeEmpresa;
  document.getElementById('sideUnidade').innerText = nomeEmpresa;
  document.getElementById('nomeEmpresaAtual').innerText = nomeEmpresa; // Novo elemento
  document.getElementById('sideUsuario').innerText = usuarioLogado.usuario;
  document.getElementById('nomeOperador').innerText = nomeEmpresa.split(' ')[1] || nomeEmpresa.split(' ')[0];

  // Configurar atalhos de teclado
  configurarAtalhosLancamento();

  // Carregar dados
  setTimeout(() => {
    carregarDescricoesSelect();
    carregarConfiguracoes();
    atualizarTabela();
    preCarregarDescricoes(); // NOVA LINHA
  }, 500);
}

// Modificar a função fazerLogout para dar opção de trocar empresa
// function fazerLogout() {
//   const escolha = confirm('Escolha uma ação:\n\nOK = Trocar de empresa\nCancelar = Sair completamente');
  
//   if (escolha) {
//     // Trocar de empresa
//     mostrarTrocarEmpresa();
//   } else {
//     // Sair completamente
//     localStorage.removeItem('supervilaSessao');
//     usuarioLogado = null;
//     location.reload();
//   }
// }
let usuarioLogado = null;
let chartPizza = null,
  chartBarras = null;
let dadosCache = { lista: [], saldoPrevio: 0 };

// ─── INIT ─────────────────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  // Configurar data atual no campo de lançamento
  const hoje = new Date();
  const dataFormatada = hoje.toISOString().split('T')[0];
  document.getElementById("data").value = dataFormatada;
  
  // Configurar filtros de período
  popularFiltroMesAno();
  
  // Verificar se há sessão salva
  verificarSessaoSalva();
  
  // Mostrar sidebar apenas em desktop
  if (window.innerWidth >= 768) {
    document.querySelector(".sidebar").style.display = "flex";
  }
  
  // Configurar select de tipo de operação
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
});

// Responsividade da sidebar
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
    // Se for número serial do Excel
    if (typeof raw === 'number' || (!isNaN(raw) && !raw.includes('/') && !raw.includes('-'))) {
      const excelSerial = parseFloat(raw);
      const excelTimestamp = (excelSerial - 25569) * 86400000;
      const date = new Date(excelTimestamp);
      
      // Ajustar para o bug do Excel
      if (excelSerial >= 60) {
        date.setTime(date.getTime() - 86400000);
      }
      
      return date;
    }
    
    // Se for string com formato de data
    if (String(raw).includes("T")) {
      return new Date(raw);
    }
    
    if (String(raw).includes("/")) {
      const parts = String(raw).split("/");
      if (parts.length === 3) {
        // Formato DD/MM/AAAA
        if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
          return new Date(parts[2], parts[1] - 1, parts[0]);
        }
        // Formato AAAA/MM/DD
        if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
      }
    }
    
    if (String(raw).includes("-")) {
      const parts = String(raw).split("-");
      if (parts.length === 3) {
        // Formato AAAA-MM-DD
        if (parts[0].length === 4 && parts[1].length === 2 && parts[2].length === 2) {
          return new Date(parts[0], parts[1] - 1, parts[2]);
        }
      }
    }
  } catch (e) {
    console.error("Erro ao fazer parse da data:", raw, e);
  }
  
  // Tentar criar data direta
  try {
    const date = new Date(raw);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (e) {
    console.error("Erro ao criar data:", raw, e);
  }
  
  return null;
}

function fmtDateBR(raw) {
  try {
    const d = parseDate(raw);
    if (!d || isNaN(d.getTime())) {
      return String(raw);
    }
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Erro ao formatar data:", raw, e);
    return String(raw);
  }
}

function toInputDate(raw) {
  try {
    const d = parseDate(raw);
    if (!d || isNaN(d.getTime())) {
      return '';
    }
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error("Erro ao converter para input date:", raw, e);
    return '';
  }
}

function updateSelectColor(selectElement) {
  if (!selectElement) return;
  
  if (selectElement.value === "recebido") {
    selectElement.style.borderColor = "var(--green)";
    selectElement.style.color = "var(--green)";
    selectElement.style.fontWeight = "700";
  } else if (selectElement.value === "pago") {
    selectElement.style.borderColor = "var(--rose)";
    selectElement.style.color = "var(--rose)";
    selectElement.style.fontWeight = "700";
  } else {
    selectElement.style.borderColor = "";
    selectElement.style.color = "";
    selectElement.style.fontWeight = "";
  }
}

function mostrarMensagemSucesso(elementoId, texto) {
  const msg = document.getElementById(elementoId);
  if (!msg) return;
  
  msg.textContent = `✅ ${texto}`;
  msg.style.display = 'block';
  
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
}

function mostrarMensagemErro(elementoId, texto) {
  const msg = document.getElementById(elementoId);
  if (!msg) return;
  
  msg.textContent = `❌ ${texto}`;
  msg.style.display = 'block';
  
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
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
    } else {
      localStorage.removeItem("supervilaSessao");
    }
  } catch (e) {
    localStorage.removeItem("supervilaSessao");
  }
}

function entrarNoApp() {
  // Ocultar tela de login
  document.getElementById("telaLogin").classList.add("hidden");
  document.getElementById("app").classList.add("show");
  
  // Atualizar informações do usuário
  document.getElementById("txtUnidade").innerText = usuarioLogado.nome;
  document.getElementById("topUnidade").innerText = usuarioLogado.nome;
  document.getElementById("sideUnidade").innerText = usuarioLogado.nome;
  document.getElementById("sideUsuario").innerText = usuarioLogado.usuario;
  document.getElementById("nomeOperador").innerText = usuarioLogado.nome.split(" ")[0];

  // Configurar atalhos de teclado
  configurarAtalhosLancamento();

  // Carregar dados
  setTimeout(() => {
    carregarDescricoesSelect();
    carregarConfiguracoes();
    atualizarTabela();
  }, 500);
}


// ─── TABS ─────────────────────────────────────────────────────────────────
function mudarTab(id, el) {
  // Ocultar todas as páginas
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");

  // Atualizar navegação mobile
  document.querySelectorAll(".bottom-nav .nav-btn").forEach((b) => b.classList.remove("active"));
  
  // Atualizar navegação desktop
  document.querySelectorAll(".sidebar .nav-item").forEach((b) => b.classList.remove("active"));

  // Ativar botão correspondente
  const idx = ["dash", "lancar", "historico", "config"].indexOf(id);
  const mobileBtn = document.querySelectorAll(".bottom-nav .nav-btn")[idx];
  const desktopBtn = document.querySelectorAll(".sidebar .nav-item")[idx];
  
  if (mobileBtn) mobileBtn.classList.add("active");
  if (desktopBtn) desktopBtn.classList.add("active");

  // Scroll para o topo
  document.querySelector(".content-scroll").scrollTop = 0;

  // Quando mudar para lançamento, garantir que select está carregado
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

// ─── DASHBOARD: FETCH + RENDER ────────────────────────────────────────────
async function atualizarTabela() {
  if (!usuarioLogado) return;
  
  try {
    const res = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=ler`
    );
    const data = await res.json();

    if (data && data.lista !== undefined) {
      // Atualizar cache
      dadosCache.lista = data.lista || [];
      dadosCache.saldoPrevio = parseFloat(data.saldoPrevio) || 0;

      // Calcular totais
      let tRec = 0,
        tPag = 0;
      dadosCache.lista.forEach((i) => {
        const recebido = parseFloat(String(i[3]).replace(",", ".")) || 0;
        const pago = parseFloat(String(i[4]).replace(",", ".")) || 0;
        tRec += recebido;
        tPag += pago;
      });
      
      const mov = tRec - tPag;

      // Atualizar cards do dashboard
      document.getElementById("cardReceitas").innerText = fmt(tRec);
      document.getElementById("cardPago").innerText = fmt(tPag);
      document.getElementById("cardFluxo").innerText = fmt(mov);
      document.getElementById("cardPrevio").innerText = fmt(dadosCache.saldoPrevio);
      document.getElementById("cardSaldo").innerText = fmt(dadosCache.saldoPrevio + mov);
      
      // Atualizar banner no livro de caixa
      document.getElementById("bannerPrevio").innerText = fmt(dadosCache.saldoPrevio);
      
      // Atualizar campo de saldo inicial nas configurações
      document.getElementById("inputSaldoPrevio").value = dadosCache.saldoPrevio.toFixed(2);

      // Renderizar componentes
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
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        Nenhum registro ainda.<br>
        <small>Faça seu primeiro lançamento!</small>
      </div>`;
    return;
  }
  
  let acum = saldoPrevio,
    html = "";

  // Ordenar por data (mais recente primeiro)
  const listaOrdenada = [...lista].sort((a, b) => {
    const dateA = parseDate(a[1]) || new Date(0);
    const dateB = parseDate(b[1]) || new Date(0);
    return dateB - dateA;
  });

  // Gerar HTML para cada registro
  listaOrdenada.forEach((item) => {
    const recebido = parseFloat(String(item[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(item[4]).replace(",", ".")) || 0;
    const isEntrada = recebido > 0;
    const valorExib = isEntrada ? recebido : pago;
    acum += recebido - pago;
    
    // Escapar caracteres especiais
    const descEsc = item[2]
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/'/g, "\\'");

    html += `
      <div class="entry-card ${isEntrada ? "entrada" : "saida"}">
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
          <div class="valor ${isEntrada ? "in" : "out"}">
            ${isEntrada ? "+" : "-"} ${fmt(valorExib)}
          </div>
        </div>
        <div class="actions">
          <button class="btn-edit" onclick="abrirModal('${item[0]}','${item[1]}','${descEsc}',${recebido},${pago})">
            ✏️ Editar
          </button>
          <button class="btn-del" onclick="excluir('${item[0]}')">
            🗑️
          </button>
        </div>
      </div>`;
  });
  
  container.innerHTML = html;
}

// ─── GRAFICOS ─────────────────────────────────────────────────────────────
function renderGraficos(rec, pag) {
  const ctxP = document.getElementById("graficoPizza");
  const ctxB = document.getElementById("graficoBarras");
  
  if (!ctxP || !ctxB) return;
  
  // Destruir gráficos anteriores
  if (chartPizza) chartPizza.destroy();
  if (chartBarras) chartBarras.destroy();

  // Garantir que os canvases estão visíveis
  ctxP.style.display = 'block';
  ctxB.style.display = 'block';

  // Configurações comuns
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.5, // Proporção fixa
  };

  // Gráfico de pizza
  chartPizza = new Chart(ctxP.getContext("2d"), {
    type: "doughnut",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [rec, pag],
          backgroundColor: ["#10b981", "#ef4444"],
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      ...commonOptions,
      plugins: {
        legend: {
          position: "bottom",
          labels: { 
            font: { size: 11 },
            boxWidth: 14,
            padding: 15
          },
        },
      },
      cutout: '60%', // Para doughnut
    },
  });

  // Gráfico de barras
  chartBarras = new Chart(ctxB.getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [rec, pag],
          backgroundColor: ["#10b981", "#ef4444"],
          borderRadius: 6,
          borderWidth: 1,
          borderColor: ['#0da271', '#dc2626'],
        },
      ],
    },
    options: {
      ...commonOptions,
      plugins: { 
        legend: { 
          display: false 
        } 
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { 
            font: { size: 10 },
            callback: function(value) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          } 
        },
        x: { 
          ticks: { 
            font: { size: 11 } 
          } 
        },
      },
    },
  });
}

// ─── LANÇAMENTO ───────────────────────────────────────────────────────────
async function lancar() {
  if (!usuarioLogado) {
    alert("❌ Usuário não está logado!");
    return;
  }

  // Coletar dados do formulário
  const tipo = document.getElementById("tipoOperacao").value;
  let valor = document.getElementById("valor").value;
  const dataInput = document.getElementById("data").value;
  
  // Coletar descrição
  const selectDesc = document.getElementById("desc");
  const manualDesc = document.getElementById("descManual");
  let desc = selectDesc.value;
  
  if (desc === "manual") {
    desc = manualDesc.value.trim();
  }

  // Validação
  if (!desc || !valor || !dataInput) {
    alert("❌ Preencha todos os campos!");
    return;
  }

  // Converter valor
  valor = valor.replace(",", ".");
  const valorNum = parseFloat(valor) || 0;
  
  if (valorNum <= 0) {
    alert("❌ Digite um valor válido maior que zero!");
    return;
  }

  // Formatar data para DD/MM/AAAA
  const p = dataInput.split("-");
  const dataFmt = `${p[2]}/${p[1]}/${p[0]}`;

  // Preparar botão para loading
  const btn = document.getElementById("btnLancar");
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Salvando...</span>';
  btn.disabled = true;
  btn.style.opacity = "0.8";
  btn.style.cursor = "wait";

  try {
    // Enviar para API
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

    if (data && data.status === "sucesso") {
      // Sucesso
      btn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Salvo!</span>';
      btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      btn.style.transform = "scale(0.95)";
      
      // Adicionar ao histórico de descrições
      if (desc !== 'manual') {
        adicionarAoHistorico(desc);
      }
      
      // Limpar campos após sucesso
      setTimeout(() => {
        limparCamposLancamento();
        
        // Restaurar botão
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.background = "";
          btn.style.transform = "";
          btn.disabled = false;
          btn.style.opacity = "1";
          btn.style.cursor = "pointer";
        }, 1000);
        
        // Atualizar dashboard
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
    
    // Erro de conexão
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

// ─── HISTÓRICO DE DESCRIÇÕES ──────────────────────────────────────────────
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

// ─── EXCLUIR REGISTRO ─────────────────────────────────────────────────────
async function excluir(id) {
  if (!usuarioLogado || !confirm("Excluir este registro permanentemente da planilha?")) {
    return;
  }
  
  try {
    const response = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=excluir&id=${id}`
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
async function abrirModal(id, data, desc, rec, pag) {
  // Converter data para formato input[type="date"]
  const dataInput = toInputDate(data);
  
  // Preencher campos do modal
  document.getElementById("editId").value = id;
  document.getElementById("editData").value = dataInput;

  const isEntrada = rec > 0;
  document.getElementById("editTipo").value = isEntrada ? "recebido" : "pago";
  document.getElementById("editValor").value = isEntrada ? rec : pag;

  // Estilizar select
  const tipoSelect = document.getElementById("editTipo");
  updateSelectColor(tipoSelect);

  // Preencher descrição temporariamente
  const descSelect = document.getElementById('editDesc');
  const descManual = document.getElementById('editDescManual');
  
  // Limpar e mostrar opção padrão
  descSelect.innerHTML = '<option value="">Carregando descrições...</option>';
  
  // MOSTRAR O MODAL IMEDIATAMENTE (sem esperar as descrições)
  document.getElementById("modalEditar").classList.add("show");
  
  // Carregar descrições ASSINCRONAMENTE após mostrar o modal
  setTimeout(async () => {
    try {
      await carregarDescricoesModal(desc);
    } catch (e) {
      console.error('Erro ao carregar descrições:', e);
      // Fallback: mostrar apenas campo manual com a descrição atual
      descSelect.innerHTML = '<option value="">Erro ao carregar</option>';
      const manualOption = document.createElement('option');
      manualOption.value = "manual";
      manualOption.textContent = "✏️ Digitar manualmente...";
      descSelect.appendChild(manualOption);
      
      descSelect.value = "manual";
      descManual.style.display = 'block';
      descManual.value = desc || '';
    }
  }, 0);
  
  // Focar no select de descrição
  setTimeout(() => {
    document.getElementById("editDesc").focus();
  }, 100);
}
function fecharModal() {
  const select = document.getElementById("editTipo");
  if (select) {
    select.style.borderColor = "";
    select.style.color = "";
    select.style.fontWeight = "";
  }

  // Limpar campos
  document.getElementById("editDesc").value = "";
  const descManual = document.getElementById("editDescManual");
  if (descManual) {
    descManual.value = "";
    descManual.style.display = "none";
  }
  
  document.getElementById("modalEditar").classList.remove("show");
}

async function salvarEditar() {
  const btn = document.getElementById("btnSalvarEditar");
  const id = document.getElementById("editId").value;
  const dataInput = document.getElementById("editData").value;
  let desc = '';
  const tipo = document.getElementById("editTipo").value;
  let valor = document.getElementById("editValor").value;

  // Obter descrição (pode ser do select ou do campo manual)
  const descSelect = document.getElementById('editDesc');
  const descManual = document.getElementById('editDescManual');
  
  if (descSelect.value === "manual") {
    // Usar valor do campo manual
    desc = descManual ? descManual.value.trim() : '';
  } else {
    // Usar valor do select
    desc = descSelect.value.trim();
  }

  // Validação
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

  // Converter data para DD/MM/AAAA
  const p = dataInput.split("-");
  const dataFmt = `${p[2]}/${p[1]}/${p[0]}`;

  // Preparar botão
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

// ─── ATALHOS DE TECLADO ──────────────────────────────────────────────────
function configurarAtalhosLancamento() {
  const valorInput = document.getElementById("valor");
  const descInput = document.getElementById("desc");
  
  if (valorInput) {
    valorInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        lancar();
      }
    });
  }
  
  if (descInput) {
    descInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("valor").focus();
      }
    });
  }
}

// ─── DESCRIÇÕES ──────────────────────────────────────────────────────────
async function carregarDescricoesSelect() {
  try {
    const res = await fetch(`${API_URL}?action=buscarDescricoes`);
    const data = await res.json();
    
    if (data.status === 'ok') {
      // Atualizar select no lançamento
      const select = document.getElementById('desc');
      if (select) {
        select.innerHTML = '<option value="">Selecione uma descrição...</option>';
        
        // Adicionar descrições da API
        data.descricoes.forEach(item => {
          const option = document.createElement('option');
          option.value = item.descricao;
          option.textContent = item.descricao;
          select.appendChild(option);
        });
        
        // Adicionar opção manual
        const manualOption = document.createElement('option');
        manualOption.value = "manual";
        manualOption.textContent = "✏️ Digitar manualmente...";
        select.appendChild(manualOption);
        
        // Atualizar lista na aba configurações
        renderDescricoes(data.descricoes);
      }
    }
  } catch (e) {
    console.error('Erro ao carregar descrições:', e);
    // Fallback: pelo menos adicionar opção manual
    const select = document.getElementById('desc');
    if (select && select.options.length <= 1) {
      const manualOption = document.createElement('option');
      manualOption.value = "manual";
      manualOption.textContent = "✏️ Digitar manualmente...";
      select.appendChild(manualOption);
    }
  }
}

// ─── CARREGAR DESCRIÇÕES NO MODAL DE EDIÇÃO ──────────────────────────────
async function carregarDescricoesModal(descricaoAtual) {
  const descSelect = document.getElementById('editDesc');
  const descManual = document.getElementById('editDescManual');
  
  if (!descSelect) return;
  
  try {
    // Usar cache se disponível
    const cacheKey = 'descricoes_cache';
    const cacheTimeKey = 'descricoes_cache_time';
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutos
    
    let data;
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTime = localStorage.getItem(cacheTimeKey);
    
    // Usar cache se ainda for válido
    if (cachedData && cachedTime && (now - parseInt(cachedTime)) < cacheExpiry) {
      data = JSON.parse(cachedData);
    } else {
      // Buscar descrições da API
      const res = await fetch(`${API_URL}?action=buscarDescricoes`);
      data = await res.json();
      
      // Salvar em cache
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(cacheTimeKey, now.toString());
    }
    
    // Limpar select
    descSelect.innerHTML = '<option value="">Selecione uma descrição...</option>';
    
    if (data.status === 'ok' && data.descricoes && data.descricoes.length > 0) {
      // Criar fragmento para melhor performance
      const fragment = document.createDocumentFragment();
      
      // Adicionar descrições da API
      data.descricoes.forEach(item => {
        const option = document.createElement('option');
        option.value = item.descricao;
        option.textContent = item.descricao;
        fragment.appendChild(option);
      });
      
      // Adicionar opção "Digitar manualmente"
      const manualOption = document.createElement('option');
      manualOption.value = "manual";
      manualOption.textContent = "✏️ Digitar manualmente...";
      fragment.appendChild(manualOption);
      
      // Adicionar tudo de uma vez
      descSelect.appendChild(fragment);
      
      // Definir valor atual
      if (descricaoAtual && descricaoAtual.trim() !== '') {
        // Verificar se a descrição atual está na lista
        const descricoesExistentes = data.descricoes.map(d => d.descricao);
        
        if (descricoesExistentes.includes(descricaoAtual.trim())) {
          // Se está na lista, selecionar
          descSelect.value = descricaoAtual.trim();
          if (descManual) descManual.style.display = 'none';
        } else {
          // Se não estiver na lista, selecionar "manual" e mostrar campo
          descSelect.value = "manual";
          if (descManual) {
            descManual.style.display = 'block';
            descManual.value = descricaoAtual.trim();
          }
        }
      } else {
        // Se não há descrição atual, deixar vazio
        descSelect.value = "";
        if (descManual) descManual.style.display = 'none';
      }
    } else {
      // Se não houver descrições, mostrar apenas opção manual
      const manualOption = document.createElement('option');
      manualOption.value = "manual";
      manualOption.textContent = "✏️ Digitar manualmente...";
      descSelect.appendChild(manualOption);
      
      // Configurar com a descrição atual
      if (descricaoAtual && descricaoAtual.trim() !== '') {
        descSelect.value = "manual";
        if (descManual) {
          descManual.style.display = 'block';
          descManual.value = descricaoAtual.trim();
        }
      } else {
        descSelect.value = "";
        if (descManual) descManual.style.display = 'none';
      }
    }
    
  } catch (e) {
    console.error('Erro ao carregar descrições para o modal:', e);
    // Fallback em caso de erro
    descSelect.innerHTML = '<option value="">Selecione uma descrição...</option>';
    const manualOption = document.createElement('option');
    manualOption.value = "manual";
    manualOption.textContent = "✏️ Digitar manualmente...";
    descSelect.appendChild(manualOption);
    
    // Configurar com a descrição atual
    if (descricaoAtual && descricaoAtual.trim() !== '') {
      descSelect.value = "manual";
      if (descManual) {
        descManual.style.display = 'block';
        descManual.value = descricaoAtual.trim();
      }
    } else {
      descSelect.value = "";
      if (descManual) descManual.style.display = 'none';
    }
  }
}


// Pré-carregar descrições quando abrir a aba de lançamentos
function preCarregarDescricoes() {
  // Iniciar carregamento em background
  setTimeout(async () => {
    try {
      const res = await fetch(`${API_URL}?action=buscarDescricoes`);
      const data = await res.json();
      
      if (data.status === 'ok') {
        // Salvar em cache
        localStorage.setItem('descricoes_cache', JSON.stringify(data));
        localStorage.setItem('descricoes_cache_time', Date.now().toString());
      }
    } catch (e) {
      console.log('Pré-carregamento de descrições falhou:', e);
    }
  }, 1000); // Esperar 1 segundo após carregar a página
}



function criarCampoDescricaoExtra(valorAtual) {
  const select = document.getElementById('editDesc');
  const container = select.parentNode;
  
  // Remover campo extra se existir
  const existingExtra = container.querySelector('#editDescExtra');
  if (existingExtra) existingExtra.remove();
  
  if (select.value === "outro") {
    // Criar campo de texto extra
    const inputExtra = document.createElement('input');
    inputExtra.type = 'text';
    inputExtra.id = 'editDescExtra';
    inputExtra.placeholder = 'Digite a descrição';
    inputExtra.value = valorAtual || '';
    inputExtra.style.marginTop = '8px';
    inputExtra.style.width = '100%';
    inputExtra.style.padding = '13px 14px';
    inputExtra.style.border = '2px solid var(--slate-200)';
    inputExtra.style.borderRadius = '14px';
    inputExtra.style.fontFamily = 'inherit';
    inputExtra.style.fontSize = '15px';
    inputExtra.style.fontWeight = '600';
    inputExtra.style.background = 'var(--slate-50)';
    
    container.appendChild(inputExtra);
  }
}

// Adicionar evento para mostrar campo extra quando selecionar "Outro"
document.addEventListener('DOMContentLoaded', function() {
  const descSelect = document.getElementById('editDesc');
  if (descSelect) {
    descSelect.addEventListener('change', function() {
      if (this.value === "outro") {
        criarCampoDescricaoExtra('');
      } else {
        const container = this.parentNode;
        const extra = container.querySelector('#editDescExtra');
        if (extra) extra.remove();
      }
    });
  }
});


// Adicionar evento para o select de descrição no modal
document.addEventListener('DOMContentLoaded', function() {
  const descSelect = document.getElementById('editDesc');
  const descManual = document.getElementById('editDescManual');
  
  if (descSelect && descManual) {
    descSelect.addEventListener('change', function() {
      if (this.value === "manual") {
        // Mostrar campo para digitar manualmente
        descManual.style.display = 'block';
        descManual.value = '';
        descManual.focus();
      } else {
        // Ocultar campo manual
        descManual.style.display = 'none';
        descManual.value = '';
      }
    });
  }
});
function preencherDescricao(valor) {
  const descManual = document.getElementById('descManual');
  
  if (!descManual) return;
  
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

function renderDescricoes(descricoes) {
  const container = document.getElementById("listaDescricoes");
  const contador = document.getElementById("contadorDescricoes");

  if (!container) return;

  if (!descricoes || descricoes.length === 0) {
    container.innerHTML = `
      <div style="color: var(--slate-400); text-align: center; padding: 30px 20px;">
        <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
        <p style="margin-bottom: 4px; font-weight: 600;">Nenhuma descrição cadastrada</p>
        <small style="font-size: 12px;">Adicione sua primeira descrição acima</small>
      </div>`;
    
    if (contador) contador.textContent = "0";
    return;
  }

  let html = "";
  descricoes.forEach((item) => {
    html += `
      <div class="descricao-item">
        <div class="descricao-text">${item.descricao}</div>
        <button class="btn-remove" onclick="excluirDescricao('${item.descricao.replace(/'/g, "\\'")}')">
          🗑️
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (contador) contador.textContent = descricoes.length;
}

async function cadastrarDescricao() {
  const descricaoInput = document.getElementById("novaDescricao");
  const descricao = descricaoInput.value.trim();
  const btn = document.querySelector('.btn-add') || document.querySelector('[onclick="cadastrarDescricao()"]');

  // Limpar mensagens anteriores
  const msgErro = document.getElementById("msgErroDescricao");
  const msgSucesso = document.getElementById("msgSucessoDescricao");
  if (msgErro) msgErro.style.display = "none";
  if (msgSucesso) msgSucesso.style.display = "none";

  // Validação
  if (!descricao) {
    mostrarMensagemErro('msgErroDescricao', 'Digite uma descrição!');
    return;
  }

  // Salvar estado original do botão
  let originalBtnHTML = null;
  if (btn) {
    originalBtnHTML = btn.innerHTML;
    btn.innerHTML = '<span>⏳</span>';
    btn.disabled = true;
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
      mostrarMensagemSucesso('msgSucessoDescricao', data.mensagem || 'Descrição cadastrada!');

      // Limpar campo
      descricaoInput.value = "";

      // Recarregar lista
      await carregarDescricoesSelect();

      // Restaurar botão
      if (btn && originalBtnHTML) {
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
      }

      // Focar no input
      descricaoInput.focus();
    } else {
      // Erro
      mostrarMensagemErro('msgErroDescricao', data.mensagem || 'Erro ao cadastrar');
      
      // Restaurar botão
      if (btn && originalBtnHTML) {
        btn.innerHTML = originalBtnHTML;
        btn.disabled = false;
      }
    }
  } catch (e) {
    console.error("Erro:", e);
    mostrarMensagemErro('msgErroDescricao', 'Erro de conexão!');
    
    // Restaurar botão
    if (btn && originalBtnHTML) {
      btn.innerHTML = originalBtnHTML;
      btn.disabled = false;
    }
  }
}

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
      mostrarMensagemSucesso('msgSucessoDescricao', 'Descrição excluída!');
      await carregarDescricoesSelect();
    } else {
      mostrarMensagemErro('msgErroDescricao', data.mensagem || "Não foi possível excluir");
    }
  } catch (e) {
    console.error("Erro:", e);
    mostrarMensagemErro('msgErroDescricao', 'Erro de conexão!');
  }
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────
async function carregarConfiguracoes() {
  if (!usuarioLogado) return;
  
  try {
    const res = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=ler`
    );
    const data = await res.json();
    
    if (data && data.saldoPrevio !== undefined) {
      const saldoPrevio = parseFloat(data.saldoPrevio) || 0;
      const inputSaldo = document.getElementById("inputSaldoPrevio");
      if (inputSaldo) {
        inputSaldo.value = saldoPrevio.toFixed(2);
      }
    }
  } catch (e) {
    console.error("Erro ao carregar configurações:", e);
  }
}

async function salvarConfiguracoes() {
  if (!usuarioLogado) return;
  
  let saldo = document.getElementById("inputSaldoPrevio").value;
  const senha = document.getElementById("senhaConfirmacao").value;
  const btn = document.getElementById("btnSalvarConfig");
  
  // Limpar mensagens
  const msgErro = document.getElementById("msgErroConfig");
  const msgSucesso = document.getElementById("msgSucessoConfig");
  if (msgErro) msgErro.style.display = "none";
  if (msgSucesso) msgSucesso.style.display = "none";

  // Validação
  if (!saldo) {
    mostrarMensagemErro('msgErroConfig', 'Digite o novo saldo!');
    return;
  }

  if (!senha) {
    mostrarMensagemErro('msgErroConfig', 'Digite a senha!');
    return;
  }

  if (senha !== usuarioLogado.senha) {
    mostrarMensagemErro('msgErroConfig', 'Senha incorreta!');
    document.getElementById("senhaConfirmacao").value = "";
    document.getElementById("senhaConfirmacao").focus();
    return;
  }

  // Converter valor
  saldo = saldo.replace(",", ".");
  const novoSaldo = parseFloat(saldo);

  if (isNaN(novoSaldo)) {
    mostrarMensagemErro('msgErroConfig', 'Valor inválido! Digite um número.');
    return;
  }

  // Confirmação
  if (!confirm(`Alterar saldo inicial para ${fmt(novoSaldo)}?`)) return;

  // Preparar botão
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Salvando...</span>';
  btn.disabled = true;
  btn.style.opacity = "0.8";

  try {
    // Enviar para API
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
      // Sucesso
      document.getElementById("senhaConfirmacao").value = "";
      mostrarMensagemSucesso('msgSucessoConfig', 'Saldo atualizado com sucesso!');
      
      // Animar botão
      btn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">Salvo!</span>';
      btn.style.background = "linear-gradient(135deg, #10b981 0%, #059669 100%)";
      
      // Restaurar botão e atualizar dados
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = "";
        btn.disabled = false;
        btn.style.opacity = "1";
        atualizarTabela();
      }, 1500);

    } else {
      // Erro da API
      mostrarMensagemErro('msgErroConfig', data?.erro || "Erro ao atualizar saldo");
      btn.innerHTML = originalHTML;
      btn.disabled = false;
      btn.style.opacity = "1";
    }
  } catch (e) {
    console.error("Erro na API:", e);
    mostrarMensagemErro('msgErroConfig', 'Erro de conexão com o servidor');
    btn.innerHTML = originalHTML;
    btn.disabled = false;
    btn.style.opacity = "1";
  }
}

// ─── FILTRO PDF ───────────────────────────────────────────────────────────
function popularFiltroMesAno() {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  
  const selM = document.getElementById("filtroMes");
  const selA = document.getElementById("filtroMesAno");
  const hoje = new Date();
  
  if (!selM || !selA) return;
  
  // Popular meses
  meses.forEach((m, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = m;
    if (i === hoje.getMonth()) o.selected = true;
    selM.appendChild(o);
  });
  
  // Popular anos (de 2020 até atual)
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
  const wrapMes = document.getElementById("wrapMes");
  const wrapPeriodo = document.getElementById("wrapPeriodo");
  
  if (!wrapMes || !wrapPeriodo) return;
  
  if (tipo === "mes") {
    wrapMes.style.display = "contents";
    wrapPeriodo.style.display = "none";
  } else {
    wrapMes.style.display = "none";
    wrapPeriodo.style.display = "contents";
  }
}

function obterPeriodoFiltro() {
  const tipo = document.getElementById("filtroTipo").value;
  
  if (tipo === "mes") {
    const m = parseInt(document.getElementById("filtroMes").value);
    const a = parseInt(document.getElementById("filtroMesAno").value);
    return { 
      inicio: new Date(a, m, 1), 
      fim: new Date(a, m + 1, 0) 
    };
  }
  
  // Período personalizado
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
  if (!periodo) {
    alert("Selecione um período válido!");
    return;
  }

  let lista, saldoPrevio;
  
  try {
    const res = await fetch(
      `${API_URL}?senha=${usuarioLogado.senha}&usuario=${usuarioLogado.usuario}&action=ler`
    );
    const data = await res.json();
    lista = data.lista || [];
    saldoPrevio = parseFloat(data.saldoPrevio) || 0;
  } catch (e) {
    console.error("Erro ao buscar dados:", e);
    alert("❌ Erro ao carregar dados para o PDF");
    return;
  }

  // Filtrar registros pelo período
  const filtrada = lista.filter((item) => {
    const d = parseDate(item[1]);
    if (!d || isNaN(d.getTime())) return false;
    const cmp = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return cmp >= periodo.inicio && cmp <= periodo.fim;
  });

  if (!filtrada.length) {
    alert("Nenhum registro no período selecionado.");
    return;
  }

  // Ordenar por data (mais antigo primeiro)
  filtrada.sort((a, b) => {
    const dateA = parseDate(a[1]) || new Date(0);
    const dateB = parseDate(b[1]) || new Date(0);
    return dateA - dateB;
  });

  // Calcular totais
  let tRec = 0,
    tPag = 0;
  filtrada.forEach((i) => {
    const recebido = parseFloat(String(i[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(i[4]).replace(",", ".")) || 0;
    tRec += recebido;
    tPag += pago;
  });
  
  const mov = tRec - tPag;

  // Formatar moeda para PDF
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
  
  // Cabeçalho
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`LIVRO DE CAIXA - ${usuarioLogado.nome.toUpperCase()}`, 105, 20, {
    align: "center",
  });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const fD = (d) => {
    if (!d || isNaN(d.getTime())) return "Data inválida";
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  doc.text(`Período: ${fD(periodo.inicio)} até ${fD(periodo.fim)}`, 105, 28, {
    align: "center",
  });

  // Preparar corpo da tabela
  const body = [["", "SALDO PRÉVIO", "", "", fmtMoeda(saldoPrevio)]];
  let acum = saldoPrevio;
  
  filtrada.forEach((item) => {
    const recebido = parseFloat(String(item[3]).replace(",", ".")) || 0;
    const pago = parseFloat(String(item[4]).replace(",", ".")) || 0;
    acum += recebido - pago;
    const d = parseDate(item[1]);
    const dStr = d ? fD(d) : "Data inválida";
    
    body.push([
      dStr,
      item[2] || "-",
      recebido > 0 ? fmtMoeda(recebido).replace("R$ ", "") : "",
      pago > 0 ? fmtMoeda(pago).replace("R$ ", "") : "",
      fmtMoeda(acum),
    ]);
  });
  
  // Adicionar totais
  body.push(["", "", "", "", ""]);
  body.push(["", "TOTAL RECEBIDO", fmtMoeda(tRec).replace("R$ ", ""), "", ""]);
  body.push(["", "TOTAL PAGO", "", fmtMoeda(tPag).replace("R$ ", ""), ""]);
  body.push(["", "SALDO MOVIMENTAÇÃO", "", "", fmtMoeda(mov)]);
  body.push(["", "SALDO PRÉVIO", "", "", fmtMoeda(saldoPrevio)]);
  body.push(["", "SALDO FINAL EM CAIXA", "", "", fmtMoeda(saldoPrevio + mov)]);

  // Gerar tabela
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

  // Rodapé
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    14,
    doc.internal.pageSize.height - 10
  );

  // Nome do arquivo
  const pad = (n) => String(n).padStart(2, "0");
  const nome = `Livro_Caixa_${usuarioLogado.nome.replace(/\s/g, "_")}_${periodo.inicio.getFullYear()}${pad(periodo.inicio.getMonth() + 1)}${pad(periodo.inicio.getDate())}_a_${periodo.fim.getFullYear()}${pad(periodo.fim.getMonth() + 1)}${pad(periodo.fim.getDate())}.pdf`;
  
  // Salvar PDF
  doc.save(nome);
  alert(`✅ PDF gerado! (${filtrada.length} registros)`);
}






// ─── DESATIVAR COMPLETAMENTE TROCA DE EMPRESA ──────────────────────────────
// Sobrescrever a função global
window.mostrarTrocarEmpresa = function() {
  console.log("Função de trocar empresa desativada");
  return false;
};

// Remover qualquer botão de troca ao carregar
document.addEventListener('DOMContentLoaded', function() {
  // Aguardar um pouco para garantir que tudo carregou
  setTimeout(function() {
    // Remover botões de troca empresa
    const trocarButtons = document.querySelectorAll('[onclick*="mostrarTrocarEmpresa"], [class*="trocar"], .btn-trocar-mobile, .btn-trocar-sidebar');
    
    trocarButtons.forEach(button => {
      button.style.display = 'none';
      button.style.visibility = 'hidden';
      button.style.opacity = '0';
      button.style.width = '0';
      button.style.height = '0';
      button.style.padding = '0';
      button.style.margin = '0';
      button.style.border = 'none';
      button.style.position = 'absolute';
      button.style.left = '-9999px';
      
      // Remover evento de clique
      button.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
    });
    
    // Remover seletor de empresa da sidebar
    const empresaSelector = document.querySelector('.empresa-selector-sidebar');
    if (empresaSelector) {
      empresaSelector.remove();
    }
    
    // Remover link na tela de login
    const trocarLink = document.getElementById('trocarEmpresaLink');
    if (trocarLink) {
      trocarLink.remove();
    }
  }, 1000); // 1 segundo de delay para garantir
});



// Configurar evento para o select de descrição no modal
document.addEventListener('DOMContentLoaded', function() {
  const descSelect = document.getElementById('editDesc');
  const descManual = document.getElementById('editDescManual');
  
  if (descSelect && descManual) {
    descSelect.addEventListener('change', function() {
      if (this.value === "manual") {
        // Mostrar campo para digitar manualmente
        descManual.style.display = 'block';
        descManual.value = '';
        descManual.focus();
      } else {
        // Ocultar campo manual
        descManual.style.display = 'none';
        descManual.value = '';
      }
    });
    
    // Também configurar no campo manual
    descManual.addEventListener('input', function() {
      // Atualizar o select se estiver digitando algo único
      const descSelect = document.getElementById('editDesc');
      if (this.value.trim() && descSelect.value === "manual") {
        // Mantém como "manual" mas mostra o que está sendo digitado
      }
    });
  }
});


// No final do arquivo script.js
window.addEventListener('resize', function() {
  if (chartPizza || chartBarras) {
    setTimeout(() => {
      const rec = parseFloat(document.getElementById("cardReceitas").textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
      const pag = parseFloat(document.getElementById("cardPago").textContent.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
      
      if (rec > 0 || pag > 0) {
        renderGraficos(rec, pag);
      }
    }, 300);
  }
});


// ─── EXPORTAR FUNÇÕES PARA O ESCOPO GLOBAL ───────────────────────────────
window.toggleSenha = toggleSenha;
window.verificarLogin = verificarLogin;
window.mudarTab = mudarTab;
window.fazerLogout = fazerLogout;
window.lancar = lancar;
window.limparCamposLancamento = limparCamposLancamento;
window.preencherDescricao = preencherDescricao;
window.cadastrarDescricao = cadastrarDescricao;
window.excluirDescricao = excluirDescricao;
window.salvarConfiguracoes = salvarConfiguracoes;
window.atualizarFiltroPeriodo = atualizarFiltroPeriodo;
window.gerarPDFLivroCaixa = gerarPDFLivroCaixa;
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.salvarEditar = salvarEditar;
window.excluir = excluir;
