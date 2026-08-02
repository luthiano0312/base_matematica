<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinição de senha</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 520px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        h1 {
            font-size: 20px;
            color: #1e3a5f;
            margin-top: 0;
        }
        p {
            color: #334155;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            margin: 16px 0;
            padding: 12px 24px;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
        }
        .muted {
            color: #64748b;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Olá, {{ $name }}!</h1>
        <p>Recebemos uma solicitação de redefinição de senha para a sua conta na Base Matemática.</p>
        <p>
            <a href="{{ $resetUrl }}" class="button">Redefinir minha senha</a>
        </p>
        <p class="muted">
            Este link é de uso único e expira em {{ $minutes }} minutos.
            Se você não solicitou esta redefinição, ignore este e-mail.
        </p>
    </div>
</body>
</html>
