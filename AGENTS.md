# AGENTS.md — Invocação Automática de Skills por Fase de Projeto

> Este arquivo é lido pelo agente em TODO trabalho, em qualquer projeto. As regras abaixo são diretivas, não sugestões: o agente deve acionar as skills listadas automaticamente, sem perguntar ao usuário antes, sempre que a condição de gatilho for satisfeita. Só pergunta ao usuário se a ação for destrutiva (ex: force push, delete de dados, revert de commit), se duas skills conflitarem sobre a mesma tarefa, ou se o agente estiver em dúvida sobre qual skill aplicar.

---

## Regra 0 — Detecção de estado (condicional)

Ao iniciar trabalho num projeto, o agente SEMPRE roda `gsd-next` pra detectar o estado atual **se o projeto já tiver um `.planning/` ou `ROADMAP.md`**. Se não tiver, pula direto pra regra aplicável — não pergunta "em que estamos".

Se não houver skill mapeada pra uma necessidade encontrada, o agente aciona `find-skills` sozinho, instala, e informa o que instalou.

Se ficar em dúvida entre duas skills aplicáveis, aciona `ask-matt` internamente pra decidir — não expõe essa dúvida ao usuário a menos que a decisão mude o resultado visível do trabalho.

---

## Regra 0.5 — Adoção de GSD em Projeto Existente

**Gatilho:** projeto com código e `CONTEXT.md` (ou `README.md`), mas **sem** `.planning/` ou `ROADMAP.md` — ou seja, já existe código mas o GSD nunca foi configurado.

**Ação automática, nesta ordem:**
1. `gsd-onboard` — mapeia o codebase existente e gera `.planning/` inicial
2. `gsd-ingest-docs` — se existirem ADRs, PRDs, SPECs ou docs soltos, ingere no `.planning/`
3. `gsd-map-codebase` — gera os documentos de mapeamento do codebase (tech, arch, quality, concerns)
4. A partir daí, o projeto entra no fluxo normal (Regra 0 → detecta estado → segue)

Não pede confirmação — só informa que o GSD foi inicializado pro projeto existente e mostra o que foi gerado.

---

## Regra 1 — Início de projeto ou milestone

**Gatilho:** repositório vazio ou sem CONTEXT.md / primeira mensagem do tipo "vamos começar um projeto novo" / pedido de novo milestone num projeto existente.

**Ação automática, nesta ordem:**
1. `gsd-new-project` (ou `gsd-new-milestone` se já existir projeto)
2. `setup-matt-pocock-skills`
3. `setup-pre-commit`
4. `domain-modeling` + `codebase-design` (em paralelo, se o domínio ainda não tiver CONTEXT.md/ADRs)
5. Se o projeto for TypeScript: `setup-ts-deep-modules`

Não pede confirmação pra rodar `setup-pre-commit` — só avisa depois do que configurou.

---

## Regra 2 — Ideia solta / ainda sem escopo

**Gatilho:** mensagem exploratória, sem pedido de código concreto ainda ("queria fazer algo que...", "tem uma ideia de...").

**Ação automática:** `gsd-explore` primeiro. Se o usuário topar uma direção, `gsd-capture` a decisão automaticamente antes de seguir. Se pedir algo visual pra entender a ideia: `gsd-sketch` ou `prototype`.

---

## Regra 3 — Planejamento de uma feature/fase

**Gatilho:** escopo já definido, precisa virar plano executável.

**Ação automática:** `gsd-plan-phase` gera o PLAN.md sem que o usuário peça explicitamente "cria um plano". Se a spec ainda estiver em formato de conversa solta: passa por `to-spec` antes. Se precisar virar tickets: `to-tickets` na sequência, sem pedir.

Antes de decisões técnicas relevantes (escolha de lib, arquitetura, provider): `research` roda automaticamente contra fontes primárias antes de a decisão ser proposta ao usuário — **mas antes**, checa `.planning/RESEARCH.md` e `.planning/research/` pra ver se já existe pesquisa sobre o tópico. Se existir, reutiliza. Se não, pesquisa e salva no `.planning/`.

---

## Regra 4 — Qualquer trabalho visual (UI, tela, componente, marca, apresentação)

**Gatilho:** menção a tela, componente, layout, cor, marca, logo, banner, slide, landing page.

