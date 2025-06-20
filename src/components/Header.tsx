import Link from 'next/link';
import { auth, signOut } from '@/auth';

const Header = async () => {
  const session = await auth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold">
            FlowTrade
          </Link>
          <nav className="ml-10">
            <Link href="/" className="mr-4 hover:text-gray-300">
              Artigos
            </Link>
            <Link href="/create" className="hover:text-gray-300">
              Criar
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {session?.user ? (
            <>
              <div className="flex items-center space-x-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm">
                  Olá, {session.user.name?.split(' ')[0]}
                </span>
              </div>
              <form
                action={async () => {
                  'use server';
                  await signOut({ redirectTo: '/' });
                }}
              >
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                >
                  Sair
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/register"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
              >
                Registrar
              </Link>
              <Link
                href="/auth/signin"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
              >
                Entrar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 