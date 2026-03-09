# EduManager - Gestão de Aulas Online

EduManager é uma plataforma moderna e intuitiva para professores e tutores gerenciarem suas aulas, alunos e finanças de forma integrada. O sistema permite o agendamento de aulas, controle de créditos por aluno e registro de pagamentos.

## 🚀 Funcionalidades

- **Dashboard Inteligente**: Acompanhe sua receita, alunos ativos e aulas do dia com ordenação cronológica.
- **Gestão de Alunos**: Cadastro completo de alunos com controle automático de créditos e valores personalizados por aula.
- **Agenda Dinâmica**: Visualize e organize suas aulas por dia/semana com suporte a múltiplos participantes e geração automática de títulos.
- **Controle Financeiro**: Registre pagamentos, gere créditos automaticamente e visualize o histórico financeiro.
- **Interface Premium**: Experiência de usuário moderna com modais padronizados, feedback visual e design responsivo.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Estado**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)
- **Backend / Auth**: [Supabase](https://supabase.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Datas**: [date-fns](https://date-fns.org/)

## 📦 Como Instalar e Rodar Localmente

1. **Clone o repositório**:
   ```bash
   git clone <url-do-repositorio>
   cd gesto-aulas-online-react
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto com as seguintes chaves do seu projeto Supabase:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

## 🌐 Deploy na Vercel

Este projeto está configurado para deploy automático na Vercel.

1. Conecte seu repositório GitHub à Vercel.
2. Certifique-se de configurar as variáves de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) nas configurações do projeto na Vercel.
3. O comando de build deve ser `npm run build` e o diretório de saída deve ser `dist`.

## 📄 Licença

Este projeto é de uso privado para gestão de aulas particulares.