**Ação automática, avaliando complexidade:**
1. `ui-ux-pro-max` — **consultivo**: roda quando o design ainda não existe ou precisa de direção (estilo, paleta, tipografia). Se o design já estiver definido, pula.
2. `design` / `design-system` / `banner-design` / `brand` / `slides` — **só quando precisa criar assets novos** (logo, CIP, apresentação, etc.). Se o ativo já existe e só precisa de ajuste de estilo, pula.
3. `ui-styling` — **sempre** quando houver código de UI sendo escrito.
4. `impeccable` — **só em entregas finais**, não em iterações internas. Roda quando o usuário diz "pronto" ou "tá finalizado", ou quando a tarefa é claramente uma entrega (PR, deploy, demo).

Se o pedido for só um mockup rápido pra validar ideia: `gsd-sketch`/`prototype` substitui os passos 2–3.

---

## Regra 5 — Código de frontend (React/Next.js e afins)

**Gatilho:** qualquer arquivo `.tsx`/`.jsx`/componente React sendo criado ou editado.

**Ação automática:** `vercel-react-best-practices` (e `vercel-optimize` se o deploy for Vercel/Next/Nuxt/Astro/SvelteKit) aplicados durante a escrita do código, não como revisão posterior. Depois de qualquer bloco de código React relevante: `react-doctor` roda sozinho pra pegar lint/a11y/bundle antes de entregar.

---

## Regra 5.1 — Frontend Vanilla (HTML/CSS/JS puro)

**Gatilho:** qualquer arquivo `.html`, `.css`, ou `.js` (sem framework) sendo criado ou editado, OU menção a "vanilla", "puro", "sem framework".

**Ação automática:**
1. `html-css-best-practices` — aplicado durante toda escrita de HTML/CSS. Regras: semântica HTML, acessibilidade, CSS organizado, responsividade.
2. `frontend-design` — roda quando o design precisa de direção (estilo, paleta, tipografia, composição). Se o design já estiver definido, pula.

**Diferença da Regra 5:** a Regra 5 é pra React/Next.js (`.tsx`/`.jsx`). Esta é pra projetos vanilla sem framework.

---

## Regra 6 — Arquitetura / backend / domínio

**Gatilho:** qualquer decisão de módulo novo, service, entidade de domínio.

**Ação automática:** `codebase-design` e `domain-modeling` são consultados/atualizados junto com a mudança, não depois. A cada ~5 mudanças estruturais relevantes acumuladas no projeto, `improve-codebase-architecture` roda um scan automático e reporta oportunidades, sem que o usuário peça.

Se o projeto crescer a ponto de ficar difícil de navegar (muitos módulos/arquivos), `graphify` roda automaticamente pra gerar o knowledge graph.

---

## Regra 7 — Escrevendo código (execução)

**Gatilho:** qualquer tarefa de implementação.

**Classificação de tamanho — heurística por arquivos afetados:**
- **Trivial** (< 3 arquivos): `gsd-fast`
- **Pequena** (< 10 arquivos): `gsd-quick`
- **Grande** (> 10 arquivos): `gsd-execute-phase`

**Exceção:** se uma única arquivo receber muitas alterações (> 50 linhas alteradas ou > 5 funções afetadas), o agente PERGUNTA ao usuário qual skill aplicar, explicando:
- Quais skills estão em dúvida
- Por que está em dúvida
- O que cada skill faz nesse contexto

O usuário decide e o agente segue.

Se a tarefa envolver lógica nova (não só estilo/config): `tdd` é aplicado por padrão (red-green-refactor), a menos que o usuário peça explicitamente pra pular teste.

---

## Regra 8 — Testes

**Gatilho:** feature implementada e ainda sem cobertura de teste correspondente.

**Ação automática:** o agente NÃO espera o usuário pedir teste — gera automaticamente:
- `tdd`/`javascript-typescript-jest` pra lógica unitária
- `playwright`/`playwright-e2e-testing` pra fluxo de UI ponta a ponta, se a feature tiver interface

Se um bug for reportado ou um teste falhar de forma não óbvia: `diagnosing-bugs` roda antes de qualquer tentativa de correção às cegas. Bugs que persistem entre sessões: `gsd-debug` (estado persistente).

---

## Regra 9 — Antes de qualquer PR/merge

**Ação automática dependendo do destino:**

