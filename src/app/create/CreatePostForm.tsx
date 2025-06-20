'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Por favor, adicione um título');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim() || null,
        }),
      });

      if (response.ok) {
        const post = await response.json();
        router.push(`/post/${post.id}`);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar post');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao compartilhar experiência. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Voltar para comunidade
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Compartilhar Experiência
        </h1>
        <p className="text-gray-600">
          Conte sua história, compartilhe aprendizados e ajude outros investidores brasileiros
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título da sua experiência *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Como perdi R$ 10.000 e o que aprendi com isso"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Conte sua experiência
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Conte sua história: o que aconteceu, quais foram os aprendizados, dicas para outros investidores..."
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Dicas para uma boa experiência:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Seja honesto sobre seus erros e acertos</li>
            <li>• Compartilhe números e dados quando possível</li>
            <li>• Explique o contexto da situação</li>
            <li>• Ofereça dicas práticas para outros investidores</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md font-medium"
          >
            {isSubmitting ? 'Compartilhando...' : 'Compartilhar Experiência'}
          </button>
          
          <Link
            href="/"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
} 