'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailFromUrl = searchParams.get('email')
    if (emailFromUrl) {
      setEmail(emailFromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (!email) {
      setError('Email é obrigatório')
      setLoading(false)
      return
    }

    if (!code || code.length !== 6) {
      setError('Digite o código de 6 dígitos')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Email verificado com sucesso!')
        setTimeout(() => {
          router.push('/auth/signin?message=Email verificado! Faça login para acessar a comunidade.')
        }, 2000)
      } else {
        setError(data.error || 'Erro ao verificar código')
      }
    } catch (error) {
      setError('Erro ao verificar código')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend || !email) return

    setResendLoading(true)
    setError('')

    try {
      // Primeiro, precisamos buscar o userId pelo email
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userId: 'resend', // Vamos modificar a API para lidar com isso
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Novo código enviado!')
        setCanResend(false)
        setCountdown(60)
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Erro ao reenviar código')
      }
    } catch (error) {
      setError('Erro ao reenviar código')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificar Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Digite o código de 6 dígitos enviado para seu email
          </p>
          {email && (
            <p className="mt-1 text-center text-sm text-blue-600 font-medium">
              {email}
            </p>
          )}
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {!email && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="seu@email.com"
              />
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
              Código de Verificação
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
              placeholder="123456"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verificando...' : 'Verificar Email'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <div>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendLoading || !email}
                  className="text-sm text-indigo-600 hover:text-indigo-500 disabled:text-gray-400"
                >
                  {resendLoading ? 'Reenviando...' : 'Reenviar código'}
                </button>
              ) : (
                <span className="text-sm text-gray-500">
                  Reenviar código em {countdown}s
                </span>
              )}
            </div>
            
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Voltar para o login
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">📧 Não recebeu o código?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Verifique sua caixa de spam</li>
            <li>• Aguarde alguns minutos</li>
            <li>• Clique em "Reenviar código" se necessário</li>
            <li>• O código expira em 10 minutos</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 