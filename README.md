# 🔥 Chatbot CBMPE - Assistente Virtual de Regularização

## 🌟 Visão Geral do Projeto

Este projeto consiste em um **Assistente Virtual** especializado no **Corpo de Bombeiros Militar de Pernambuco (CBMPE)**, desenvolvido para simplificar o processo de obtenção de informações e documentos relacionados à segurança contra incêndio e pânico.

O chatbot atende em duas plataformas:

1.  **Backend (Node.js):** Gerencia a lógica central, a IA, a Base de Conhecimento e expõe a API para a versão Web, além de hospedar a funcionalidade completa do bot para o **Telegram**.
2.  **Frontend (Web):** Interface interativa em HTML/CSS/JS (desenvolvida para ser hospedada via GitHub Pages), que se conecta à API do backend.

### 🤖 Principais Funcionalidades

O assistente foi treinado para fornecer suporte em:

* **AVCB** (Atestado de Vistoria do Corpo de Bombeiros) e AR (Atestado de Regularidade).
* Processos de **regularização preventiva** de edificações.
* Fornecimento de **modelos de documentos** oficiais (requerimentos, procurações, declarações, etc.).
* Consultas sobre **legislação técnica** (COSCIP, Leis e Decretos Estaduais).

### 📚 Tecnologia Central: RAG

Utilizamos a tecnologia **RAG** (*Retrieval-Augmented Generation*), onde a IA da **Groq** é alimentada com sua **Base de Conhecimento** (todos os PDFs de legislação e anexos do CBMPE) para garantir que as respostas sejam factuais, precisas e baseadas nos documentos oficiais.