### Commits locais (não vai pra branch remota):
1. `no-ai-slop` — limpa texto/código
2. `code-review` — review contra standards

### PRs pra branch principal (main/develop), nesta ordem, sem pedir permissão:
1. `no-ai-slop` — limpa o texto/código de padrões genéricos de IA
2. `code-review` — review completo contra standards + spec
3. `gsd-code-review` — bugs/segurança/qualidade no nível de arquivo
4. Se houver superfície de ataque relevante (input do usuário, auth, dados sensíveis): `perform-security-review` + `typescript-security-review` (se TS/Node)
5. Se houve mudança visual: `gsd-ui-review`
6. `dependency-audit` se dependências novas foram adicionadas na tarefa
7. `gsd-ship` — só depois de todos os passos acima passarem

O agente nunca pula os passos 1–4 achando que "essa mudança é pequena". Só reduz o escopo do review se o usuário pedir explicitamente.

### Ordem de Review — Resolução de sobreposição (Regras 9, 15.6 e 17.4)

Quando um PR envolver Python e/ou SQL/DB, as reviews rodam na seguinte ordem para evitar duplicação:

1. **Regra 9** — roda PRIMEIRO (review geral de código). É a gate de entrada.
2. **Regra 15.6** — roda DEPOIS da Regra 9, apenas se o código for Python. Se a Regra 9 já cobriu tudo que a 15.6 faria, ela apenas confirma ("sem achados adicionais") e segue.
3. **Regra 17.4** — roda EM PARALELO com a 15.6, apenas se houver queries SQL ou schema de banco. Não espera a 15.6 terminar.

**Regra prática:** se a Regra 9 já aprovou e não há SQL/DB no PR, a 15.6 não roda — o agente segue direto pro próximo passo. Nunca roda a mesma review duas vezes.

---

## Regra 10 — Git / conflitos / changelog

**Gatilho:** merge conflict, rebase, ou pedido de release.

**Ação automática:** `resolving-merge-conflicts` entra sozinho ao detectar conflito. `changelog-generator` roda automaticamente antes de qualquer release/tag. `gsd-undo` só é acionado com confirmação explícita do usuário (ação destrutiva).

---

## Regra 11 — Verificação final / QA

**Gatilho:** fase marcada como "pronta" pelo `gsd-execute-phase` ou pelo usuário.

**Ação automática:** `gsd-verify-work` (UAT conversacional) e `gsd-review` (peer review cross-AI) rodam antes de a fase ser fechada, mesmo sem o usuário pedir "verifica".

---

## Regra 12 — Documentação

**Gatilho:** feature nova sem documentação correspondente, ou pedido de docs.

**Ação automática:** `doc-coauthoring` conduz a escrita. Se o destinatário for outro agente (AGENTS.md, skill nova): `writing-for-agents`. Escolha de estilo sem perguntar ao usuário:
- narrativa/onboarding → `writing-beats`
- exploração livre/notas → `writing-fragments`
- doc técnica estruturada → `writing-shape`

`changelog-generator` atualiza o changelog público junto.

---

## Regra 13 — Handoff / continuidade entre sessões

**Gatilho:** contexto ficando longo, ou pedido de passar pra outro agente/sessão.

**Ação automática:** `handoff` (ou `claude-handoff` se for pra um background agent) compacta o essencial sem que o usuário peça resumo manual. Projetos longos usam `gsd-thread` pra manter contexto entre sessões automaticamente. Projetos com múltiplas frentes simultâneas: `gsd-workspace`/`gsd-workstreams` isolam automaticamente.

---

## Regra 14 — Infraestrutura de IA (Omni)

**Gatilho:** o projeto integra mais de um provider de LLM, ou tem `omni-*` ou `mcp` no `package.json`/`opencode.json`.

**Ação automática:** `omni-providers`/`omni-models` na configuração inicial; `omni-cache`/`omni-compression`/`omni-combos-routing`/`omni-budget` entram automaticamente assim que o projeto for pra produção, sem esperar o usuário pedir otimização de custo.

---

## Regra 15 — Desenvolvimento Python (_QUALIFICADOR_)

> Esta regra se aplica a QUALQUER projeto Python detectado (presença de `pyproject.toml`, `setup.py`, `setup.cfg`, `requirements.txt`, `Pipfile`, `uv.lock`, ou extensão `.py` como fonte principal). Aplica-se EM PARALELO com as regras gerais 0–14, nunca as substitui.

### 15.1 — Detecção automática de projeto Python

Ao detectar um projeto Python, o agente SEMPRE verifica:
1. **Framework web** (FastAPI/Django/Flask) → carrega a skill correspondente automaticamente
2. **Gerenciador de pacotes** (uv/pip/poetry) → `uv-package-manager` se uv estiver presente, senão mantém o fluxo padrão
3. **Testes** → `python-testing-patterns` é acionado antes de escrever qualquer teste
4. **Qualidade de código** → `python-patterns` é aplicado durante a escrita de código

### 15.2 — Início de projeto Python

**Gatilho:** novo projeto Python ou primeiro arquivo `.py` criado.

**Ação automática, nesta ordem:**
1. `python-patterns` — padrões idiomáticos Python (legibilidade, PEP 8, naming)
2. `uv-package-manager` — configuração de dependências e ambiente virtual
3. Se framework detectado: `fastapi-python` / `django-python` / `flask-python`
4. `python-testing-patterns` — configuração de testes com pytest

### 15.3 — Escrita de código Python

**Gatilho:** qualquer arquivo `.py` sendo criado ou editado.

**Ação automática:**
- `python-patterns` — aplicado durante toda escrita de código
- `python-testing-patterns` — testes gerados automaticamente para lógica nova
- `debugging` — disponível para qualquer bug reportado

### 15.4 — Frameworks web Python

**Gatilho:** detecção de framework específico.

**Ação automática:**
- **FastAPI**: `fastapi-python` — async/await, Pydantic v2, dependency injection
- **Django**: `django-python` — models, views, templates, ORM
- **Flask**: `flask-python` — blueprints, rotas, extensões

### 15.5 — Segurança Python

**Gatilho:** qualquer código que lide com auth, inputs do usuário, dados sensíveis, ou ferramentas de segurança.

**Ação automática:**
- `python-cybersecurity-tool-development` — se o projeto for uma ferramenta de segurança
- `python-security-scan` — scan automático de vulnerabilidades

### 15.6 — Code Review Python

**Gatilho:** PR ou merge de código Python.

**Ação automática, nesta ordem:**
1. `python-patterns` — conformidade com PEP 8 e padrões
2. `code-review-and-quality` — review multi-dimensional (5 eixos)
3. `complexity` — análise de complexidade ciclomática
4. Se houver superfície de ataque: `python-cybersecurity-tool-development`

### 15.7 — Deploy Python

**Gatilho:** preparação para deploy de aplicação Python.

**Ação automática:**
- `python-appservice-deploy` — se deploy for no Azure App Service
- `ci-cd` — pipeline de CI/CD para Python
- `uv-package-manager` — otimização de build e dependências

### 15.8 — Debugging Python

**Gatilho:** bug reportado ou erro não óbvio em código Python.

**Ação automática:**
- `debugging` — técnicas de debug com pdb e IDE
- `complexity` — se o bug estiver em código complexo

### 15.9 — Documentação Python

**Gatilho:** feature nova sem documentação ou pedido de docs.

**Ação automática:**
- `python-patterns` — docstrings idiomáticas
- `doc-coauthoring` — documentação estruturada
- `changelog-generator` — changelog atualizado

---

## Regra 16 — Reuse First: Não reinventar a roda (_QUALIFICADOR_)

> Esta regra se aplica ANTES de qualquer implementação. O agente SEMPRE pesquisa soluções existentes antes de escrever código novo.

### 16.1 — Detecção automática

Ao receber uma tarefa de implementação (feature, função, componente, endpoint, utility), o agente SEMPRE executa esta sequência **antes de escrever qualquer código**:

0. **Checar pesquisa existente** — `.planning/RESEARCH.md` e `.planning/research/` antes de pesquisar de novo. Se já existir research sobre o tópico, reutiliza. Também checa código existente em `src/` e dependências instaladas (`package.json`, `pyproject.toml`, `requirements.txt`).

1. **Pesquisa web** — `reuse-first` + `shunk031-research-before-implementation` rodam automaticamente buscando:
   - Bibliotecas/módulos que resolvem exatamente o mesmo problema
   - Padrões da comunidade (ex: PyPI para Python, npm para Node)
   - Soluções open-source já validadas
   - Artigos e documentação oficial do ecossistema

