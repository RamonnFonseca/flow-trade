import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'
import nodemailer from 'nodemailer'

// Configurar o transporter do nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Gerar código de 6 dígitos
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email, userId } = await request.json()

    if (!email || !userId) {
      return NextResponse.json(
        { error: 'Email e userId são obrigatórios' },
        { status: 400 }
      )
    }

    let user;

    // Se userId é "resend", buscar usuário pelo email
    if (userId === 'resend') {
      user = await prisma.user.findUnique({
        where: { email }
      })
    } else {
      // Verificar se o usuário existe pelo ID
      user = await prisma.user.findUnique({
        where: { id: userId }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Se já está verificado, não precisa enviar novamente
    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email já verificado' },
        { status: 200 }
      )
    }

    // Gerar código de verificação
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutos

    // Remover códigos antigos para este email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    // Salvar novo código no banco
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationCode,
        expires: expiresAt,
      }
    })

    // Log do código para desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 CÓDIGO DE VERIFICAÇÃO para ${email}: ${verificationCode}`)
    }

    // Enviar email (apenas se configurado)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: 'FlowTrade - Código de Verificação',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #1f2937;">Bem-vindo à FlowTrade!</h2>
            <p>Olá,</p>
            <p>Obrigado por se juntar à nossa comunidade do mercado financeiro brasileiro!</p>
            <p>Para completar seu cadastro, digite o código de verificação abaixo:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; display: inline-block;">
                <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 8px;">
                  ${verificationCode}
                </h1>
              </div>
            </div>
            
            <p><small>Este código expira em 10 minutos.</small></p>
            <p>Se você não se cadastrou na FlowTrade, ignore este email.</p>
            
            <hr style="margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              FlowTrade - A comunidade do mercado financeiro brasileiro
            </p>
          </div>
        `,
      })
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`📧 SMTP não configurado. Código: ${verificationCode}`)
    }

    return NextResponse.json(
      { 
        message: 'Código de verificação enviado', 
        // Para desenvolvimento, retornar o código (remover em produção)
        ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 