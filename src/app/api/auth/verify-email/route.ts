import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email e código são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se o código existe e não expirou
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: code.toString(),
        expires: {
          gt: new Date()
        }
      }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Código inválido ou expirado' },
        { status: 400 }
      )
    }

    // Encontrar o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Marcar email como verificado
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        emailVerified: new Date()
      }
    })

    // Remover o token usado
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: email,
          token: code.toString()
        }
      }
    })

    return NextResponse.json(
      { message: 'Email verificado com sucesso!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao verificar email:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 