# 🖥️ TechStore — E-commerce Interativo de Hardware

O **TechStore** é uma aplicação de e-commerce de hardware e periféricos desenvolvida como projeto acadêmico. O diferencial do projeto é a sua **apresentação imersiva**: toda a loja é renderizada dentro da tela de um monitor em um cenário fotográfico interativo, com post-its promocionais clicáveis colados na parede ao redor e controles de zoom para alternar entre a visão completa do ambiente e o foco na tela do computador.

O projeto tem duas partes:

* **Front-end** (`public/`): a loja em HTML, CSS e JavaScript puro.
* **Back-end** (`server.js` e `src/`): uma API em **Node.js + Express + SQLite** que entrega o catálogo, valida cupons e registra os pedidos, recalculando todos os valores no servidor.

---

## ✨ Funcionalidades Principais

* **Cenário Fotográfico Interativo (Stage Fitting):**
  * A interface calcula dinamicamente a escala e o posicionamento da cena (`2576x1438px`) para garantir que o monitor e os elementos da parede permaneçam sempre visíveis e proporcionais em qualquer resolução de tela.
  * **Botão de Zoom ("Ampliar monitor" / "Ver cenário inteiro"):** Permite aproximar a câmera diretamente na tela do monitor ou voltar para a visão completa do setup, salvando a preferência do usuário no `localStorage`.
* **Post-its Promocionais na Parede:**
  * Notas adesivas interativas posicionadas sobre o cenário com tipografia manuscrita (`Permanent Marker`) e animação de sublinhado desenhado ao passar o mouse (`stroke-dashoffset`), funcionando como atalhos visuais de ofertas.
* **Navegação e Catálogo Dinâmico:**
  * **Barra de Departamentos com Scroll Customizado:** Menu de abas com botões de navegação lateral (`‹` / `›`) e barra de rolagem arrastável (`tabtrack` / `tabthumb`).
  * **Busca em Tempo Real e Filtros:** Campo de pesquisa por palavras-chave (ex.: *RTX 5060*, *DDR5*, *Ryzen*) combinado com filtros por chips e ordenação de produtos.
  * **Contador Regressivo:** Banner superior de *Esquenta Black Friday* com cronômetro dinâmico e destaque para regras de desconto.
* **Modal de Detalhes e Kits:**
  * Exibição de especificações técnicas em tabela, preços promocionais (de/por), seletor de quantidade e seção de kits recomendados.
* **Carrinho de Compras (Drawer Lateral):**
  * Gaveta deslizante com gerenciamento de itens e quantidades, cálculo automático de subtotais e descontos, aplicação de cupom promocional (ex.: `TECH10`), seleção de método de pagamento (com desconto de 10% no PIX) e feedback visual via notificações *toast* e animação no ícone do carrinho.
* **Pedidos registrados no back-end:**
  * Ao finalizar, o pedido é gravado no banco e a tela final mostra o código (ex.: `TS-482913`) e o total confirmado pelo servidor.

---

## 🛠️ Tecnologias e Conceitos Aplicados

### Front-end

* **HTML5 Semântico e Acessibilidade:** Uso de tags estruturais (`<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`) e atributos ARIA (`role="tablist"`, `role="dialog"`, `aria-modal`, `aria-pressed`, `aria-selected`, `aria-live`/`role="status"`) para navegação por teclado e leitores de tela.
* **CSS3 Moderno:**
  * **CSS Container Queries (`@container`):** O layout interno da loja (`.viewport`) adapta suas colunas (hero, vitrine de ofertas, kits e modal) com base na largura real do monitor virtual, e não apenas na largura da janela do navegador.
  * **CSS Custom Properties (`:root`):** Padronização de paleta de cores (*dark mode*), tipografia (`Archivo`, `Anton`, `JetBrains Mono` e `Permanent Marker`) e escalas de fonte fluídas (`--fs`).
  * **Efeitos Visuais e Respeito a Preferências do Usuário:** Reflexo de tela simulado via `linear-gradient`, `mix-blend-mode: multiply` nos post-its e suporte a `@media (prefers-reduced-motion: reduce)`.