2. **Análise de reuso** — `reduce-reinvention` avalia:
   - Código já existente neste mesmo projeto que pode ser reaproveitado
   - Funções/módulos internos duplicados
   - Dependências externas que eliminam necessidade de código novo

3. **Decisão automática:**
   - Se existe solução madura (>1k stars, boa manutenção, compatível): **usa a solução existente**
   - Se existe parcialmente: **estende em vez de reescrever**
   - Se não existe nada adequado: **implementa e documenta o motivo** (ADR)

### 16.2 — Gatilhos por tipo de tarefa

| Tarefa | Ação automática |
|--------|-----------------|
| Função utilitária nova | Pesquisa em PyPI/npm/pip antes de implementar |
| Componente UI | Busca componentes equivalentes em libs existentes (shadcn, radix, etc) |
| Endpoint de API | Verifica frameworks e middlewares disponíveis |
| Autenticação/Authorization | **NUNCA implementa do zero** — usa libs (OAuth2, JWT, etc) |
| Validação de dados | Usa biblioteca existente (Pydantic, zod, etc) em vez de regex manual |
| Date/Time/Timezone | Usa libs de timezone em vez de lidar com UTC manualmente |
| Email sending | Usa serviço/library existente em vez de SMTP manual |
| File upload/storage | Usa S3/GCS SDK em vez de handler HTTP manual |

### 16.3 — Exceções (implementa do zero apenas quando)

- É um projeto didático/exploratório (o usuário confirma que é pra aprender)
- A solução existente tem vulnerabilidades conhecidas ou está abandonada
- O caso de uso é genuinamente único e não tem equivalente
- A dependência externa adiciona overhead desproporcional ao benefício

---

## Regra 17 — SQL / Banco de Dados (PostgreSQL + SQLite)

> Esta regra se aplica a QUALQUER projeto que use banco de dados relacional (presença de arquivos `.sql`, migrations, models SQLAlchemy/Django ORM, `psycopg2`/`aiopg`/`asyncpg`/`sqlite3` no código, ou configuração de database em `.env`/`settings`). **PostgreSQL e SQLite são os únicos SGBDs suportados** — MySQL/MariaDB não são cobertos por esta regra.

### 17.1 — Detecção automática de banco de dados

Ao detectar uso de banco relacional, o agente SEMPRE verifica:
1. **SGBD** — PostgreSQL (`psycopg2`/`aiopg`/`asyncpg`/`sqlalchemy`+`postgresql`) ou SQLite (`sqlite3`/`sqlalchemy`+`sqlite`)
2. **ORM** — SQLAlchemy, Django ORM, Tortoise, ou raw SQL
3. **Migrations** — Alembic, Django migrations, SQLArmas, ou sem sistema de migrations
4. **Docker** — se PostgreSQL roda em container (compose)

**Ação automática quando Docker detectado:**
- Se existir `Dockerfile` ou `docker-compose.yml`: rodar `docker compose config` pra validar configuração
- Se houver lint disponível: rodar `hadolint` no Dockerfile (ou `docker build --no-cache` como fallback)
- Se o commit mexer em arquivos Docker: tag `[docker]` no commit
- Se o banco estiver em container: verificar se o container está rodando antes de rodar migrations

### 17.2 — Design de schema (tabelas novas)

**Gatilho:** criação de tabela, model, ou migration.

**Ação automática, nesta ordem:**
1. `postgresql-table-design` — padrões de normalização, tipos de dados, constraints
2. `database-schema-designer` — validação do modelo relacional
3. `postgresql-best-practices` — conventions do ecossistema

**Regras obrigatórias:**
- Sempre usar `SERIAL`/`BIGSERIAL` para chaves primárias (não `INTEGER` + auto-increment manual)
- Sempre definir `NOT NULL` + `DEFAULT` onde aplicável
- Sempre criar `INDEX` em colunas de FK e colunas frequentemente consultadas
- Sempre incluir `created_at` e `updated_at` em tabelas de negócio
- Usar `TEXT` em vez de `VARCHAR(n)` quando o limite for arbitrário
- Usar `NUMERIC`/`DECIMAL` para dinheiro, nunca `FLOAT`

### 17.3 — Escrita de queries SQL

**Gatilho:** qualquer query SQL sendo escrita ou editada.

