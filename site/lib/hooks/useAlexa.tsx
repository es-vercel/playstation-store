import { useRouter } from 'next/router'
import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useCallback,
  useRef,
} from 'react'
import qs from 'qs'
import Script from 'next/script'
import { Howl } from 'howler'
import { NakamotoSpeaker } from '@components/ui'

const sound = new Howl({
  src: ['/codec.m4a'],
})

export interface IAlexa {
  alexa: any
  speak: (message: string, person?: string | null, withCall?: boolean) => void
  nakamoto: boolean
  play: any
}

const AlexaContext = createContext<IAlexa>({
  alexa: null,
  speak: () => {},
  nakamoto: false,
  play: () => {},
})

function _speak(alexa: any, message: string) {
  alexa.skill.sendMessage({
    intent: 'SpeakIntent',
    message,
  })
}

export const AlexaProvider = ({ children }: any) => {
  const [onFireTV, setOnFireTV] = useState(false)
  const router = useRouter()

  const [alexa, setAlexa] = useState(null)
  const [nakamoto, setNakamoto] = useState(false)
  const [speaker, setSpeaker] = useState(null)

  const speak = useCallback(
    (message, person = null, withCall = false) => {
      if (!alexa) {
        return
      }

      if (alexa && !nakamoto) {
        return _speak(alexa, message)
      }

      const voices: any = {
        paolo: {
          voice: 'Giorgio',
          rate: 'medium',
          pitch: 'medium',
        },
        fabio: {
          voice: 'Giorgio',
          rate: 'medium',
          pitch: 'x-high',
        },
      }

      if (alexa && nakamoto && voices[person]) {
        const v = voices[person]
        if (withCall) {
          sound.play()
          setTimeout(() => {
            setSpeaker(person)
            _speak(
              alexa,
              `<voice name="${v.voice}"><break time="1s"/><prosody rate="${v.rate}" pitch="${v.pitch}">${message}<break time="1s"/></prosody></voice>`
            )
          }, 3000)
        } else {
          setSpeaker(person)
          _speak(
            alexa,
            `<voice name="${v.voice}"><break time="1s"/><prosody rate="${v.rate}" pitch="${v.pitch}">${message}<break time="1s"/></prosody></voice>`
          )
        }
      } else {
        _speak(alexa, message)
      }
    },
    [alexa, nakamoto]
  )

  const handleLoadScript = useCallback(() => {
    // @ts-ignore
    Alexa.create({ version: '1.1' })
      .then((args: any) => {
        const { alexa } = args
        alexa.speech.onStopped(() => {
          setSpeaker(null)
        })
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
            case 'StartNakamotoIntent': {
              const query = qs.stringify(
                { intent: JSON.stringify(message) },
                { skipNulls: true }
              )
              router.push(`/nft?${query}`)
              setNakamoto(true)
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
  }, [router])

  useEffect(() => {
    if (navigator.userAgent.includes('AFT')) {
      console.log('Fire TV')
      setOnFireTV(true)
    }
  }, [])

  const play = useCallback(() => {
    audioRef.current.play()
    setTimeout(() => {
      videoRef.current.play()
    }, 1200)
  }, [])

  useEffect(() => {
    // @ts-ignore
    window.speak = speak
    // @ts-ignore
    window.reset = () => {
      setNakamoto(false)
      setSpeaker(null)
    }
    // @ts-ignore
    window.audioRef = audioRef
    // @ts-ignore
    window.videoRef = videoRef
  }, [speak])

  const audioRef: any = useRef()
  const videoRef: any = useRef()

  return (
    <>
      {onFireTV && (
        <Script
          src="https://cdn.html.games.alexa.a2z.com/alexa-html/latest/alexa-html.js"
          onLoad={handleLoadScript}
        />
      )}
      <AlexaContext.Provider value={{ alexa, speak, nakamoto, play }}>
        {onFireTV && (
          <>
            <audio
              ref={audioRef}
              onCanPlayThrough={() => {
                console.log('audio caricato')
              }}
              // autoPlay
              loop
              src="/quickfall.mp3"
              className="hidden"
            />
            <video
              ref={videoRef}
              onCanPlayThrough={() => {
                console.log('video caricato')
              }}
              muted
              // autoPlay
              loop
              src="/video.mp4"
              className="object-cover h-full w-full absolute"
            />
            {speaker && (
              <NakamotoSpeaker
                id={speaker}
                show={typeof speaker === 'string'}
              />
            )}
          </>
        )}
        {children}
      </AlexaContext.Provider>
    </>
  )
}

export const useAlexa = () => {
  const context = useContext(AlexaContext)

  if (context === undefined) {
    throw new Error('useAlexa must be used within a AlexaProvider')
  }

  return context
}