* **JavaScript (Vanilla JS):**
  * Manipulação do DOM, cálculo matemático de matrizes/transformações CSS (`translate` e `scale`), persistência de estado com `localStorage`, controle de eventos de interface e comunicação com a API via `fetch`.

### Back-end

| Tecnologia | Para quê | Por que foi escolhida |
|---|---|---|
| **Node.js** | Rodar JavaScript no servidor | O front já é JavaScript: uma linguagem só no projeto inteiro |
| **Express** | Criar as rotas da API | O framework mais usado e mais simples de explicar |
| **SQLite** (`better-sqlite3`) | Banco de dados | É um único arquivo, sem instalar servidor de banco. A biblioteca é síncrona, então não há callbacks |

---

## 🚀 Como Executar o Projeto

É necessário ter o **Node.js 20 ou mais novo** instalado (testado no Node 22).

1. Clone ou baixe os arquivos deste repositório:
   ```bash
   git clone https://github.com/Joaquimgmz/PCStore
   cd PCStore
   ```
2. Instale as dependências (Express e better-sqlite3), só na primeira vez:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm start
   ```
4. Abra **http://localhost:3000** no navegador.

Na primeira execução o banco é criado sozinho (`data/techstore.db`) e o catálogo é carregado de `data/catalog.json`.

> ⚠️ Não abra o `index.html` com duplo clique: o catálogo vem da API, então a página precisa ser acessada pelo servidor.

Para recarregar o catálogo do zero (sem apagar os pedidos): `npm run seed`.

---

## 📁 Estrutura do Projeto

```
techstore/
├── server.js            Ponto de entrada: monta a API, serve o front e trata erros
├── package.json
├── data/
│   └── catalog.json     Dados iniciais (372 produtos, kits, promoções)
├── src/
│   ├── database.js      Conexão com o SQLite e criação das tabelas
│   ├── seed.js          Copia o catalog.json para o banco
│   ├── queries.js       Consultas SQL reutilizáveis
│   ├── pricing.js       Regras de preço e desconto (função pura)
│   └── routes/
│       ├── catalog.js   GET  /api/catalog
│       ├── coupons.js   GET  /api/coupons/:code
│       └── orders.js    POST /api/orders  e  GET /api/orders/:code
└── public/              Front-end
    ├── index.html
    ├── css/style.css
    └── js/script.js
```

---

## 🔌 Como as Partes Conversam

```
 Navegador (public/)                    Servidor (Node + Express)                Banco
 ───────────────────                    ─────────────────────────                ─────
 abre a página ───── GET /api/catalog ──► routes/catalog.js ── queries.js ────► products, kits
 digita cupom  ───── GET /api/coupons/X ► routes/coupons.js ── queries.js ────► coupons
 finaliza      ───── POST /api/orders ──► routes/orders.js ──► pricing.js
                                                      └──────────────────────► orders, order_items
```

**Camadas:** a *rota* recebe e valida a requisição → *queries* fala com o banco → *pricing* aplica as regras de negócio. Cada arquivo tem uma responsabilidade só.

### A API

| Método e rota | O que faz | Resposta |
|---|---|---|
| `GET /api/catalog` | Devolve produtos, promoções e kits | `{ products, promo, kits }` |
| `GET /api/coupons/:code` | Verifica se um cupom existe | `{ valid: true, code, percent }` ou `{ valid: false }` |
| `POST /api/orders` | Cria um pedido | `201` com código e totais, ou `400` com `{ error }` |
| `GET /api/orders/:code` | Consulta um pedido e seus itens | pedido completo, ou `404` |

Exemplo de pedido (o corpo usa o mesmo formato do `cart` do front):

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":{"amd-ryzen-7-7800x3d":1},"coupon":"TECH10","payment":"pix"}'
```

Códigos HTTP usados: **200** ok · **201** criado · **400** dados inválidos · **404** não encontrado · **500** erro do servidor.

### Banco de dados

