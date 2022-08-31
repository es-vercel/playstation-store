import { Container } from '@components/ui'
import { Auth } from '@supabase/ui'
import { useUser } from '@supabase/auth-helpers-react'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function NakAuth() {
  const { user, error } = useUser()
  const [isSSR, setIsSSR] = useState(true)

  useEffect(() => {
    setIsSSR(false)
  }, [])

  console.log(user)

  if (!user) {
    return (
      <Container
        className="w-screen h-screen fixed flex flex-col items-center justify-center bg-black text-white"
        clean
      >
        {!isSSR && (
          <div className="w-80">
            {error && <p>{error.message}</p>}
            <Auth
              supabaseClient={supabaseClient}
              providers={['google']}
              socialButtonSize="xlarge"
              onlyThirdPartyProviders={true}
              redirectTo={`${window.location.origin}/nakauth`}
            />
          </div>
        )}
      </Container>
    )
  }

  return (
    <Container
      className="w-screen h-screen fixed flex flex-col items-center justify-center bg-black"
      clean
    >
      <div className="relative z-50 flex flex-col items-center">
        {user.email === process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL_AUTH ? (
          <>
            <div className="text-xl font-bold font-mono mb-8">
              Nakamoto Program
            </div>
            <button className="px-10 py-8 bg-lime-400 text-black text-3xl font-mono font-extrabold rounded-lg active:bg-lime-700">
              Autorizza
            </button>
            <div className="px-20 text-center mt-20">
              Accesso riservato solo a <br />
              <b>{process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL_AUTH}</b>
            </div>
          </>
        ) : (
          <div className="px-20 text-center">
            <p>Mi spiace.</p> <br />
            Accesso riservato solo a{' '}
            <b>{process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL_AUTH}</b>
          </div>
        )}
      </div>
    </Container>
  )
}
