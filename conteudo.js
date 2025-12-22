// --- BASE DE DADOS DE DOCUMENTOS ---
export const DOCUMENTOS_DISPONIVEIS = {
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

// --- FUNÇÃO DE CLASSIFICAÇÃO (Com suas correções) ---
export function classificarIntencao(mensagem) {
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
    
    // --- AQUI ESTÁ A CORREÇÃO FORTE PARA "ALTERAR MODELO" ---
    if (
        /(alterar|mudar|editar|modificar|mexer|trocar)/i.test(msg) && 
        /(modelo|formato|letra|fonte|layout|documento|negrito|sublinhado)/i.test(msg)
    ) {
        return 'alterar_modelo';
    }
    // --------------------------------------------------------

    // Novos Modelos / Normas 2022
    if (/(novos modelos|normas técnicas|normas tecnicas|1\.01|1\.02|2022|atualizados)/i.test(msg)) {
        return 'novos_modelos';
    }
    // Como Regularizar Comércio
    if (/(regularizar|regularização|regularizacao|abrir|legalizar|como proceder).*(comércio|comercio|loja|empresa|negócio)/i.test(msg)) {
        return 'como_regularizar';
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
    // Pergunta técnica (Default para RAG)
    if (/(avcb|cbmpe|regulariza|vistoria|atestado|bombeiro|incêndio|incendio|extintor|documento|prazo|validade|projeto|pci|segurança|lei|decreto)/i.test(msg)) {
        return 'tecnica';
    }
    
    // Conversa casual curta
    if (msg.length < 50 && !/\?/.test(msg)) {
        return 'casual';
    }
    
    return 'tecnica';
}

// --- RESPOSTAS RÁPIDAS ---
export function gerarRespostaRapida(intencao, mensagem) {
    const respostas = {
        saudacao: [
            "Olá! 👋 Sou o assistente virtual do CBMPE. Como posso ajudar você hoje?",
            "Oi! 😊 Estou aqui para te ajudar com informações sobre regularização e AVCB. O que você precisa?"
        ],
        agradecimento: [
            "Por nada! 😊 Estou sempre à disposição.",
            "De nada! Conte comigo sempre que precisar de informações do CBMPE. 🔥"
        ],
        despedida: [
            "Até mais! Volte sempre que precisar! 👋",
            "Tchau! Foi um prazer ajudar. Até a próxima! 😊"
        ],
        ajuda: [
            "Posso te ajudar com:\n\n🔥 **AVCB**\n📋 **Regularização**\n📄 **Documentos**\n⏰ **Prazos**\n🧯 **Equipamentos**\n\nMe pergunte qualquer coisa!"
        ],
        sobre_bot: [
            "Eu sou o assistente virtual do CBMPE! 🔥 Fui criado para ajudar com AVCB, documentos e dúvidas técnicas."
        ],
        casual: [
            "Entendi! Mas sou especialista em CBMPE. Tem alguma dúvida sobre AVCB ou documentação?",
        ],
        agendamento: [
            "**AGENDAMENTO DE ATENDIMENTO** 🗓️\n\nNesta página é possível agendar os serviços presenciais.\n\n🔗 **CLIQUE AQUI:**\nhttps://agendamento.bombeiros.pe.gov.br/"
        ],
        taxa_bombeiro: [
            "**TAXA DE BOMBEIROS - TPEI** 💰\n\nConsulte débitos e emita 2ª via aqui.\n\n🔗 **CLIQUE AQUI:**\nhttps://tpei.bombeiros.pe.gov.br/tpeinet/intranet/dwl_ctudo-gerenc.asp?build=1"
        ],
        alterar_modelo: [
            "**🚫 É possível alterar o modelo dos documentos?**\n\n**Não.** Os termos têm que estar no formato apresentado (tamanho, letra, margens).\n\n📝 O solicitante deve **somente substituir as partes em negrito/sublinhado**, mantendo a formatação original."
        ],
        novos_modelos: [
            "**🆕 Novos modelos de documentos**\n\nDevido às Normas Técnicas 1.01/2022 e 1.02/2022, os documentos foram atualizados para dar mais celeridade ao processo. 🚀"
        ],
        como_regularizar: [
            "**🏢 Como regularizar meu comércio?**\n\n1. Acesse www.bombeiros.pe.gov.br > Serviços > Atividades Técnicas\n2. Baixe o requerimento de regularidade\n3. Leve ao posto de atendimento com CNPJ, nota dos extintores e CND da TPEI.\n\n💰 Após pagar a taxa entregue no local, dê entrada na vistoria lá mesmo."
        ]
    };
    
    const opcoes = respostas[intencao];
    // Retorna uma aleatória se houver mais de uma, ou a única
    return opcoes ? opcoes[Math.floor(Math.random() * opcoes.length)] : "Desculpe, não entendi.";
}

// --- LISTAGEM DE DOCUMENTOS ---
export function listarTodosDocumentos() {
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
    lista += "• `/doc anexo_c_carimbo` - Informações Carimbo/Memorial\n\n";
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
    
    return lista;
}