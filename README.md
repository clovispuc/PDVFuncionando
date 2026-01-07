# 🍷 Sistema PDV - Bebidas e Refeições

Sistema completo de Ponto de Venda (PDV) para gestão de vendas, controle de estoque e relatórios para estabelecimentos que vendem bebidas e refeições (almoço e jantar).

## 📋 Visão Geral

Este é um sistema PDV web completo e funcional que permite:
- ✅ Realizar vendas de forma rápida e intuitiva
- ✅ Gerenciar produtos (cadastro, edição, exclusão)
- ✅ Controlar estoque com entradas e saídas
- ✅ Visualizar relatórios de vendas
- ✅ Alertas automáticos de estoque baixo
- ✅ Persistência de dados via API RESTful

## 🚀 Funcionalidades Implementadas

### 1. **PDV - Ponto de Venda** (`index.html` - Tela Principal)
- Interface intuitiva para seleção rápida de produtos
- Carrinho de compras com ajuste de quantidades
- Filtros por categoria (Bebidas / Refeições)
- Busca de produtos em tempo real
- Múltiplas formas de pagamento:
  - 💵 Dinheiro
  - 💳 Cartão de Débito
  - 💳 Cartão de Crédito
  - 📱 PIX
- Observações para cada venda
- Atualização automática de estoque após venda
- Validação de estoque disponível

### 2. **Gestão de Produtos**
- Cadastro completo de produtos com:
  - Nome
  - Categoria (Bebida ou Refeição)
  - Preço de venda
  - Estoque inicial
  - Estoque mínimo para alertas
  - Unidade de medida (un, kg, l)
  - Status (Ativo/Inativo)
- Edição de produtos existentes
- Exclusão de produtos
- Visualização em tabela organizada

### 3. **Controle de Estoque**
- Registro de entradas de estoque
  - Compras de fornecedores
  - Reposições
- Registro de saídas de estoque
  - Perdas
  - Devoluções
  - Ajustes
- Histórico completo de movimentações
- Alertas visuais para:
  - ⚠️ Estoque baixo (quando atinge o mínimo)
  - 🚫 Produtos esgotados
- Validação automática de saídas (não permite negativo)

### 4. **Relatórios e Vendas**
- Dashboard com estatísticas:
  - 💰 Total vendido hoje
  - 🧾 Quantidade de vendas hoje
  - 📅 Total da semana
  - 📊 Ticket médio
- Histórico completo de vendas
- Detalhamento de cada venda com:
  - Produtos vendidos
  - Quantidades
  - Valores
  - Forma de pagamento
  - Data e hora

## 🎯 Estrutura de Dados

### Tabela: `produtos`
```
- id: ID único
- nome: Nome do produto
- categoria: "bebida" ou "refeicao"
- preco: Preço de venda
- estoque_atual: Quantidade em estoque
- estoque_minimo: Quantidade mínima para alerta
- unidade: Unidade de medida (un, kg, l)
- ativo: Status do produto (true/false)
```

### Tabela: `vendas`
```
- id: ID único
- data_venda: Data e hora da venda
- total: Valor total
- forma_pagamento: dinheiro, cartao_debito, cartao_credito, pix
- itens: JSON com produtos vendidos
- observacoes: Observações da venda
```

### Tabela: `movimentacoes`
```
- id: ID único
- produto_id: ID do produto
- produto_nome: Nome do produto
- tipo: "entrada" ou "saida"
- quantidade: Quantidade movimentada
- motivo: Motivo da movimentação
- data: Data da movimentação
- usuario: Usuário responsável
```

## 📁 Estrutura de Arquivos

```
/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos da aplicação
├── js/
│   ├── api.js             # Comunicação com API RESTful
│   ├── utils.js           # Funções utilitárias
│   ├── app.js             # Inicialização e navegação
│   ├── pdv.js             # Módulo PDV (vendas)
│   ├── produtos.js        # Módulo de produtos
│   ├── estoque.js         # Módulo de estoque
│   └── vendas.js          # Módulo de relatórios
└── README.md              # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (ES6+)** - Lógica da aplicação
- **Font Awesome** - Ícones
- **Google Fonts (Inter)** - Tipografia
- **RESTful Table API** - Persistência de dados

## 🌐 URIs e Endpoints da Aplicação

### Páginas da Interface
- `/` ou `index.html` - Acesso principal ao sistema
  - `#pdv` - Tela de vendas (padrão)
  - `#produtos` - Gerenciamento de produtos
  - `#estoque` - Controle de estoque
  - `#vendas` - Relatórios de vendas

### Endpoints da API (Usados internamente)

#### Produtos
- `GET tables/produtos` - Listar produtos
- `GET tables/produtos/{id}` - Buscar produto
- `POST tables/produtos` - Criar produto
- `PUT tables/produtos/{id}` - Atualizar produto
- `PATCH tables/produtos/{id}` - Atualizar parcialmente
- `DELETE tables/produtos/{id}` - Excluir produto

#### Vendas
- `GET tables/vendas` - Listar vendas
- `GET tables/vendas/{id}` - Buscar venda
- `POST tables/vendas` - Criar venda

#### Movimentações
- `GET tables/movimentacoes` - Listar movimentações
- `POST tables/movimentacoes` - Criar movimentação

## 🎨 Características da Interface

- ✨ Design moderno e profissional
- 📱 Interface responsiva (funciona em desktop, tablet e mobile)
- 🎯 Navegação intuitiva via sidebar
- 🔔 Notificações toast para feedback ao usuário
- ⚡ Carregamento assíncrono de dados
- 🎨 Paleta de cores consistente
- 💫 Animações suaves
- ♿ Acessível e fácil de usar

## 📊 Produtos de Exemplo

O sistema vem pré-configurado com produtos de exemplo:

**Bebidas:**
- Coca-Cola 2L
- Guaraná Antarctica 2L
- Cerveja Skol Lata
- Suco de Laranja 1L
- Água Mineral 500ml

**Refeições:**
- Almoço Executivo
- Marmita Grande
- Janta Completa
- Porção de Fritas

## 🚀 Como Usar

### Acesso ao Sistema
1. Abra o arquivo `index.html` em um navegador moderno
2. O sistema iniciará na tela de PDV
3. Use o menu lateral para navegar entre as seções

### Fluxo de Trabalho Recomendado

#### 1️⃣ Primeiro Acesso
1. Acesse **Produtos** para visualizar os produtos cadastrados
2. Adicione, edite ou ajuste produtos conforme necessário
3. Acesse **Estoque** para verificar alertas

#### 2️⃣ Realizar Vendas
1. Na tela **PDV - Vendas**
2. Clique nos produtos para adicionar ao carrinho
3. Ajuste quantidades com +/- ou remova com 🗑️
4. Selecione a forma de pagamento
5. Adicione observações (opcional)
6. Clique em **Finalizar Venda**
7. O estoque é atualizado automaticamente

#### 3️⃣ Gerenciar Estoque
1. Acesse **Estoque**
2. Veja alertas de produtos em falta
3. Use **Entrada** para adicionar estoque
4. Use **Saída** para registrar perdas/devoluções
5. Visualize o histórico de movimentações

#### 4️⃣ Acompanhar Vendas
1. Acesse **Relatórios**
2. Visualize estatísticas do dia e semana
3. Consulte o histórico de vendas
4. Clique em 👁️ para ver detalhes de cada venda

## 🔮 Próximas Funcionalidades (Recomendadas)

### Curto Prazo
- [ ] Impressão de cupom/recibo de venda
- [ ] Exportar relatórios para PDF/Excel
- [ ] Gráficos de vendas por período
- [ ] Produtos mais vendidos
- [ ] Categorias customizáveis

### Médio Prazo
- [ ] Gestão de clientes/fidelidade
- [ ] Sistema de comanda para mesas
- [ ] Controle de fornecedores
- [ ] Gestão de despesas
- [ ] Múltiplos usuários/permissões

### Longo Prazo
- [ ] Integração com impressora fiscal
- [ ] App mobile (PWA)
- [ ] Sistema de reservas
- [ ] Integração com delivery
- [ ] BI e análise avançada de dados

## ⚙️ Configurações Técnicas

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexão com internet (para CDN de bibliotecas)
- Servidor web para execução local

### Executar Localmente (Windows)

**Opção 1: Python (se instalado)**
```bash
# Navegue até a pasta do projeto
cd caminho/do/projeto

# Python 3
python -m http.server 8000

# Acesse: http://localhost:8000
```

**Opção 2: Node.js (se instalado)**
```bash
# Instalar servidor simples
npm install -g http-server

# Na pasta do projeto
http-server -p 8000

# Acesse: http://localhost:8000
```

**Opção 3: VS Code (Live Server Extension)**
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

**Opção 4: Publicar (Recomendado)**
- Use a aba **Publish** para publicar o sistema online
- Acesse de qualquer lugar com um link público

## 🎓 Aprendizados e Tecnologias

Este projeto demonstra:
- Arquitetura modular em JavaScript
- Consumo de API RESTful
- Gerenciamento de estado no frontend
- Manipulação do DOM de forma eficiente
- UX/UI design moderno
- Responsividade mobile-first
- Tratamento de erros
- Feedback visual ao usuário

## 📝 Licença e Uso

Sistema desenvolvido para fins comerciais e educacionais. Livre para uso, modificação e distribuição.

---

## 🆘 Suporte e Contato

Para dúvidas, sugestões ou relatar problemas:
- Consulte este README.md
- Verifique o console do navegador (F12) para debug
- Todos os módulos estão disponíveis globalmente para debug:
  - `window.App` - Aplicação principal
  - `window.PDV` - Módulo de vendas
  - `window.Produtos` - Módulo de produtos
  - `window.Estoque` - Módulo de estoque
  - `window.Vendas` - Módulo de relatórios

---

**Desenvolvido com ❤️ para gestão eficiente de vendas e estoque**

🚀 **Sistema pronto para uso! Boas vendas!** 🚀