**Ação automática:**
- `sql-optimization-patterns` — padrões de performance (JOINs, subqueries, CTEs)
- `sql-optimization` — indexação, explain analyze, partitioning
- `postgresql-optimization` — otimizações específicas do PostgreSQL (VACUUM, statistics, wal)

### 17.4 — Code Review de SQL

**Gatilho:** PR ou revisão de código com queries SQL.

**Ação automática, nesta ordem:**
1. `sql-code-review` — qualidade das queries (N+1, missing indexes, cartesian products)
2. `postgresql-code-review` — PostgreSQL-specific (lock patterns, deadlocks, long queries)
3. `postgresql-best-practices` — conformidade com padrões

### 17.5 — SQLite específicas

**Gatilho:** uso de SQLite no projeto.

**Ação automática:**
- `sqlite-database-expert` — configuração WAL, pragma tuning, testes paralelos
- Regras 17.2–17.4 se aplicam com adaptações (SQLite não tem `SERIAL`, usa `INTEGER PRIMARY KEY`)

### 17.6 — Migrations

**Gatilho:** criação ou alteração de migration.

**Ação automática:**
- `database-schema-designer` — valida a migration antes de executar
- `postgresql-table-design` — garante tipos corretos
- Se migration for destrutiva (drop column, rename): **SEMPRE pede confirmação** antes de executar

### 17.7 — Performance de banco

**Gatilho:** query lenta reportada, ou pedido de otimização de performance.

**Ação automática:**
- `sql-optimization` — analisa EXPLAIN ANALYZE
- `postgresql-optimization` — revisa configurações do PostgreSQL (shared_buffers, work_mem, etc)
- `sql-optimization-patterns` — sugere reescrita de queries lentas

---

## Regra 18 — Projeto Fullstack (Python + React no mesmo PR)

> Esta regra se aplica quando um único PR ou commit envolve alterações tanto no backend Python quanto no frontend React/Next.js.

### 18.1 — Ordem de execução

**Ação automática, nesta ordem:**
1. **Regra 15** (backend Python) — executa primeiro, resolve dependências de API
2. **Regra 5** (frontend React) — executa depois, consome APIs do backend
3. **Regra 9** (review unificado) — roda uma única vez cobrindo os dois lados
4. **Regra 15.6** (review final Python) — confirma conformidade do backend

### 18.2 — Commits

**Ação automática:**
- Separar em commits distintos quando possível: `[backend]` e `[frontend]`
- Se não for possível separar (mudança acoplada): usar tag `[fullstack]`
- Nunca misturar `[backend]` e `[frontend]` no mesmo commit sem justificativa

### 18.3 — Testes

**Ação automática:**
- Rodar testes do backend (pytest) **e** testes do frontend (jest/playwright) antes do merge
- Se **um** falhar: **bloqueia o merge** — não aprova PR com teste falhando
- Se ambos passarem: segue o fluxo normal de review (Regra 9)

### 18.4 — Sobreposição com outras regras

- Regra 5 e 15 rodam em sequência, não em paralelo
- Se o PR só mexe em Python mas o projeto tem React: Regra 18 **não** aciona (usa Regra 15 normalmente)
- Se o PR só mexe em React mas o projeto tem Python: Regra 18 **não** aciona (usa Regra 5 normalmente)
- Regra 18 **só** entra quando o PR toca nos dois lados

---

## Skills que faltam — instalar SOMENTE com confirmação do usuário

O agente não instala automaticamente. Quando detectar uma lacuna, o agente:
1. Identifica a skill necessária
2. Explica POR QUE precisa dela (qual tarefa específica a skill resolveria)
3. Mostra os prós e contras de instalar vs não instalar
4. Espera a decisão do usuário antes de prosseguir

| Lacuna | Gatilho pra identificar |
|---|---|
| Auditoria de acessibilidade dedicada (WCAG) | primeira entrega de UI pública/produção |
| Geração de docs de API (OpenAPI/Swagger) | primeiro endpoint de API exposto externamente |
| Revisão de schema de banco de dados/migrations | primeira migration de schema em produção |
| Load testing / performance de API | primeiro endpoint com expectativa de tráfego real |
| Geração de pipeline CI/CD | primeiro `gsd-ship` bem-sucedido no projeto |
| Regressão visual (screenshot diff) | segunda entrega de UI no mesmo projeto (pra já ter baseline) |
| README/onboarding generator | `gsd-new-project` sem README existente |

