import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: {
      id: params.id,
    },
    include: {
      author: {
        select: { name: true, image: true }
      }
    }
  });

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-800 mb-6 inline-block"
      >
        ← Voltar para início
      </Link>

      <article className="bg-white border border-gray-200 rounded-lg p-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <div className="flex items-center space-x-2">
              {post.author?.image && (
                <img
                  src={post.author.image}
                  alt={post.author.name || 'Author'}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>Por {post.author?.name || 'Anônimo'}</span>
            </div>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </header>

        <div className="prose max-w-none">
          {post.content ? (
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.content}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Este post não possui conteúdo adicional.
            </p>
          )}
        </div>
      </article>

      {/* Seção de Comentários */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Comentários
        </h2>

        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Sistema de comentários será adicionado em breve
          </p>
        </div>
      </section>
    </main>
  );
} 