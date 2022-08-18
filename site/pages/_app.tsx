import '@assets/main.css'
import '@assets/chrome-bug.css'
import 'keen-slider/keen-slider.min.css'

import { FC, useEffect } from 'react'
import type { AppProps } from 'next/app'
import { Head } from '@components/common'
import { ManagedUIContext } from '@components/ui/context'
import { AlexaProvider } from '@lib/hooks/useAlexa'
import { CommerceProvider } from '@framework'

const Noop: FC = ({ children }) => <>{children}</>

export default function MyApp({ Component, pageProps }: AppProps) {
  const Layout = (Component as any).Layout || Noop

  useEffect(() => {
    document.body.classList?.remove('loading')
  }, [])

  return (
    <>
      <Head />
      <ManagedUIContext>
        <CommerceProvider locale={'en-US'}>
          <AlexaProvider>
            <Component {...pageProps} />
          </AlexaProvider>
        </CommerceProvider>
      </ManagedUIContext>
    </>
  )
}
