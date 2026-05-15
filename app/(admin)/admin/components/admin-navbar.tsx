"use client"
import { AlignLeft, BellDot, UserCircle2, LogOut } from 'lucide-react'
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { signOut } from 'next-auth/react'

const AdminNavbar = () => {
    return (
        <div className='py-8 px-6 h-fit w-full'>
            <div className='flex justify-between items-center bg-white p-2 rounded-lg'>
                <div>
                    <AlignLeft className='h-8 w-8' />
                </div>
                <div className='flex gap-8 items-center'>
                    <BellDot />
                    <div className='flex gap-5 items-center'>
                        <span className='flex flex-col items-end'>
                            <span>{`Hotelnatraj`}</span>
                            <span className='text-xs'>{`Admin`}</span>
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className='rounded-full hover:bg-gray-100 p-1 transition-colors'>
                                    <UserCircle2 className='h-8 w-8' />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className='w-fit flex flex-col gap-3 mr-4'>
                                <div onClick={() => signOut({ callbackUrl: '/' })} className='bg-white border-red-500 border text-red-500 px-4 py-[6px] rounded-lg hover:bg-red-500 hover:text-white select-none cursor-pointer flex items-center gap-2'>
                                    <LogOut className="h-4 w-4" />
                                    <span>Sign out</span>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminNavbar
