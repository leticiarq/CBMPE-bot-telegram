import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);

//  CONFIGURAÇÃO 
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Limite de contexto ajustado para o plano gratuito
const CONTEXT_MAX_LENGTH = 4000;

if (!GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY não configurada.");
    process.exit(1);
}

if (!TELEGRAM_BOT_TOKEN) {
    console.error("❌ TELEGRAM_BOT_TOKEN não configurado.");
    process.exit(1);
}

// VARIÁVEIS GLOBAIS 
let KNOWLEDGE_BASE_TEXT = "";

// Controle de fila e histórico
let requestQueue = Promise.resolve();
const conversationHistory = new Map(); // chatId -> array de mensagens

// PDFs da base de conhecimento
const KNOWLEDGE_FILES = [
    "./docs/1-LEI_N_11-186_DE_22_DE_DEZEMBRO_DE_1994.pdf",
    "./docs/3-LEI_N_15-232_DE_27_DE_FEVEREIRO_DE_2014.pdf",
    "./docs/DECRETO_CBMPE_52006.pdf",
    "./docs/1684.pdf",
    "./docs/COSCIP_2025_MajRodrigoEd.pdf",
    "./docs/ANEXO_F_REQUERIMENTO_PARA_ALTERACAO_DE_DADOS_DE_AVCB_AR_VIGENTE.pdf",
    "./docs/DIESP_modelo_de_procuracaoo_AVCB.pdf",
    "./docs/DECLARACAO_DE_RESPONSABILIDADE_PARA_PROCESSO_DE_RISCO_II_MEDIO_2.pdf",
    "./docs/ANEXO_G__MODELO_DE_RECURSO_PARA_A_CIAT_OU_CSAT.pdf",
    "./docs/Modelo_de_Declaracaoo_de_Nao_Interdicaoo.pdf",
    "./docs/ANEXO_C__INFORMACOES_QUE_DEVERAO_CONSTAR_NO_CARIMBO_E_ITEM_15_DO_MEMORIAL_DO_PROJETO_ATUALIZADO.pdf",
    "./docs/Modelo_de_Proposta_de_Cronograma_e_Medidas_Compensatorias.pdf",
    "./docs/Modelo_de_Requerimento_para_Termo_de_Compromisso.pdf",
    "./docs/Requerimento_atualizacao_de_PCI.pdf",
    "./docs/ANEXO_E__MODELO_DE_CERTIDAO_DE_MUDANCA_DE_ENDERECO.pdf",
    "./docs/ANEXO_H__MODELO_DE_REQUERIMENTO.pdf"
];

// BASE DE CONHECIMENTO 
async function loadKnowledgeBase() {
    let combinedText = "";
    console.log("⏳ Carregando PDFs da base de conhecimento...");

    let pdfParse;
    try {
        const pdfModule = await import("pdf-parse/lib/pdf-parse.js");
        pdfParse = pdfModule.default;
    } catch (e) {
        console.error("❌ Módulo 'pdf-parse' não encontrado. Execute 'npm install pdf-parse'.");
        console.error("Erro detalhado:", e.message);
        return "";
    }

    for (const path of KNOWLEDGE_FILES) {
        if (!fs.existsSync(path)) {
            console.warn(`⚠️ Arquivo não encontrado: ${path}`);
            continue;
        }

        try {
            const buffer = fs.readFileSync(path);
            const data = await pdfParse(buffer);
            const fileName = path.split("/").pop();

            combinedText += `
--- FONTE: ${fileName} ---
${data.text}
--- FIM DA FONTE: ${fileName} ---
`;
            console.log(`✅ PDF carregado: ${path}`);
        } catch (err) {
            console.error(`❌ Erro ao processar ${path}:`, err.message);
        }
    }

    if (!combinedText.trim()) {
        console.warn("⚠️ Nenhum conteúdo foi carregado.");
    } else {
        console.log("📚 Base de conhecimento pronta.");
    }

    return combinedText;
}

