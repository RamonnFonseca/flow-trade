import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import CreatePostForm from './CreatePostForm';

export default async function CreatePost() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return <CreatePostForm />;
} 