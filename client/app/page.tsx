import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function IndexPage() {
  return (
    <section className='container grid items-center justify-center gap-6 pb-8 pt-6 text-center md:py-10'>
      <div className='flex max-w-[980px] flex-col items-center gap-2'>
        <h1 className='text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl'>
          Welcome to XOXO
        </h1>
        <p className='max-w-[700px] text-lg text-muted-foreground'>
          This is a modern and minimalist Tic Tac Toe game built with Next.js and Nakama.
          Challenge your friends to a match and see who comes out on top!
        </p>
      </div>
      <div className='flex justify-center gap-4'>
        <Link href='/tictactoe' rel='noreferrer' className={buttonVariants({ size: "lg" })}>
          Start Game
        </Link>
      </div>
    </section>
  );
}
