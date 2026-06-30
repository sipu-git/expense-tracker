import { Dot } from 'lucide-react'
import React from 'react'

const Footer = () => {
    return (
        <div className='w-full flex justify-center items-center py-4 border-t border-slate-300 dark:border-slate-800'>
            <p className='flex gap-1'>
                &copy; {new Date().getFullYear()} <span className='text-violet-400 flex gap-0.5'>Expense Tracker <Dot />   </span>
                <span>All rights reserved</span>
            </p>
        </div>
    )
}

export default Footer