// MAPEAMENTO DE DOCUMENTOS
const DOCUMENTOS_DISPONIVEIS = {
    // --- GRUPO: VISTORIA ---
    'procuracao': {
        arquivo: './docs/DIESP_modelo_de_procuracaoo_AVCB.pdf',
        nome: 'MODELO DE PROCURAÇÃO',
        descricao: 'Procuração para representante legal tratar de AVCB',
        palavras_chave: ['procuração', 'procuracao', 'representante', 'legal']
    },
    'declaracao_responsabilidade': {
        arquivo: './docs/DECLARACAO_DE_RESPONSABILIDADE_PARA_PROCESSO_DE_RISCO_II_MEDIO_2.pdf',
        nome: 'DECLARAÇÃO DE RESPONSABILIDADE PARA PROCESSO DE RISCO II - MÉDIO',
        descricao: 'Declaração necessária para processos de risco médio (Risco II)',
        palavras_chave: ['declaração', 'declaracao', 'responsabilidade', 'risco', 'medio', 'médio']
    },
    'requerimento_alteracao': {
        arquivo: './docs/ANEXO_F_REQUERIMENTO_PARA_ALTERACAO_DE_DADOS_DE_AVCB_AR_VIGENTE.pdf',
        nome: 'REQUERIMENTO PARA ALTERAÇÃO DE DADOS DE AVCB-AR VIGENTE',
        descricao: 'Use este modelo para solicitar alteração de dados em AVCB ou Atestado de Regularidade vigente',
        palavras_chave: ['alteração', 'alteracao', 'mudança', 'mudanca', 'dados', 'avcb', 'ar']
    },
    'recurso_ciat_csat': {
        arquivo: './docs/ANEXO_G__MODELO_DE_RECURSO_PARA_A_CIAT_OU_CSAT.pdf',
        nome: 'MODELO DE RECURSO PARA A CIAT OU CSAT',
        descricao: 'Para interpor recurso junto à CIAT ou CSAT',
        palavras_chave: ['recurso', 'ciat', 'csat', 'contestação', 'contestacao']
    },

    // --- GRUPO: ANÁLISE DE PROJETO ---
    'requerimento_atualizacao_pci': {
        arquivo: './docs/Requerimento_atualizacao_de_PCI.pdf',
        nome: 'MODELO DE REQUERIMENTO PARA ATUALIZAÇÃO DE PROJETO',
        descricao: 'Para atualizar Projeto de Combate a Incêndio',
        palavras_chave: ['pci', 'projeto', 'atualização', 'atualizacao', 'combate', 'incendio']
    },
    'certidao_mudanca_endereco': {
        arquivo: './docs/ANEXO_E__MODELO_DE_CERTIDAO_DE_MUDANCA_DE_ENDERECO.pdf',
        nome: 'MODELO DE CERTIDÃO DE MUDANÇA DE ENDEREÇO',
        descricao: 'Para informar mudança de endereço do estabelecimento',
        palavras_chave: ['certidão', 'certidao', 'mudança', 'mudanca', 'endereço', 'endereco']
    },
    'requerimento_geral': {
        arquivo: './docs/ANEXO_H__MODELO_DE_REQUERIMENTO.pdf',
        nome: 'MODELO DE REQUERIMENTO',
        descricao: 'Modelo padrão de requerimento para processos do CBMPE',
        palavras_chave: ['requerimento', 'modelo', 'solicitação', 'solicitacao', 'pedido']
    },
    'anexo_c_carimbo': {
        arquivo: './docs/ANEXO_C__INFORMACOES_QUE_DEVERAO_CONSTAR_NO_CARIMBO_E_ITEM_15_DO_MEMORIAL_DO_PROJETO_ATUALIZADO.pdf',
        nome: 'INFORMAÇÕES PARA CARIMBO E MEMORIAL',
        descricao: 'Informações que deverão constar no carimbo e item 15 do memorial do projeto atualizado',
        palavras_chave: ['anexo', 'carimbo', 'memorial', 'projeto', 'informações', 'informacoes']
    },

    // --- GRUPO: TERMO DE COMPROMISSO ---
    'declaracao_nao_interdicao': {
        arquivo: './docs/Modelo_de_Declaracaoo_de_Nao_Interdicaoo.pdf',
        nome: 'MODELO DE DECLARAÇÃO DE NÃO INTERDIÇÃO',
        descricao: 'Declara que o estabelecimento não está interditado',
        palavras_chave: ['interdição', 'interdicao', 'interditado', 'fechado']
    },
    'cronograma_medidas': {
        arquivo: './docs/Modelo_de_Proposta_de_Cronograma_e_Medidas_Compensatorias.pdf',
        nome: 'MODELO DE PROPOSTA DE CRONOGRAMA E MEDIDAS COMPENSATÓRIAS',
        descricao: 'Para estabelecer cronograma e medidas quando não puder cumprir todos requisitos imediatamente',
        palavras_chave: ['cronograma', 'medidas', 'compensatórias', 'compensatorias', 'prazo']
    },
    'requerimento_termo_compromisso': {
        arquivo: './docs/Modelo_de_Requerimento_para_Termo_de_Compromisso.pdf',
        nome: 'MODELO DE REQUERIMENTO PARA TERMO DE COMPROMISSO',
        descricao: 'Para solicitar termo de compromisso',
        palavras_chave: ['termo', 'compromisso', 'prazo']
    },

    // --- GRUPO: LEGISLAÇÃO ---
    'lei_11186': {
        arquivo: './docs/1-LEI_N_11-186_DE_22_DE_DEZEMBRO_DE_1994.pdf',
        nome: 'Lei Nº 11.186/1994',
        descricao: 'Lei estadual sobre segurança contra incêndio',
        palavras_chave: ['lei', '11186', 'legislação', 'legislacao']
    },
    'lei_15232': {
        arquivo: './docs/3-LEI_N_15-232_DE_27_DE_FEVEREIRO_DE_2014.pdf',
        nome: 'Lei Nº 15.232/2014',
        descricao: 'Lei sobre normas de segurança contra incêndio',
        palavras_chave: ['lei', '15232', 'legislação', 'legislacao']
    },
    'decreto_52006': {
        arquivo: './docs/DECRETO_CBMPE_52006.pdf',
        nome: 'Decreto CBMPE 52006',
        descricao: 'Decreto regulamentador do CBMPE',
        palavras_chave: ['decreto', '52006', 'regulamento']
    },
    'coscip': {
        arquivo: './docs/COSCIP_2025_MajRodrigoEd.pdf',
        nome: 'COSCIP 2025',
        descricao: 'Código de Segurança Contra Incêndio e Pânico - Edição 2025',
        palavras_chave: ['coscip', 'código', 'codigo', 'segurança', 'seguranca', 'normas']
    },
    'it_1684': {
        arquivo: './docs/1684.pdf',
        nome: 'Instrução Técnica 1684',
        descricao: 'Instrução técnica do CBMPE',
        palavras_chave: ['instrução', 'instrucao', 'técnica', 'tecnica', '1684', 'it']
    }
};

