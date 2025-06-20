import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando registro de usuário...')
    
    const body = await request.json()
    console.log('📝 Dados recebidos:', { ...body, password: '***' })
    
    const { name, email, password } = body

    if (!name || !email || !password) {
      console.log('❌ Dados incompletos')
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log('🔍 Verificando se usuário já existe...')
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('❌ Usuário já existe')
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 400 }
      )
    }

    console.log('🔐 Gerando hash da senha...')
    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12)

    console.log('👤 Criando usuário no banco...')
    // Criar usuário (sem email verificado)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: null, // Não verificado inicialmente
      }
    })

    console.log('✅ Usuário criado:', user.id)

    // Enviar código de verificação
    console.log('📧 Enviando código de verificação...')
    try {
      const verificationResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
        }),
      })

      if (!verificationResponse.ok) {
        console.error('❌ Erro ao enviar código de verificação:', verificationResponse.status)
      } else {
        console.log('✅ Código de verificação enviado')
      }
    } catch (error) {
      console.error('❌ Erro ao enviar código de verificação:', error)
    }

    console.log('🎉 Registro concluído com sucesso')
    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
        userId: user.id,
        requiresVerification: true
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('💥 Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 