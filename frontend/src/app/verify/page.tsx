"use client"
import axios from 'axios';
import { ArrowRight, Loader2, Lock } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import Cookies from 'js-cookie';

const VerifyPage = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const router = useRouter();
  
  const searchParams = useSearchParams();

  const email: string = searchParams.get("email") || "";

  useEffect(()=>{
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [timer])

  const handleInputChange = (index: number, value: string): void => {
    

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp)
    setError("")

    if (value) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index -1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLElement>): void => {

    e.preventDefault()

    const pastedText = e.clipboardData.getData("text");
    const digits = pastedText.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus()
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join("");
    if (otpString.length < 6) {
      setError("Please Enter all 6-digits")
      return
    }

    setError("")
    setLoading(true)

    try {
      const {data} = await axios.post("http://localhost:5301/api/v1/user/verify", {
        email, otp: otpString
      })
      alert(data.message)
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/"
      })
      setOtp(["", "", "", "", "", ""])
      inputRefs.current[0]?.focus()
      router.push("/")
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        
        setError(error?.response.data.message)
      }
      
    }finally{
      setLoading(false)
    }
  }
  
  const HandleResendOtp = async () => {
    try {
      const {data} = await axios.post("http://localhost:5301/api/v1/user/login", {
        email
      })
      alert(data.message)
      setTimer(60)
      
    } catch (error: unknown) {
      if (error instanceof Error) { 
        setError(error?.response.data.message)
      }
      
    }finally{
      setResendLoading(false)
    }
  }

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
              <div className=' mt-7'>
                <label className='text-gray-300 font-medium text-sm text-center' htmlFor="email">Enter your 6-digit otp here</label>
                <div className='flex justify-center in-checked: space-x-3 mt-4'>
                  {
                    otp.map((digit, index) => (
                      <input key={index} ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                      }} type='text' maxLength={1} value={digit}
                      onChange={e => handleInputChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={index === 0? handlePaste: undefined}
                      className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700'/>
                    ))
                  }

                </div>
                
              </div>
              {
                error && <div className='bg-red-900 border border-red-700 p-3 rounded-lg'>
                  <p className='text-red-300 text-sm text-center'>{error}</p>
                </div>
              }
              <div className='flex items-center justify-center'>
                {
                  loading? (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}><Loader2 className='text-white'/>Verifying...</button>) : (<button className='bg-blue-600 flex items-center justify-center gap-2 text-white font-semibold w-full p-5 cursor-pointer rounded-lg disabled:cursor-not-allowed disabled:opacity-50' disabled={loading}>Verify<ArrowRight className='text-white'/></button>)
                }
              </div>
            </form>
            <div className='mt-6 text-center'>
              <p className='text-gray-400 text-sm mb-4'>{"Didn't"} receive the code?</p>
              {
                timer > 0? <p className='text-gray-400 text-sm'>Resend code in {timer} seconds</p> : <button className='text-blue-400 font-medium text-sm hover:text-blue-300 disabled:opacity-50 cursor-pointer' disabled={resendLoading} onClick={HandleResendOtp}>{resendLoading? "Sending..." : "Resend Otp "}</button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyPage