import Link from 'next/link';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export default async function Home() {
  const session = await auth();
  
  // Buscar os posts mais recentes
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      author: {
        select: { name: true, image: true }
      }
    }
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            A comunidade do mercado financeiro brasileiro
          </h1>
          <p className="text-gray-600">
            Compartilhe experiências, conecte-se com investidores e aprenda com quem já viveu na prática
          </p>
        </div>
        {session?.user ? (
          <Link
            href="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Compartilhar Experiência
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Entrar na Comunidade
          </Link>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Seja o primeiro da comunidade!
          </h2>
          <p className="text-gray-600 mb-4">
            Compartilhe sua experiência no mercado financeiro e ajude outros investidores brasileiros
          </p>
          {session?.user ? (
            <Link
              href="/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Compartilhar Primeira Experiência
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Entrar na Comunidade
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link
                      href={`/post/${post.id}`}
                      className="hover:text-blue-600"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  {post.content && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content.substring(0, 200)}
                      {post.content.length > 200 && '...'}
                    </p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center space-x-2">
                      {post.author?.image && (
                        <img
                          src={post.author.image}
                          alt={post.author.name || 'Author'}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span>Por {post.author?.name || 'Anônimo'}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