// Função para buscar documentos relevantes
function buscarDocumentos(mensagem) {
    const msgLower = mensagem.toLowerCase();
    const documentosEncontrados = [];
    
    for (const [key, doc] of Object.entries(DOCUMENTOS_DISPONIVEIS)) {
        const encontrou = doc.palavras_chave.some(palavra => 
            msgLower.includes(palavra.toLowerCase())
        );
        
        if (encontrou) {
            documentosEncontrados.push({ key, ...doc });
        }
    }
    
    return documentosEncontrados;
}

// Função para listar todos os documentos
function listarTodosDocumentos() {
    let lista = "📚 **Documentos Disponíveis:**\n\n";
    
    lista += "**📝 VISTORIA:**\n";
    lista += "• `/doc procuracao` - Modelo de Procuração\n";
    lista += "• `/doc declaracao_responsabilidade` - Declaração de Responsabilidade (Risco II)\n";
    lista += "• `/doc requerimento_alteracao` - Requerimento Alteração de Dados\n";
    lista += "• `/doc recurso_ciat_csat` - Modelo de Recurso CIAT/CSAT\n\n";
    
    lista += "**📋 ANÁLISE DE PROJETO:**\n";
    lista += "• `/doc requerimento_atualizacao_pci` - Atualização de Projeto\n";
    lista += "• `/doc certidao_mudanca_endereco` - Certidão Mudança de Endereço\n";
    lista += "• `/doc requerimento_geral` - Modelo de Requerimento Geral\n";
    lista += "• `/doc anexo_c_carimbo` - Informações Carimbo/Memorial\n";
    lista += "• `/doc recurso_ciat_csat` - Modelo de Recurso CIAT/CSAT\n\n";
    
    lista += "**🤝 TERMO DE COMPROMISSO:**\n";
    lista += "• `/doc declaracao_nao_interdicao` - Declaração de Não Interdição\n";
    lista += "• `/doc cronograma_medidas` - Proposta de Cronograma e Medidas\n";
    lista += "• `/doc requerimento_termo_compromisso` - Requerimento Termo Compromisso\n\n";
    
    lista += "**📖 LEGISLAÇÃO:**\n";
    lista += "• `/doc lei_11186` - Lei 11.186/1994\n";
    lista += "• `/doc lei_15232` - Lei 15.232/2014\n";
    lista += "• `/doc decreto_52006` - Decreto 52006\n";
    lista += "• `/doc coscip` - COSCIP 2025\n";
    lista += "• `/doc it_1684` - Instrução Técnica 1684\n\n";
    
    lista += "_Ou me pergunte qual documento você precisa!_ 💬";
    
    return lista;
}