---

## Skills Python instaladas — Referência Rápida

| Skill | Uso | Gatilho automático |
|-------|-----|-------------------|
| `python-patterns` | Padrões idiomáticos Python | Qualquer código `.py` |
| `python-testing-patterns` | Testes com pytest | Features novas |
| `code-review-and-quality` | Review multi-dimensional | PRs e merges |
| `fastapi-python` | APIs FastAPI | Arquivos FastAPI |
| `uv-package-manager` | Gerenciador de pacotes uv | Dependências Python |
| `django-python` | Framework Django | Arquivos Django |
| `flask-python` | Framework Flask | Arquivos Flask |
| `python-cybersecurity-tool-development` | Ferramentas de segurança | Código de segurança |
| `complexity` | Análise de complexidade | Code review |
| `debugging` | Debug Python | Bugs e erros |
| `python-appservice-deploy` | Deploy no Azure | Deploy Azure |
| `ci-cd` | Pipelines CI/CD | Configuração de deploy |

---

## Skills SQL/Banco de Dados instaladas — Referência Rápida

| Skill | Uso | Gatilho automático |
|-------|-----|-------------------|
| `postgresql-table-design` | Design de tabelas PostgreSQL | Criação de tabela/model |
| `postgresql-optimization` | Otimização PostgreSQL (VACUUM, WAL, etc) | Performance de query |
| `postgresql-code-review` | Review PostgreSQL-specific | PRs com SQL |
| `postgresql-best-practices` | Convenções PostgreSQL | Qualquer código PG |
| `sql-optimization-patterns` | Padrões de query SQL | Queries complexas |
| `sql-optimization` | Indexação, explain analyze | Query lenta |
| `sql-code-review` | Qualidade de queries | Review de código SQL |
| `database-schema-designer` | Validação de modelo relacional | Design de schema |
| `sqlite-database-expert` | SQLite (WAL, pragma, testes) | Projeto com SQLite |

---

## Skills Reuse First instaladas — Referência Rápida

| Skill | Uso | Gatilho automático |
|-------|-----|-------------------|
| `reuse-first` | Pesquisa web de soluções existentes | Antes de qualquer implementação |
| `shunk031-research-before-implementation` | Busca bibs/frameworks relevantes | Antes de escrever código |
| `reduce-reinvention` | Análise de reuso no projeto atual | Função/nova feature |

---

## Skills Frontend Vanilla instaladas — Referência Rápida

| Skill | Uso | Gatilho automático |
|-------|-----|-------------------|
| `html-css-best-practices` | Semântica HTML, acessibilidade, CSS organizado | Qualquer arquivo `.html`/`.css`/`.js` sem framework |
| `frontend-design` | Design distintivo, tipografia, paleta, composição | Trabalho visual em frontend vanilla |

---

## Skills Node.js/TypeScript/Backend instaladas — Referência Rápida

| Skill | Uso | Gatilho automático |
|-------|-----|-------------------|
| `typescript-core` | Padrões avançados de TS (tipos, config, validação runtime) | Qualquer projeto TypeScript |
| `nodejs-backend` | Setup de servidor com Express/Fastify, estrutura de pastas | Início de projeto backend Node.js |
| `express-rest-api` | Rotas REST, validação, error handling com Express | Framework escolhido é Express |
| `express-production` | Helmet, CORS, rate-limit, PM2, graceful shutdown | Deploy/produção com Express |
| `fastify` | Framework de alta performance com schema-based validation | Performance critica ou TS-first |
| `drizzle` | ORM type-safe com zero overhead, migrations, relações | Banco relacional (PG/MySQL/SQLite) |
| `zod` | Schema validation com inference de tipos TypeScript | Validar inputs/outputs de qualquer dado |
| `api-design-patterns` | REST/GraphQL/gRPC, versionamento, rate limiting, idempotency | Projetar qualquer API |
| `jwt-authentication` | JWT access/refresh tokens, RBAC, password reset | Backend com autenticação |
| `websocket-realtime-builder` | Socket.io, rooms, namespaces, presence, Redis adapter | Chat, notificações, dashboards ao vivo |
| `tanstack-query` | Cache automático, background refetch, optimistic updates | Frontend React consumindo APIs |
| `fusion-backend-dev` | Padrões de consumo/integração de APIs backend | Integrar com APIs existentes |
