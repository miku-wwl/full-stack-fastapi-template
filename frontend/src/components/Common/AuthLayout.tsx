import { Appearance } from "@/components/Common/Appearance"
import { Footer } from "./Footer"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden lg:flex lg:flex-col lg:items-center lg:justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/nz-wanaka.jpg')" }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        {/* Brand content */}
        <div className="relative z-10 text-center px-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            Fore<span className="text-emerald-300">Xchange</span>
          </h1>
          <p className="mt-4 text-white/95 text-xl font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
            Real-Time Remittance &amp; Compliance
          </p>
          <p className="mt-2 text-white/85 text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            Secure cross-border payments with live exchange rates
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-end">
          <Appearance />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
        <Footer />
      </div>
    </div>
  )
}
