# Configuração do Sistema de Recuperação de Senha

## Variáveis de Ambiente Necessárias

Para que o sistema de recuperação de senha funcione, adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# SMTP Configuration for Password Reset
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
```

## Configuração com Gmail

1. **Ativar Verificação em 2 Etapas**
   - Acesse sua conta Google
   - Vá em Segurança > Verificação em duas etapas
   - Ative a verificação em 2 etapas

2. **Gerar Senha de App**
   - Na mesma página de Segurança
   - Clique em "Senhas de app"
   - Selecione "Email" como aplicativo
   - Copie a senha gerada (16 caracteres)

3. **Configurar as Variáveis**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="seu-email@gmail.com"
   SMTP_PASS="senha-de-app-de-16-caracteres"
   ```

## Outros Provedores de Email

### Outlook/Hotmail
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_USER="seu-email@outlook.com"
SMTP_PASS="sua-senha"
```

### Yahoo
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_USER="seu-email@yahoo.com"
SMTP_PASS="sua-senha-de-app"
```

## Como Funciona

1. **Solicitar Recuperação**: Usuário informa o email em `/auth/forgot-password`
2. **Token Gerado**: Sistema gera token único válido por 1 hora
3. **Email Enviado**: Link de recuperação é enviado para o email
4. **Redefinir Senha**: Usuário clica no link e define nova senha em `/auth/reset-password`
5. **Token Removido**: Após uso, token é removido do banco de dados

## Segurança

- Tokens expiram em 1 hora
- Tokens são únicos e criptograficamente seguros
- Senhas são hasheadas com bcrypt
- Sistema não revela se email existe na base (proteção contra enumeração)
- Tokens usados são imediatamente removidos

## Testando Sem Email

Se você não configurar o SMTP, o sistema ainda funcionará:
- A solicitação de recuperação será aceita
- O token será gerado e salvo no banco
- Nenhum email será enviado
- Você pode testar diretamente com a URL: `/auth/reset-password?token=TOKEN_GERADO` 