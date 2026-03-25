'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function AnimatedHero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const slides = [
    { url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070', alt: 'Corporate HQ' },
    { url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070', alt: 'Digital Assets' },
    { url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047', alt: 'Financial Growth' }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 z-0">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.url}
              alt={slide.alt}
              fill
              className={`object-cover transition-transform duration-[8000ms] ease-linear ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
              priority={index === 0}
            />
          </div>
        ))}
        {/* Changed from dark navy to a light white gradient for the light theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white z-10" />
      </div>
      
      <div className="relative z-20 text-center px-6 max-w-4xl">
        {/* Changed text-white to text-gray-900 */}
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
          Redefining <span className="text-[#c9a84c]">Financial</span> Freedom
        </h1>
        {/* Changed text-gray-300 to text-gray-600 */}
        <p className="text-gray-600 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
          Secure your future with AurexConnect’s institutional-grade investment strategies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-[#c9a84c] text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-colors shadow-lg">
            Start Investing
          </button>
          {/* Changed border and text color for visibility on light background */}
          <button className="border border-gray-300 text-gray-900 px-10 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors backdrop-blur-sm">
            View Plans
          </button>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === currentSlide ? 'bg-[#c9a84c] w-12' : 'bg-gray-300 w-6'
            }`}
          />
        ))}
      </div>
    </section>
  )
            }
          
