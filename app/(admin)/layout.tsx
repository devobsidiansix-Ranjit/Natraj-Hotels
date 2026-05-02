import React from 'react'
import AdminSidebar from './admin/components/admin-sidebar'
import AdminNavbar from './admin/components/admin-navbar'
import { getServerSession } from 'next-auth'
import { options } from '../api/auth/[...nextauth]/options'
import { redirect } from 'next/navigation'
import prismadb from '@/lib/prismadb'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const serversession = await getServerSession(options)
  //@ts-ignore
  const isAdmin = serversession?.user?.isAdmin
  if(!isAdmin){
    redirect('/')
  }

  const categories = await prismadb.category.findMany()

  return (
    <>
      <div className='flex flex-col lg:flex-row min-h-screen w-full'>
        <div className='w-full lg:w-[17%] lg:fixed lg:top-0 lg:left-0 lg:h-screen z-50'>
          <AdminSidebar categoreis={categories} />
        </div>
        <div className='w-full lg:w-[83%] lg:ml-[17%] bg-[#F5F5F5] min-h-screen'>
          <AdminNavbar />
          {children}
        </div>
      </div>
    </>
  )
}
