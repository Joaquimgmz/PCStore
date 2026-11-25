# 🖥️ TechStore — E-commerce Interativo de Hardware

O **TechStore** é uma aplicação front-end de e-commerce de hardware e periféricos desenvolvida como projeto acadêmico. O diferencial do projeto é a sua **apresentação imersiva**: toda a loja é renderizada dentro da tela de um monitor em um cenário fotográfico interativo, com post-its promocionais clicáveis colados na parede ao redor e controles de zoom para alternar entre a visão completa do ambiente e o foco na tela do computador.

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

---

## 🛠️ Tecnologias e Conceitos Aplicados

* **HTML5 Semântico e Acessibilidade:** Uso de tags estruturais (`<main>`, `<nav>`, `<aside>`, `<section>`, `<footer>`) e atributos ARIA (`role="tablist"`, `role="dialog"`, `aria-modal`, `aria-pressed`, `aria-selected`, `aria-live`/`role="status"`) para navegação por teclado e leitores de tela.
* **CSS3 Moderno:**
  * **CSS Container Queries (`@container`):** O layout interno da loja (`.viewport`) adapta suas colunas (hero, vitrine de ofertas, kits e modal) com base na largura real do monitor virtual, e não apenas na largura da janela do navegador.
  * **CSS Custom Properties (`:root`):** Padronização de paleta de cores (*dark mode*), tipografia (`Archivo`, `Anton`, `JetBrains Mono` e `Permanent Marker`) e escalas de fonte fluídas (`--fs`).
  * **Efeitos Visuais e Respeito a Preferências do Usuário:** Reflexo de tela simulado via `linear-gradient`, `mix-blend-mode: multiply` nos post-its e suporte a `@media (prefers-reduced-motion: reduce)`.
* **JavaScript (Vanilla JS):**
  * Manipulação do DOM, cálculo matemático de matrizes/transformações CSS (`translate` e `scale`), persistência de estado com `localStorage` e controle de eventos de interface.

---

## 🚀 Como Executar o Projeto

Por ser desenvolvido inteiramente com tecnologias web nativas (HTML, CSS e JavaScript puro), não há necessidade de instalar dependências ou configurar servidores complexos:

1. Clone ou baixe os arquivos deste repositório:
   ```bash
   git clone https://github.com/Joaquimgmz/PCStore
