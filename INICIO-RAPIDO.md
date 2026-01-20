# ⚡ Guia de Início Rápido (Modo Frontend)

Este guia é para quem deseja testar o visual e o fluxo do sistema rapidamente utilizando o **VS Code**, sem a necessidade de configurar o ambiente Python/Banco de Dados imediatamente.

> **Nota:** Neste modo, o sistema usará a memória do navegador (LocalStorage). Funcionalidades como **Impressão Térmica** não funcionarão sem o backend.

## 🛠️ Pré-requisitos

1.  **Visual Studio Code (VS Code)** instalado.
2.  Extensão **Live Server** instalada no VS Code.
    * *Como instalar:* No VS Code, clique no ícone de extensões (quadrado no menu esquerdo), digite `Live Server` (autor: Ritwick Dey) e clique em `Install`.

## 🚀 Como Rodar

1.  Abra a pasta do projeto `PDVFuncionando` no VS Code.
2.  Localize o arquivo **`index.html`** na lista de arquivos à esquerda.
3.  Clique com o botão **direito** sobre o `index.html`.
4.  Selecione a opção **"Open with Live Server"**.

O navegador padrão abrirá automaticamente (geralmente em `http://127.0.0.1:5500/index.html`).

## ⚠️ Limitações deste Modo

Ao rodar pelo Live Server, você está utilizando o modo **"Cliente Puro"**:

| Funcionalidade | Status | Obs |
| :--- | :---: | :--- |
| **Cadastro de Produtos** | ✅ OK | Salvo no navegador (LocalStorage). |
| **Realizar Vendas** | ✅ OK | Cálculos e carrinho funcionam perfeitamente. |
| **Histórico de Vendas** | ✅ OK | Visível apenas neste computador/navegador. |
| **Impressão de Cupom** | ❌ Off | Requer o servidor Python rodando. |
| **Banco SQL Central** | ❌ Off | Os dados não são salvos no arquivo `.db`. |

---

### 🔄 Como limpar os dados de teste?

Como os dados ficam no navegador, para "resetar" o sistema:
1.  No navegador, aperte `F12` (Ferramentas de Desenvolvedor).
2.  Vá na aba **Application** (ou Aplicativo).
3.  No menu esquerdo, em **Storage**, expanda **Local Storage**.
4.  Clique no endereço do site.
5.  Clique com o botão direito nas chaves (`pdv_produtos`, `pdv_vendas`) e selecione **Delete**.
6.  Recarregue a página (`F5`).

---

### 🏁 Quer o modo completo (com Impressão)?

Para ativar a impressão e o banco de dados real, feche o Live Server e siga as instruções do arquivo `README.md` para rodar o comando:
`python app.py`
