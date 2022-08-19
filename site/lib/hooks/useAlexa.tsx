import { useRouter } from 'next/router'
import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useCallback,
} from 'react'
import qs from 'qs'

export interface IAlexa {
  alexa: any
  speak: (message: string) => void
}

const AlexaContext = createContext<IAlexa>({ alexa: null, speak: () => {} })

export const AlexaProvider = ({ children }: any) => {
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [alexa, setAlexa] = useState(null)

  const speak = useCallback(
    (message) => {
      if (alexa) {
        // @ts-ignore
        alexa.skill.sendMessage({
          intent: 'SpeakIntent',
          message,
        })
      }
    },
    [alexa]
  )

  useEffect(() => {
    // @ts-ignore
    if (typeof Alexa === 'undefined') {
      console.log('Alexa lib not found.')
      return
    }

    if (alexa || mounted) {
      return
    } else {
      setMounted(true)
    }

    // @ts-ignore
    Alexa.create({ version: '1.1' })
      .then((args: any) => {
        const { alexa } = args
        alexa.skill.onMessage((message: any) => {
          switch (message.intent) {
            case 'SearchGameByTitle': {
              const query = qs.stringify(
                {
                  q: message.gameTitle,
                  intent: JSON.stringify(message),
                },
                { skipNulls: true }
              )
              router.push(`/search?${query}`)
              break
            }
            case 'SearchGameByCategory': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(
                `/search/${encodeURIComponent(message.gameCategory)}?${query}`
              )
              break
            }
            case 'GetGamePriceByTitleIntent':
            case 'GetGameDescriptionByTitleIntent':
            case 'AddToCartByTitleIntent':
            case 'OpenGameDetailIntent': {
              const query = qs.stringify(
                {
                  q: message.gameTitle,
                  intent: JSON.stringify(message),
                  loading: true,
                },
                { skipNulls: true }
              )
              router.push(`/search?${query}`)
              break
            }
            case 'OpenCartIntent':
            case 'ReadCartItemIntent':
            case 'DeleteCartItemIntent':
            case 'ClearCartIntent':
            case 'CheckoutIntent': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/cart?${query}`)
              break
            }
            case 'CloseGameDetailIntent': {
              router.push('/')
              break
            }
            case 'CheckoutIntent': {
              break
            }
            case 'Error': {
              console.log(message.error)
            }
          }
        })
        setAlexa(alexa)
        console.log('Alexa is ready')
      })
      .catch((error: any) => {
        console.log('Alexa is NOT ready', error)
      })
  }, [alexa, mounted, router, speak])

  return (
    <AlexaContext.Provider value={{ alexa, speak }}>
      {/* <audio autoPlay controls src="/quickfall.mp3">
        Your browser does not support the
        <code>audio</code> element.
      </audio> */}
      {children}
    </AlexaContext.Provider>
  )
}

export const useAlexa = () => {
  const context = useContext(AlexaContext)

  if (context === undefined) {
    throw new Error('useAlexa must be used within a AlexaProvider')
  }

  return context
}