// CLASSIFICADOR DE INTENÇÃO 
function classificarIntencao(mensagem) {
    const msg = mensagem.toLowerCase();
    
    // Pedido de documento
    if (/(preciso|quero|envie|envia|mande|manda|me dá|me da|documento|modelo|formulário|formulario|anexo)/i.test(msg)) {
        return 'pedir_documento';
    }

    // Agendamento

    if (/(agendamento|agendar|marcar|horário|horario|atendimento presencial)/i.test(msg)) {
        return 'agendamento';
    }

    // Taxa de Bombeiros / TPEI
    if (/(taxa|tpei|débito|debito|boleto|2 via|segunda via|certidão negativa|certidao negativa|sequencial)/i.test(msg)) {
        return 'taxa_bombeiro';
    }

    
    // Saudações
    if (/^(oi|olá|ola|hey|e aí|eai|bom dia|boa tarde|boa noite|opa)/i.test(msg)) {
        return 'saudacao';
    }
    
    // Agradecimento
    if (/(obrigad|valeu|thanks|agradeço|grato)/i.test(msg)) {
        return 'agradecimento';
    }
    
    // Despedida
    if (/(tchau|até|adeus|falou|flw|bye)/i.test(msg)) {
        return 'despedida';
    }
    
    // Ajuda
    if (/(ajuda|help|como|o que você|que você faz|pode fazer)/i.test(msg)) {
        return 'ajuda';
    }
    
    // Perguntas sobre o bot
    if (/(quem é você|quem e voce|você é|voce e|seu nome)/i.test(msg)) {
        return 'sobre_bot';
    }
    
    // Pergunta técnica (contém palavras-chave do CBMPE)
    if (/(avcb|cbmpe|regulariza|vistoria|atestado|bombeiro|incêndio|incendio|extintor|documento|prazo|validade|projeto|pci|segurança|lei|decreto)/i.test(msg)) {
        return 'tecnica';
    }
    
    // Conversa casual
    if (msg.length < 50 && !/\?/.test(msg)) {
        return 'casual';
    }
    
    return 'tecnica'; // Default: trata como técnica
}

