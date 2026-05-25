import React from 'react'

const Spinner = () => {
  return (
    <div className='flex items-center justify-center h-16 w-16 rounded-full border-4 border-sky-300 border-t-sky-500 animate-spin'>
        <svg 
        className='hidden'
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        >
            <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
            />
            <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
            />
        </svg>
    </div>
        
  )
}

export default Spinner