| Tabela | Guarda |
|---|---|
| `products` | Produtos (`attr` e `specs` são JSON em texto) |
| `highlights` | Produtos das promoções da home e dos post-its (f16, rtx5060…) |
| `kits` / `kit_items` | Kits de upgrade e os produtos de cada um |
| `coupons` | Cupons (`TECH10` = 10%) |
| `orders` | Pedidos, com todos os valores calculados |
| `order_items` | Itens de cada pedido (com nome e preço **copiados** na hora da compra) |

---

## 💰 Regras de Preço (`src/pricing.js`)

1. **Subtotal** = soma de preço × quantidade
2. **Kit** = 5% sobre os itens de cada kit completo no carrinho
3. **Cupom** = % do cupom sobre (subtotal − kit)
4. **PIX** = 10% sobre o que sobrou (só se pagar no PIX)
5. **Frete** = grátis a partir de R$ 299 de subtotal; senão R$ 29,90

Exemplo (Kit Gamer AM5 + cupom TECH10 + PIX):

| | Valor |
|---|---|
| Subtotal | R$ 4.297,00 |
| Kit (5%) | − R$ 214,85 |
| Cupom (10% de 4.082,15) | − R$ 408,22 |
| PIX (10% de 3.673,93) | − R$ 367,39 |
| Frete | Grátis |
| **Total** | **R$ 3.306,54** |

---

## 🧠 Decisões Importantes

1. **O servidor não confia no navegador.** O front manda só *id e quantidade*; preços, descontos e frete são recalculados no servidor com os dados do banco. Se alguém alterar o JavaScript para enviar um preço menor, nada muda.
2. **O front calcula também, mas só para mostrar.** O carrinho precisa responder na hora, então o front faz a conta para exibir. Quem vale é o total que o servidor devolve no pedido.
3. **Preço copiado no pedido.** `order_items` guarda nome e preço da compra. Se o produto mudar de preço depois, o pedido antigo continua correto.
4. **SQL com parâmetros (`?`).** Os valores vão separados do texto SQL, o que impede *SQL Injection*.
5. **Transação.** Pedido e itens são gravados juntos (`db.transaction`): ou grava tudo, ou nada.
6. **Validação de entrada.** Produto inexistente, quantidade inválida (não inteira, menor que 1 ou maior que 99), pagamento desconhecido e cupom falso retornam `400`.
7. **Função pura para as regras.** `calculateTotals` não acessa banco nem rede, então é fácil de testar e de explicar.
8. **Busca e filtros no navegador.** Com 372 produtos é rápido e evita uma chamada à API a cada tecla digitada.

---

## 🔄 O que Mudou no Front ao Integrar o Back-end (`public/js/script.js`)

* O catálogo não está mais dentro do JavaScript: é buscado em `GET /api/catalog` e só então a loja inicia (`iniciarLoja`).
* **Aplicar cupom** consulta `GET /api/coupons/:code` (antes a lista de cupons ficava no navegador).
* **Finalizar pedido** envia `POST /api/orders` (antes o código do pedido era sorteado no navegador).

---

## ⚠️ Limitações

* Sem login/cadastro de clientes.
* Sem controle de estoque, pagamento real nem envio de e-mail (a loja é de demonstração e nenhuma cobrança é feita).
* Valores em `REAL` (decimal) com arredondamento a cada etapa; em produção o ideal é guardar **centavos como inteiro**.
* Sem limite de requisições (*rate limit*) e sem HTTPS.

---

## ❓ Perguntas que Podem Aparecer na Apresentação

* **Por que SQLite e não MySQL/PostgreSQL?** Para não exigir instalação; o SQL é o mesmo, e trocar de banco mexeria quase só em `database.js` e `queries.js`.
* **O que é uma API REST?** Rotas que representam recursos (`/orders`) e usam os métodos HTTP (GET lê, POST cria) devolvendo JSON.
* **O que é middleware?** Função que roda antes da rota. Ex.: `express.json()` transforma o corpo da requisição em `req.body`.
* **O que é o seed?** Carga inicial do banco a partir de `data/catalog.json`.
* **Como o cupom é protegido?** O cupom existe só no banco; o front pergunta à API e o servidor valida de novo no pedido.