// RESPOSTAS RÁPIDAS
function gerarRespostaRapida(intencao, mensagem) {
    const respostas = {
        saudacao: [
            "Olá! 👋 Sou o assistente virtual do CBMPE. Como posso ajudar você hoje?",
            "Oi! 😊 Estou aqui para te ajudar com informações sobre regularização e AVCB do Corpo de Bombeiros. O que você precisa?",
            "Olá! Bem-vindo(a)! Pode me perguntar sobre AVCB, regularização, documentos e tudo relacionado ao CBMPE.",
            "E aí! 👋 Pronto para te ajudar com questões sobre segurança contra incêndio. Me faz uma pergunta!"
        ],
        agradecimento: [
            "Por nada! 😊 Estou sempre à disposição. Precisa de mais alguma coisa?",
            "Fico feliz em ajudar! Se tiver outras dúvidas, é só chamar. 👍",
            "Disponha! É um prazer ajudar. Qualquer outra dúvida, pode perguntar!",
            "De nada! Conte comigo sempre que precisar de informações do CBMPE. 🔥"
        ],
        despedida: [
            "Até mais! Volte sempre que precisar! 👋",
            "Tchau! Foi um prazer ajudar. Até a próxima! 😊",
            "Até logo! Qualquer dúvida sobre CBMPE, já sabe onde me encontrar! 🔥",
            "Falou! Boa sorte com sua regularização! 👍"
        ],
        ajuda: [
            "Posso te ajudar com:\n\n" +
            "🔥 **AVCB** - O que é, como conseguir, validade\n" +
            "📋 **Regularização** - Documentos, prazos, processos\n" +
            "📄 **Documentos** - Modelos, requerimentos, declarações\n" +
            "⏰ **Prazos** - Validade de atestados, renovações\n" +
            "🏢 **Edificações** - Classificações, requisitos\n" +
            "🧯 **Equipamentos** - Extintores, hidrantes, alarmes\n\n" +
            "Me pergunte qualquer coisa relacionada ao CBMPE!"
        ],
        sobre_bot: [
            "Eu sou o assistente virtual do Corpo de Bombeiros Militar de Pernambuco! 🔥\n\n" +
            "Fui criado para ajudar você com informações sobre:\n" +
            "• AVCB e regularização\n" +
            "• Documentos necessários\n" +
            "• Prazos e validades\n" +
            "• Legislação do CBMPE\n\n" +
            "Tenho acesso a toda documentação oficial e estou aqui para facilitar sua vida! 😊"
        ],
        casual: [
            "Entendi! Mas lembre-se que sou especialista em CBMPE. Tem alguma dúvida sobre AVCB, regularização ou documentação?",
            "Hmm, não tenho certeza como responder isso! 😅 Mas posso te ajudar com questões do Corpo de Bombeiros. Quer saber algo específico?",
            "Legal! Se tiver alguma dúvida sobre AVCB, regularização ou qualquer coisa do CBMPE, é só perguntar! 👍"
        ],

        agendamento: [
            "**AGENDAMENTO DE ATENDIMENTO** 🗓️\n\n" +
            "Nesta página é possível agendar os serviços de atendimento ao público presencial, tais como: Solicitação de Isenção e Restituição de Taxa de Bombeiro; Solicitação de Certidão de ocorrências de Atendimento Pré-Hospitalar e Incêndio; Mudança de Titularidade de AVCB, Projeto e TPEI, Identificação de Pagamentos e revalidação de Taxas.\n\n" +
            "Dentre as opções de agendamento, constam os Serviços do CAT - Regularização e Fiscalização.\n\n" +
            "**⚠️ Informações Importantes:**\n" +
            "Informamos que nosso contato será realizado através de **teleatendimento**. Momentos antes do horário agendado, será enviado o link através do e-mail cadastrado. Sempre verifique a caixa de spam/lixo eletrônico.\n\n" +
            "**Atendimentos disponíveis:**\n" +
            "1. Orientações gerais sobre problemas com processos de vistoria e fiscalizações, correção de atestado de regularidade, cadastramentos;\n" +
            "2. Notificações e/ou interdições (bar seguro);\n" +
            "3. Agendamento para tratar com o comandante do CAT/RMR sobre termo de compromisso;\n" +
            "4. Orientações sobre recursos para comissão interna de atividade técnicas (CIAT-CAT/RMR).\n\n" +
            "📧 Nosso e-mail: cat.rmr@bombeiros.pe.gov.br\n\n" +
            "**👨‍💻 Consulta ao Analista:**\n" +
            "Senhor(a) contribuinte, informamos que seu atendimento será realizado através de teleatendimento no dia e hora agendados. O(a) senhor(a) receberá um link através do e-mail cadastrado.\n\n" +
            "**Regras do atendimento:**\n" +
            "• Será gravado;\n" +
            "• Duração de 20 minutos;\n" +
            "• Tolerância de atraso de 05 minutos;\n" +
            "• Prestado apenas ao responsável técnico ou proprietário (acompanhado do técnico);\n" +
            "• Apenas sobre o protocolo informado;\n" +
            "• Apenas dúvidas do laudo de exigências.\n\n" +
            "🔗 **CLIQUE AQUI PARA AGENDAR:**\n" +
            "https://agendamento.bombeiros.pe.gov.br/"
        ],

        taxa_bombeiro: [
            "**TAXA DE BOMBEIROS - TPEI** 💰\n\n" +
            "Nesta seção é possível consultar débitos, emitir segunda via de Taxa de Bombeiro e Certidão negativa de débitos.\n\n" +
            "**📝 Instruções:**\n" +
            "1. Após o acesso no link abaixo, faça seu cadastro;\n" +
            "2. Em seguida digite o **Município**;\n" +
            "3. Digite o **número do sequencial** do imóvel que você deseja obter informações ou solicitar algum serviço.\n\n" +
            "🔗 **CLIQUE AQUI PARA ACESSAR:**\n" +
            "https://tpei.bombeiros.pe.gov.br/tpeinet/intranet/dwl_ctudo-gerenc.asp?build=1"
        ]
    };
    
    const opcoes = respostas[intencao];
    return opcoes[Math.floor(Math.random() * opcoes.length)];
}

