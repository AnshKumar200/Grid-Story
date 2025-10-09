import { ArrowUpRight } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className='min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50'>
      <div className='flex flex-col items-center z-[999] gap-10'>
        <div className='text-6xl md:text-8xl lg:text-9xl z-10 font-medium'>Grid Story</div>
        <div className='text-4xl'>A Million Pixels. One Shared Story.</div>
        <div className='text-4xl w-200 text-center'>Join over a thousand simultaneous users on a massive, real-time collaborative canvas.</div>
        <Link to="/canvas" className='px-10 py-5 bg-black text-white rounded-4xl flex gap-5 border-2 items-center hover:bg-white transform-all duration-400 ease-in-out hover:text-black hover:border-2'>
          <div>Go To The Canvas!</div>
          <ArrowUpRight size={30}/>
        </Link>
      </div>
      
      <div className='absolute inset-0'>
        <div className='absolute size-12 bg-amber-200 top-[15%] left-[10%] rotate-12 animate-pulse [animation-duration:4s]'></div>
        <div className='absolute size-8 bg-purple-300 top-[8%] left-[25%] -rotate-3 animate-pulse'></div>
        <div className='absolute size-7 bg-lime-300 top-[10%] left-[40%] -rotate-20 animate-pulse'></div>
        <div className='absolute size-18 bg-green-700 top-[30%] left-[20%] rotate-10'></div>

        <div className='absolute size-10 bg-gray-500 top-[10%] right-[28%] animate-spin [animation-duration:10s]'></div>
        <div className='absolute size-24 bg-teal-300 top-[8%] right-[5%] -rotate-45'></div>
        <div className='absolute size-9 bg-emerald-500 top-[12%] right-[40%] rotate-25 animate-spin [animation-duration:12s]'></div>
        <div className='absolute size-10 bg-orange-300 top-[25%] right-[15%] rotate-15 animate-pulse'></div>
        <div className='absolute size-4 bg-gray-400 top-[35%] right-[25%] rotate-70 animate-pulse'></div>

        <div className='absolute size-14 bg-blue-300 bottom-[20%] left-[18%] rotate-3 animate-pulse [animation-duration:6s]'></div>
        <div className='absolute size-10 bg-red-400 bottom-[30%] left-[5%] rotate-6 animate-pulse [animation-duration:4s]'></div>
        <div className='absolute size-6 bg-pink-400 bottom-[40%] left-[20%] rotate-60 animate-pulse [animation-duration:2.5s]'></div>
        <div className='absolute size-16 bg-amber-600 bottom-[8%] left-[25%] -rotate-6 animate-pulse [animation-duration:3s]'></div>
        <div className='absolute size-9 bg-sky-500 bottom-[10%] left-[40%] -rotate-50'></div>

        <div className='absolute size-16 bg-gray-700 bottom-[10%] right-[30%] -rotate-18 animate-pulse [animation-duration:3.5s]'></div>
        <div className='absolute size-14 bg-green-500 bottom-[5%] right-[8%] rotate-45 animate-spin [animation-duration:15s]'></div>
        <div className='absolute size-18 bg-yellow-500 bottom-[8%] right-[15%] rotate-30'></div>
        <div className='absolute size-20 bg-blue-800 bottom-[25%] right-[20%] -rotate-12 animate-pulse [animation-duration:2s]'></div>
        <div className='absolute size-4 bg-purple-200 bottom-[15%] right-[40%] rotate-5 animate-pulse [animation-duration:2s]'></div>

        <div className='absolute size-11 bg-fuchsia-400 top-[50%] right-[5%] -translate-y-1/2 rotate-30 animate-pulse [animation-duration:5s]'></div>
        <div className='absolute size-10 bg-black top-[60%] right-[12%] -translate-x-1/2 rotate-6'></div>
        <div className='absolute size-13 bg-violet-500 top-[75%] right-[25%] rotate-40 animate-pulse'></div>

        <div className='absolute size-8 bg-amber-300 top-[35.3%] left-[45.6%] rotate-45 animate-pulse [animation-duration:5s]'></div>
        <div className='absolute size-5 bg-cyan-200 top-[55%] left-[52%] -rotate-10 animate-pulse [animation-duration:3s]'></div>
        <div className='absolute size-10 bg-rose-400 bottom-[5%] left-[50%] -translate-x-1/2 rotate-24 animate-spin [animation-duration:14s]'></div>
      </div>
    </div>
  );
};

export default HomePage;