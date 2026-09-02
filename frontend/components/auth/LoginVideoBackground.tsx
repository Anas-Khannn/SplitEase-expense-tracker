"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  {
    name: "Alex Morgan",
    title: "Splitting with 4 roommates",
    content:
      "SplitEase ended the awkward group-chat math forever. We now settle balances in minutes and everyone knows exactly where the money went.",
    highlighted: "We now settle balances in minutes",
    firstPart: "SplitEase ended the awkward group-chat math forever.",
    secondPart:
      " We now settle balances in minutes and everyone knows exactly where the money went.",
  },
  {
    name: "Priya Patel",
    title: "Trip with 8 friends",
    content:
      "Tracking who paid for what on our trip used to be chaos. With SplitEase the summary was ready before we even landed home.",
    highlighted: "the summary was ready before we even landed home",
    firstPart: "Tracking who paid for what on our trip used to be chaos.",
    secondPart:
      " With SplitEase the summary was ready before we even landed home.",
  },
  {
    name: "Jonas Weber",
    title: "Shared apartment • Berlin",
    content:
      "I don't have to chase anyone for rent or groceries anymore. The balances update themselves and settling up is one tap.",
    highlighted: "The balances update themselves",
    firstPart: "I don't have to chase anyone for rent or groceries anymore.",
    secondPart:
      " The balances update themselves and settling up is one tap.",
  },
];

export function LoginVideoBackground() {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoaded = () => setIsVideoLoaded(true);

    if (video.readyState >= 3) setIsVideoLoaded(true);

    video.addEventListener("canplay", handleLoaded);
    video.addEventListener("loadeddata", handleLoaded);
    video.addEventListener("canplaythrough", handleLoaded);

    return () => {
      video.removeEventListener("canplay", handleLoaded);
      video.removeEventListener("loadeddata", handleLoaded);
      video.removeEventListener("canplaythrough", handleLoaded);
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- avoid hydration mismatch for random start
    setCurrentTestimonial(Math.floor(Math.random() * testimonials.length));
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const testimonial = testimonials[currentTestimonial];

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden m-2">
      {/* Poster image with blur effect */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${
          isVideoLoaded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        style={{ filter: isVideoLoaded ? "blur(0px)" : "blur(1px)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://midday.ai/cdn-cgi/image/width=1000,quality=80,format=auto/https://cdn.midday.ai/video-poster-v2.jpg"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden="true"
        />
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
          isVideoLoaded ? "opacity-100" : "opacity-0"
        }`}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="https://midday.ai/cdn-cgi/image/width=1000,quality=80,format=auto/https://cdn.midday.ai/video-poster-v2.jpg"
      >
        <source
          src="https://cdn.midday.ai/videos/login-video.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col justify-center items-center p-2 text-center h-full w-full">
        <div className="max-w-lg">
          <div className="relative h-64 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                  className="relative max-w-md mx-auto"
                >
                  <p className="font-sans text-xl text-white/40 leading-relaxed pl-4">
                    <span className="text-white">
                      {testimonial.firstPart}
                    </span>
                    {testimonial.secondPart}
                  </p>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, filter: "blur(2px)", y: 10 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                  className="font-sans text-xs text-white/40"
                >
                  {testimonial.name}, {testimonial.title}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
