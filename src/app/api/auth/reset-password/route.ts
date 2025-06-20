import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se o token existe e não expirou
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    if (verificationToken.expires < new Date()) {
      // Remover token expirado
      await prisma.verificationToken.delete({
        where: { token }
      })
      
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      )
    }

    // Encontrar o usuário pelo email (identifier)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 400 }
      )
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 12)

    // Atualizar a senha do usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    // Remover o token usado
    await prisma.verificationToken.delete({
      where: { token }
    })

    return NextResponse.json(
      { message: 'Senha redefinida com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 