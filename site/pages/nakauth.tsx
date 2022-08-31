import { Container, LoadingDots } from '@components/ui'
import { Auth } from '@supabase/ui'
import { useUser } from '@supabase/auth-helpers-react'
import { supabase } from '@lib/supabaseClient'
import { useCallback, useEffect, useState } from 'react'
import { supabaseClient } from '@supabase/auth-helpers-nextjs'
import axios from 'axios'
import useSWR from 'swr'

async function getEvents() {
  const res = await axios({
    method: 'get',
    url: '/api/events',
  })

  return res.data
}

export default function NakAuth() {
  const { user, error } = useUser()
  const [isSSR, setIsSSR] = useState(true)
  const [showBtn, setShowBtn] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSSR(false)
  }, [])

  const handleClick = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('events')
      .insert([{ created_at: new Date() }])

    setLoading(false)

    if (error) {
      return alert(error)
    }

    if (data?.length) {
      setShowBtn(false)
    }
  }, [])

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
        {user.email === process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL1_AUTH ||
        user.email === process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL2_AUTH ? (
          <>
            <div className="text-xl font-bold font-mono mb-8">
              Nakamoto Program
            </div>
            {showBtn ? (
              <button
                disabled={loading}
                onClick={handleClick}
                className="px-10 py-8 bg-lime-400 text-black text-3xl flex items-center font-mono font-extrabold rounded-lg active:bg-lime-700"
              >
                <div className="mr-3">Autorizza</div>
                {loading && <LoadingDots />}
              </button>
            ) : (
              <div className="px-10 py-8 bg-purple-600 text-white text-3xl flex items-center font-mono font-extrabold rounded-lg">
                Granted!
              </div>
            )}
            <div className="px-20 text-center mt-20">
              Accesso riservato solo a <br />
              <b>{process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL2_AUTH}</b>
            </div>
          </>
        ) : (
          <div className="px-20 text-center">
            <p>Mi spiace.</p> <br />
            Accesso riservato solo a{' '}
            <b>{process.env.NEXT_PUBLIC_NAKAMOTO_EMAIL2_AUTH}</b>
          </div>
        )}
      </div>
    </Container>
  )
}
