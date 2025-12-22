import TelegramBot from "node-telegram-bot-api";
import fetch from "node-fetch";
import dotenv from "dotenv";
import fs from "fs";
import { createRequire } from "module";
import express from "express";
import fs from "fs";

// --- IMPORTA O CONTEÚDO DO OUTRO ARQUIVO ---
import { 
    DOCUMENTOS_DISPONIVEIS, 
    classificarIntencao, 
    gerarRespostaRapida, 
    listarTodosDocumentos 
} from "./conteudo.js";

dotenv.config();
const require = createRequire(import.meta.url);

const faqData = JSON.parse(fs.readFileSync('./faq.json', 'utf8'));

// --- CONFIGURAÇÃO SERVIDOR (Para o Render não cair) ---
const app = express();
const PORT = process.env.PORT || 3000;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CONTEXT_MAX_LENGTH = 4000;

if (!GROQ_API_KEY || !TELEGRAM_BOT_TOKEN) {
    console.error("❌ Chaves de API não configuradas.");
    process.exit(1);
}

// VARIÁVEIS GLOBAIS
let KNOWLEDGE_BASE_TEXT = "";
let requestQueue = Promise.resolve();
const conversationHistory = new Map();

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

// FUNÇÕES AUXILIARES (Histórico e Carga de PDFs)
function getConversationHistory(chatId) {
    if (!conversationHistory.has(chatId)) conversationHistory.set(chatId, []);
    return conversationHistory.get(chatId);
}

function verificarRespostaFixa(mensagem) {
    const msg = mensagem.toLowerCase();

    for (const [chave, dados] of Object.entries(faqData)) {
        // Verifica se tem algum dos gatilhos
        const temGatilho = dados.gatilhos.some(g => msg.includes(g));
        
        // Se tiver contexto obrigatório, verifica também
        const temContexto = dados.contexto.length === 0 || dados.contexto.some(c => msg.includes(c));

        if (temGatilho && temContexto) {
            return dados.resposta; // Retorna o texto exato do JSON
        }
    }
    return null; // Não achou resposta fixa
}

function addToHistory(chatId, role, content) {
    const history = getConversationHistory(chatId);
    history.push({ role, content });
    if (history.length > 6) history.shift();
}

async function loadKnowledgeBase() {
    let combinedText = "";
    console.log("⏳ Carregando PDFs...");
    let pdfParse;
    try {
        const pdfModule = await import("pdf-parse/lib/pdf-parse.js");
        pdfParse = pdfModule.default;
    } catch (e) { return ""; }

    for (const path of KNOWLEDGE_FILES) {
        if (!fs.existsSync(path)) continue;
        try {
            const buffer = fs.readFileSync(path);
            const data = await pdfParse(buffer);
            combinedText += `\n--- FONTE: ${path.split("/").pop()} ---\n${data.text}\n`;
        } catch (err) { console.error(`Erro: ${path}`); }
    }
    return combinedText;
}

function buscarTrechosRelevantes(pergunta, texto, limite = CONTEXT_MAX_LENGTH) {
    // (Sua lógica RAG original mantida aqui para economizar espaço visual, mas deve estar completa no arquivo real)
    // Se quiser posso reenviar essa função completa, mas ela é a mesma de antes.
    // ... Implementação do RAG ...
    
    // Simplificado para exemplo (use a sua função completa aqui):
    if(!texto) return "";
    return texto.slice(0, limite); 
}

// --- FUNÇÃO PRINCIPAL DO BOT (CORRIGIDA) ---
async function getGroqReply(pergunta, chatId, tentativa = 1) {
    
    // 1. TENTA ACHAR UMA RESPOSTA NO FAQ (JSON)
    const respostaFixa = verificarRespostaFixa(pergunta);
    
    if (respostaFixa) {
        addToHistory(chatId, 'user', pergunta);
        addToHistory(chatId, 'assistant', respostaFixa);
        return respostaFixa; // PARE AQUI! Retorna o texto do JSON
    }
    
    // 1. Classifica usando a função importada
    const intencao = classificarIntencao(pergunta);
    
    // 2. Define quais intenções NÃO usam IA
    const intencoesDiretas = [
        'saudacao', 'agradecimento', 'despedida', 'ajuda', 'sobre_bot', 'casual', 
        'agendamento', 'taxa_bombeiro', 
        'alterar_modelo', 'novos_modelos', 'como_regularizar'
    ];

    // 3. SE FOR DIRETA, RESPONDE E RETORNA (CORREÇÃO DO BUG)
    if (intencoesDiretas.includes(intencao)) {
        const resposta = gerarRespostaRapida(intencao, pergunta);
        addToHistory(chatId, 'user', pergunta);
        addToHistory(chatId, 'assistant', resposta);
        return resposta; // <--- O IMPORTANTE RETURN
    }

    // 4. Se não for direta, usa IA + RAG
    const contexto = buscarTrechosRelevantes(pergunta, KNOWLEDGE_BASE_TEXT);
    const history = getConversationHistory(chatId);

    const messages = [
        {
            role: "system",
            content: "Você é um assistente do CBMPE. Use a Base de Conhecimento abaixo. Seja útil e amigável."
        },
        ...history.slice(-4),
        {
            role: "user",
            content: `CONTEXTO:\n${contexto}\n\nPERGUNTA:\n${pergunta}`
        }
    ];

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, temperature: 0.5 })
        });

        const data = await response.json();
        const resposta = data.choices?.[0]?.message?.content || "Desculpe, não entendi.";
        
        addToHistory(chatId, 'user', pergunta);
        addToHistory(chatId, 'assistant', resposta);
        return resposta;

    } catch (err) {
        return "Erro técnico. Tente novamente.";
    }
}

// --- INICIALIZAÇÃO ---
async function init() {
    KNOWLEDGE_BASE_TEXT = await loadKnowledgeBase();
    const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

    // Comandos de Documentos
    bot.onText(/\/documentos/, (msg) => bot.sendMessage(msg.chat.id, listarTodosDocumentos(), { parse_mode: 'Markdown' }));

    bot.onText(/\/doc (.+)/, async (msg, match) => {
        const docKey = match[1].trim();
        const doc = DOCUMENTOS_DISPONIVEIS[docKey];
        if (doc && fs.existsSync(doc.arquivo)) {
            await bot.sendDocument(msg.chat.id, doc.arquivo, { caption: doc.nome });
        } else {
            bot.sendMessage(msg.chat.id, "❌ Documento não encontrado.");
        }
    });

    // Mensagens Gerais
    bot.on("message", async msg => {
        if (!msg.text || msg.text.startsWith('/')) return;
        const resposta = await getGroqReply(msg.text, msg.chat.id);
        bot.sendMessage(msg.chat.id, resposta, { parse_mode: 'Markdown' });
    });

    console.log("🤖 Bot CBMPE Rodando!");
}

init();

// Rota Health Check (Para o Render)
app.get("/", (req, res) => res.send("Bot Online"));
app.listen(PORT, () => console.log(`Web Server na porta ${PORT}`));