// BUSCA MELHORADA DE TRECHOS (RAG) 
function buscarTrechosRelevantes(pergunta, texto, limite = CONTEXT_MAX_LENGTH) {
    const perguntaNormalizada = pergunta.toLowerCase();
    
    const palavrasChave = pergunta
        .toLowerCase()
        .split(/\s+/)
        .filter(p => p.length >= 2)
        .map(p => p.replace(/[?!.,;]/g, ''));
    
    // Mapeamento inteligente de termos
    const termosMapeados = new Set(palavrasChave);
    
    if (perguntaNormalizada.includes('avcb')) {
        termosMapeados.add('vistoria');
        termosMapeados.add('atestado');
        termosMapeados.add('corpo de bombeiros');
    }
    if (perguntaNormalizada.includes('regulariza')) {
        termosMapeados.add('atestado');
        termosMapeados.add('regularidade');
    }
    if (perguntaNormalizada.includes('validade') || perguntaNormalizada.includes('prazo')) {
        termosMapeados.add('anos');
        termosMapeados.add('vigência');
        termosMapeados.add('renovação');
    }
    if (perguntaNormalizada.includes('documento')) {
        termosMapeados.add('requerimento');
        termosMapeados.add('anexo');
        termosMapeados.add('modelo');
    }
    
    const linhas = texto.split("\n");
    const trechosRelevantes = [];
    let fonteAtual = "";
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        if (linha.startsWith("--- FONTE:")) {
            fonteAtual = linha;
            continue;
        }
        
        if (linha.startsWith("--- FIM DA FONTE:")) {
            continue;
        }
        
        const linhaLower = linha.toLowerCase();
        let pontos = 0;
        
        for (const termo of termosMapeados) {
            if (linhaLower.includes(termo)) {
                pontos += 1;
            }
        }
        
        if (pontos > 0) {
            trechosRelevantes.push({
                fonte: fonteAtual,
                linha: linha,
                pontos: pontos,
                indice: i
            });
        }
    }
    
    trechosRelevantes.sort((a, b) => b.pontos - a.pontos);
    
    let resultado = "";
    let tamanhoAtual = 0;
    const fontesUsadas = new Set();
    
    for (const trecho of trechosRelevantes) {
        if (!fontesUsadas.has(trecho.fonte) && trecho.fonte) {
            const espacoNecessario = trecho.fonte.length + 1;
            if (tamanhoAtual + espacoNecessario < limite) {
                resultado += trecho.fonte + "\n";
                tamanhoAtual += espacoNecessario;
                fontesUsadas.add(trecho.fonte);
            }
        }
        
        const contextoCompleto = [];
        
        if (trecho.indice > 0) {
            const linhaAnterior = linhas[trecho.indice - 1];
            if (!linhaAnterior.startsWith("---")) {
                contextoCompleto.push(linhaAnterior);
            }
        }
        
        contextoCompleto.push(trecho.linha);
        
        if (trecho.indice < linhas.length - 1) {
            const proxLinha = linhas[trecho.indice + 1];
            if (!proxLinha.startsWith("---")) {
                contextoCompleto.push(proxLinha);
            }
        }
        
        const textoContexto = contextoCompleto.join("\n") + "\n";
        
        if (tamanhoAtual + textoContexto.length < limite) {
            resultado += textoContexto;
            tamanhoAtual += textoContexto.length;
        }
        
        if (tamanhoAtual >= limite * 0.9) break;
    }
    
    if (!resultado.trim()) {
        console.warn("⚠️ Nenhum trecho relevante encontrado");
        return texto.slice(0, limite);
    }
    
    console.log(`🔍 Encontrados ${trechosRelevantes.length} trechos relevantes`);
    return resultado.trim();
}

//  HISTÓRICO DE CONVERSAÇÃO 
function getConversationHistory(chatId) {
    if (!conversationHistory.has(chatId)) {
        conversationHistory.set(chatId, []);
    }
    return conversationHistory.get(chatId);
}

function addToHistory(chatId, role, content) {
    const history = getConversationHistory(chatId);
    history.push({ role, content });
    
    // Mantém apenas últimas 6 mensagens (3 trocas)
    if (history.length > 6) {
        history.shift();
    }
}

