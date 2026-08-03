"use client"
import React, { useState } from 'react'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const LoginPage = () => {
  const [email, setEmail] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void >=> {
    e.preventDefault();

    try {
      setLoading(true)

      const {data} = await axios.post(`http://localhost:5301/api/v1/user/login`, {email})
      console.log(data);
      
      alert(data.message)
      router.push(`/verify?email=${email}`)

      
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error);
      }
      setLoading(false)
      
    } finally{
      setLoading(false)
    }
  }
  return (
    <div className='min-h-screen bg-gray-900 border flex items-center justify-center p-4'>
      <div className='max-w-md border w-full'>
        <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
          <div className='text-center mb-8'>
            <div className='w-20 h-20 mx-auto flex items-center justify-center bg-blue-600 rounded-lg mb-6'>
              <Mail size={40} className='text-white'/>
            </div>
            <h1 className='text-4xl text-white font-bold mb-4'>Welcome To Chat App</h1>
            <p className='text-lg text-white'>Enter your email to continue your journey</p>
            <form onSubmit={handleSubmit} action="" className='space-y-6'>
              <div className='flex flex-col items-start mt-7'>
                <label className='text-white mb-3' htmlFor="email">Email Address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className='bg-gray-700 border border-gray-600 placeholder-gray-400 rounded-lg  outline-none w-full p-5' type="email" placeholder='Enter Your email address'/>
              </div>
              <div className='flex items-center justify-center'>
                {
                  loading? (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}><Loader2 className='text-white'/>Sending Otp to your mail </button>) : (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}>Send Verification Code <ArrowRight className='text-white'/></button>)
                }
                
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  )
}

export default LoginPage