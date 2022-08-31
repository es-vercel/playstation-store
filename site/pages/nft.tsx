import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Container,
  LoadingDots,
  NakamotoAccess,
  NakamotoProcess,
} from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAlexa } from '@lib/hooks/useAlexa'
import { Howl } from 'howler'
import Typewriter from 'typewriter-effect'

const accessDeniedSound = new Howl({
  src: ['/nakamoto/accessDenied.m4a'],
  html5: true,
})

const accessGrantedSound = new Howl({
  src: ['/nakamoto/success.mp3'],
  html5: true,
})

const universeSound = new Howl({
  src: ['/nakamoto/universe.mp3'],
  html5: true,
})

async function getStorageImages() {
  const res = await axios({
    method: 'get',
    url: '/api/storage',
  })

  return res.data
}

export default function Nft() {
  const router = useRouter()

  const {
    alexa,
    speak,
    play,
    nakamoto,
    missions,
    nakaTitleVisible,
    setNakaTitleVisible,
    videoRef,
    audioRef,
    setShowQRCode,
  } = useAlexa()

  const [imageUrl, setImageUrl] = useState<string>('')

  const [startNakamotoFakeProcess, setStartNakamotoFakeProcess] =
    useState<boolean>(false)

  const [startNakamotoRealProcess, setStartNakamotoRealProcess] =
    useState<boolean>(false)

  const { data: nftImages } = useSWR('nftBucketImages', getStorageImages, {
    refreshInterval: 2000,
  })

  const alexaIntent = useMemo(() => {
    if (router.query.intent) {
      // @ts-ignore
      return JSON.parse(router.query.intent)
    } else {
      return null
    }
  }, [router.query.intent])

  const grantAccess = useCallback(() => {
    // speak(
    //   'Segnale ricevuto, validazione in corso. <break time="4s" />Accesso consentito.'
    // )
    // setTimeout(() => {
    universeSound.play()
    videoRef.current.src = '/nakamoto/video3.mov'
    videoRef.current.play()
    setStartNakamotoRealProcess(true)
    accessGrantedSound.play()
    setShowQRCode(false)

    // }, 5000)
  }, [setShowQRCode, videoRef])

  useEffect(() => {
    // @ts-ignore
    window.grantAccess = grantAccess
  }, [grantAccess])

  useEffect(() => {
    if (nftImages?.length) {
      const { data: imageData } = supabase.storage
        .from('public')
        .getPublicUrl(`nft/${nftImages[0].name}`)

      if (!imageData) {
        return
      }

      if (imageUrl === '') {
        setImageUrl(imageData.publicURL)
      } else {
        if (imageUrl !== imageData.publicURL && missions.mission2.completed) {
          setImageUrl(imageData.publicURL)
          missions.mission3.setCompleted(true)
          speak(
            'obiettivi completati. Processo Nakamoto in esecuzione! ' +
              'In comunicazione con lo Smart Contract H-FARM Enebling Solutions <say-as interpret-as="characters">NFT</say-as>, ' +
              'per la generazione di un nuovo token <say-as interpret-as="characters">ERC721</say-as>. La tua foto sarà salvata ' +
              'per sempre sulla blockchain di Ethereum Polygon.<break time="1s"/> ' +
              'Validazione dati in corso. <break time="4s"/> Necessaria autorizzazione!'
          )
          setTimeout(() => {
            accessDeniedSound.play()
            setStartNakamotoFakeProcess(true)
            audioRef.current.pause()
            setTimeout(() => {
              speak(
                "Probabilmente serve l'autorizzazione di Fabio. Ti invio il QR code da condividergli.",
                'paolo'
              )
              setTimeout(() => {
                setShowQRCode(true)
              }, 6000)
            }, 5000)
          }, 28000)
        }
      }
    }
  }, [
    audioRef,
    imageUrl,
    missions.mission2.completed,
    missions.mission3,
    nftImages,
    setShowQRCode,
    speak,
  ])

  useEffect(() => {
    async function alexaEvents() {
      if (!alexaIntent?.intent || !alexa) {
        return
      }

      switch (alexaIntent.intent) {
        case 'StartNakamotoIntent': {
          play()
          setNakaTitleVisible(true)
          setTimeout(() => {
            setNakaTitleVisible(false)
            speak(
              'Francesco, proverò a darti supporto. Il programma Nakamoto prevede il raggiungimento di 3 obiettivi. Te li indico sul tuo display. Buona fortuna!',
              'paolo',
              true
            )
          }, 38000)
          break
        }
      }
    }
    alexaEvents()
  }, [alexa, alexaIntent, play, setNakaTitleVisible, speak])

  return (
    <Container
      className="w-screen h-screen flex items-center justify-center"
      clean
    >
      {missions.mission3.completed && startNakamotoFakeProcess && (
        <>
          <NakamotoAccess granted={startNakamotoRealProcess} />
          {startNakamotoRealProcess && <NakamotoProcess imageUrl={imageUrl} />}
        </>
      )}
      {missions.mission3.completed && !startNakamotoFakeProcess && (
        <div className="px-12 py-10 font-medium text-3xl font-mono border-solid bg-black bg-opacity-60 flex">
          <div className="mr-5">Loading</div>
          <LoadingDots />
        </div>
      )}

      {nakaTitleVisible && (
        <div className="fixed bottom-48 left-40 font-mono transition-all nakaTitle">
          <h1 className="text-4xl mb-3 font-bold font-mono">
            Nakamoto Program
          </h1>
          <p className="text-2xl mb-10">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(14000)
                  .changeDelay(40)
                  .typeString(
                    'HESN addr(0x8Cb37f2b7986F68F11683B69D12732DDb479066B)'
                  )
                  .start()
              }}
            />
          </p>
          <p className="text-lg">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .pauseFor(18000)
                  .changeDelay(40)
                  .typeString('Directed by cesconix.eth')
                  .start()
              }}
            />
          </p>
        </div>
      )}
    </Container>
  )
}
// <div>
//   {imageUrl}
//   {imageUrl !== '' && <button onClick={handleSubmit}>test</button>}
// </div>
