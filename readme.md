# Altaa Test Project

Este é um projeto de exemplo que consiste em uma API backend com Node.js/TypeScript + Prisma + PostgreSQL e um frontend em Next.js, preparado para rodar com Docker.

---

## Estrutura do projeto

```
|-- backend/
|    |-- prisma/
|    |-- src/
|    |-- Dockerfile
|    |-- docker-compose.yml
|    |-- package.json
|
|-- frontend/
|    |-- Dockerfile
|    |-- package.json
```

---

## Pré-requisitos

- [Docker](https://www.docker.com/get-started) instalado
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente já vem com Docker Desktop)
- Git (para clonar o projeto)

---

## Passo a passo para rodar o projeto

### 1️⃣ Clonar o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd backend
```
> Certifique-se que a pasta `frontend` está na mesma estrutura relativa (`../frontend`).

---

### 2️⃣ Build das imagens Docker
```bash
docker compose build
```
> Esse comando cria as imagens do backend, frontend e banco de dados.

---

### 3️⃣ Subir os containers
```bash
docker compose up -d
```
> Use `-d` para rodar em background.  
> Para ver os logs:  
```bash
docker compose logs -f
```

---

### 4️⃣ Popular o banco de dados
Após os containers estarem rodando, rode o seed para popular os dados:

**Opção 1 – Rodar localmente** (com `DATABASE_URL` apontando para o container PostgreSQL):
```bash
npm run seed
```

**Opção 2 – Rodar dentro do container do backend**:
```bash
docker compose exec api bash
npm run seed
exit
```

---

### 5️⃣ Acessar a aplicação
- **Frontend:** [http://localhost:3000](http://localhost:3000)  
- **Backend:** [http://localhost:4000](http://localhost:4000)

---

## Comandos úteis

- Parar containers:
```bash
docker compose down
```

- Remover containers parados e volumes órfãos:
```bash
docker compose rm -f
docker volume prune
```

- Entrar no container do backend:
```bash
docker compose exec api bash
```

- Reconstruir containers após alterações:
```bash
docker compose build
docker compose up -d
```

---

## Observações

- Certifique-se que a versão do Node.js seja compatível com o projeto (usamos `node:20` nos Dockerfiles).  
- O seed deve ser rodado apenas **uma vez** para popular os dados iniciais.  
- Se estiver usando Windows, caminhos relativos podem precisar de ajustes no `docker-compose.yml`.

---

Feito por Lucas Zaranza

