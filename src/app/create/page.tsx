import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import CreatePostForm from './CreatePostForm';

export default async function CreatePost() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Verificar se o email foi verificado
  if (session.user.email && !session.user.emailVerified) {
    redirect(`/auth/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return <CreatePostForm />;
} 