// GROQ COM PERSONALIDADE
async function getGroqReply(pergunta, chatId, tentativa = 1) {
    const intencao = classificarIntencao(pergunta);
    
    // Respostas rápidas para interações sociais
    if (['saudacao', 'agradecimento', 'despedida', 'ajuda', 'sobre_bot', 'casual', 'agendamento', 'taxa_bombeiro'].includes(intencao)) {
        const resposta = gerarRespostaRapida(intencao, pergunta);
        addToHistory(chatId, 'user', pergunta);
        addToHistory(chatId, 'assistant', resposta);
        return resposta;
    }
    
    // Para perguntas técnicas, usa RAG + IA
    const contexto = buscarTrechosRelevantes(pergunta, KNOWLEDGE_BASE_TEXT);
    const history = getConversationHistory(chatId);

    console.log(`📝 Contexto extraído: ${contexto.length} caracteres`);
    
    if (!contexto || contexto.trim().length === 0) {
        console.warn("⚠️ Nenhum contexto relevante encontrado");
        return "Desculpe, não encontrei informações específicas sobre isso na documentação. Pode reformular sua pergunta ou perguntar sobre AVCB, regularização, documentos ou prazos? 😊";
    }

    // Monta mensagens incluindo histórico
    const messages = [
        {
            role: "system",
            content:
                "Você é um assistente especializado e HUMANIZADO do CBMPE (Corpo de Bombeiros Militar de Pernambuco). " +
                "Sua personalidade:\n" +
                "- Amigável, prestativo e acessível\n" +
                "- Use emojis ocasionalmente (🔥 📋 ✅ ⚠️ 💡)\n" +
                "- Seja conversacional, não robótico\n" +
                "- Explique de forma didática, como se estivesse conversando\n" +
                "- Antecipe dúvidas e ofereça informações extras úteis\n\n" +
                "REGRAS TÉCNICAS:\n" +
                "1. Base suas respostas na BASE DE CONHECIMENTO fornecida\n" +
                "2. Cite fontes quando usar informação técnica: [nome_arquivo.pdf]\n" +
                "3. Se não souber, admita e sugira alternativas\n" +
                "4. Seja objetivo mas não seco - adicione contexto útil\n" +
                "5. Use formatação (negrito, bullets) para clareza\n\n" +
                "Lembre-se: você está ajudando pessoas reais com suas dúvidas!"
        }
    ];

    // Adiciona histórico recente
    for (const msg of history.slice(-4)) { // últimas 2 trocas
        messages.push(msg);
    }

    // Adiciona pergunta atual
    messages.push({
        role: "user",
        content: `BASE DE CONHECIMENTO:
${contexto}

PERGUNTA:
${pergunta}

(Responda de forma natural e amigável, mas sempre baseado na documentação)`
    });

    const payload = {
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.7, // Aumentado para mais naturalidade
        max_tokens: 600
    };

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            const errorData = JSON.parse(errorText);
            
            if (response.status === 429 && tentativa <= 3) {
                const waitTime = errorData.error.message.match(/(\d+\.?\d*)s/);
                const segundos = waitTime ? Math.ceil(parseFloat(waitTime[1])) : 5;
                
                console.log(`⏳ Rate limit. Aguardando ${segundos}s (tentativa ${tentativa}/3)...`);
                await new Promise(resolve => setTimeout(resolve, segundos * 1000));
                return getGroqReply(pergunta, chatId, tentativa + 1);
            }
            
            console.error("❌ Erro HTTP Groq:", response.status, errorText);
            return `Ops! Tive um problema ao consultar as informações (erro ${response.status}). Tenta de novo em alguns segundos? 😅`;
        }

        const data = await response.json();
        
        if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error("❌ Resposta inválida da API");
            return "Hmm, algo estranho aconteceu. Pode tentar perguntar de novo? 🤔";
        }

        const conteudo = data.choices[0].message.content;
        
        if (!conteudo) {
            console.error("❌ Conteúdo vazio");
            return "Desculpa, não consegui formular uma resposta. Reformula sua pergunta? 😊";
        }
        
        // Formata citações
        const respostaFormatada = conteudo.replace(/\[([^\]]+)\]/g, (match, p1) => {
            const nomeArquivo = p1.replace(/--- FONTE: /g, '').trim();
            return `[${nomeArquivo}]`;
        });

        // Adiciona ao histórico
        addToHistory(chatId, 'user', pergunta);
        addToHistory(chatId, 'assistant', respostaFormatada);

        return respostaFormatada;

    } catch (err) {
        console.error("❌ Erro Groq:", err);
        return "Ops! Tive um probleminha técnico. Tenta de novo? Se persistir, me avisa! 🔧";
    }
}

