"use client"
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react'

const VerifyPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);

  const searchParams = useSearchParams()

  const email: string = searchParams.get("email") || ""

  const handleSubmit = async () => {}
  return (
    <div className='min-h-screen bg-gray-900 border flex items-center justify-center p-4'>
      <div className='max-w-md border w-full'>
        <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 mx-auto flex items-center justify-center bg-blue-600 rounded-lg mb-6'>
              <Lock size={40} className='text-white'/>
            </div>
            <h1 className='text-4xl text-white font-bold mb-4'>Verify Your Email</h1>
            <p className='text-lg text-white'>We have sent a 6-digit code to</p>
            <p className='text-blue-400 font-medium'>{email}</p>
            <form onSubmit={handleSubmit} action="" className='space-y-6'>
              <div className='flex flex-col items-start mt-7'>
                <label className='text-white mb-3' htmlFor="email">Email Address</label>
                {/* <input value={email} onChange={(e) => setEmail(e.target.value)} className='bg-gray-700 border border-gray-600 placeholder-gray-400 rounded-lg  outline-none w-full p-5' type="email" placeholder='Enter Your email address'/> */}
              </div>
              <div className='flex items-center justify-center'>
                {
                  loading? (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}><Loader2 className='text-white'/>Verifying...</button>) : (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}>Verify<ArrowRight className='text-white'/></button>)
                }
                
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  )
}

export default VerifyPage