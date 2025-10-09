import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {

  return (
    <div className='flex w-full items-center justify-center absolute'>
        <div className='px-20 py-2 bg-black text-white inline-block rounded-b-full z-[99] w-140 group transition-all duration-300 ease-in-out'>
          <div className='gap-10 opacity-0 h-0 group-hover:opacity-100 group-hover:h-10 transition-all duration-300 ease-in-out flex items-center justify-center w-full'>
            <Link to="/" className='group/ani relative'>
              <div className='text-xl'>Home</div>
              <div className='bg-white h-[2px] absolute left-[50%] group-hover/ani:left-0 w-0 group-hover/ani:w-full transition-all duration-450 ease-in-out'></div>
            </Link>
            <Link to="/canvas" className='group/ani relative'>
              <div className='text-xl'>Canvas</div>
              <div className='bg-white h-[2px] absolute left-[50%] group-hover/ani:left-0 w-0 group-hover/ani:w-full transition-all duration-450 ease-in-out'></div>
            </Link>
            <Link to="/about" className='group/ani relative'>
              <div className='text-xl'>About The Project</div>
              <div className='bg-white h-[2px] absolute left-[50%] group-hover/ani:left-0 w-0 group-hover/ani:w-full transition-all duration-450 ease-in-out'></div>
            </Link>
          </div>
        </div>
    </div>
  )
}

export default Navbar