// INICIALIZAÇÃO 
async function init() {
    console.log("🚀 Iniciando bot humanizado...");

    KNOWLEDGE_BASE_TEXT = await loadKnowledgeBase();
    
    if (!KNOWLEDGE_BASE_TEXT) {
        console.error("❌ Base de conhecimento vazia. O bot não funcionará corretamente.");
    }

    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    // Comando /documentos - Lista todos
    bot.onText(/\/documentos/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, listarTodosDocumentos(), { parse_mode: 'Markdown' });
    });

    // Comando /doc [nome] - Envia documento específico
    bot.onText(/\/doc (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const docKey = match[1].trim();
        
        const documento = DOCUMENTOS_DISPONIVEIS[docKey];
        
        if (!documento) {
            bot.sendMessage(
                chatId,
                `❌ Documento não encontrado!\n\nUse \`/documentos\` para ver a lista completa de documentos disponíveis.`,
                { parse_mode: 'Markdown' }
            );
            return;
        }
        
        // Verifica se o arquivo existe
        if (!fs.existsSync(documento.arquivo)) {
            bot.sendMessage(
                chatId,
                `⚠️ Desculpe, o arquivo não foi encontrado no servidor.\n\nArquivo: ${documento.nome}`,
                { parse_mode: 'Markdown' }
            );
            return;
        }
        
        try {
            // Envia mensagem de aguarde
            await bot.sendMessage(chatId, `📤 Enviando documento: **${documento.nome}**...`, { parse_mode: 'Markdown' });
            
            // Envia o PDF
            await bot.sendDocument(chatId, documento.arquivo, {
                caption: `📄 **${documento.nome}**\n\n${documento.descricao}\n\n✅ Documento enviado com sucesso!`,
                parse_mode: 'Markdown'
            });
            
            console.log(`📄 Documento enviado: ${documento.nome} para ${chatId}`);
            
        } catch (error) {
            console.error("❌ Erro ao enviar documento:", error);
            bot.sendMessage(
                chatId,
                "😅 Ops! Tive um problema ao enviar o documento. Tenta de novo?",
                { parse_mode: 'Markdown' }
            );
        }
    });

    // Comando /start
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const nome = msg.from.first_name || "amigo(a)";
        bot.sendMessage(
            chatId,
            `Olá, ${nome}! 👋🔥\n\n` +
            `Sou o assistente virtual do **CBMPE** (Corpo de Bombeiros Militar de Pernambuco)!\n\n` +
            `Posso te ajudar com:\n` +
            `• 📋 AVCB e regularização\n` +
            `• 📄 Documentos e modelos\n` +
            `• ⏰ Prazos e validades\n` +
            `• 🏢 Requisitos para edificações\n` +
            `• 🧯 Equipamentos de segurança\n\n` +
            `**Comandos úteis:**\n` +
            `• \`/documentos\` - Ver todos os documentos disponíveis\n` +
            `• \`/ajuda\` - Ver comandos e exemplos\n` +
            `• \`/limpar\` - Limpar histórico da conversa\n\n` +
            `É só me perguntar! Estou aqui para facilitar sua vida. 😊`,
            { parse_mode: 'Markdown' }
        );
    });

    // Comando /limpar
    bot.onText(/\/limpar/, (msg) => {
        const chatId = msg.chat.id;
        conversationHistory.delete(chatId);
        bot.sendMessage(chatId, "✅ Histórico da conversa limpo! Podemos começar do zero. 🔄");
    });

    // Comando /ajuda
    bot.onText(/\/ajuda/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(
            chatId,
            "🆘 **Comandos disponíveis:**\n\n" +
            "`/start` - Inicia o bot\n" +
            "`/ajuda` - Mostra esta mensagem\n" +
            "`/documentos` - Lista todos os documentos disponíveis\n" +
            "`/doc [nome]` - Envia um documento específico\n" +
            "`/limpar` - Limpa histórico da conversa\n\n" +
            "**📄 Como pedir documentos:**\n" +
            "1. Digite `/documentos` para ver a lista completa\n" +
            "2. Use `/doc nome_do_documento` para receber\n" +
            "3. Ou simplesmente me pergunte qual documento você precisa!\n\n" +
            "**Exemplos de perguntas:**\n" +
            "• O que é AVCB?\n" +
            "• Qual a validade do atestado?\n" +
            "• Quais documentos preciso?\n" +
            "• Preciso do modelo de procuração\n" +
            "• Como funciona a vistoria?\n\n" +
            "Me pergunta qualquer coisa! 💬",
            { parse_mode: 'Markdown' }
        );
    });

    bot.on("message", async msg => {
        const chatId = msg.chat.id;
        const texto = msg.text;

        // Ignora comandos
        if (!texto || texto.startsWith('/')) return;

        console.log(`🤖 [${chatId}] Recebido: ${texto}`);
        await bot.sendChatAction(chatId, "typing");

        requestQueue = requestQueue.then(async () => {
            try {
                const resposta = await getGroqReply(texto, chatId);
                await bot.sendMessage(chatId, resposta, { parse_mode: 'Markdown' });
                console.log(`✅ Enviado para ${chatId}`);
            } catch (error) {
                console.error("❌ Erro ao processar:", error);
                await bot.sendMessage(
                    chatId,
                    "Opa! Algo deu errado aqui. 😅 Tenta de novo? Se continuar, me chama no suporte!"
                );
            }
        });
    });

    console.log("🤖 Bot humanizado em execução! Pronto para conversar! 💬");
}

init();

// teste