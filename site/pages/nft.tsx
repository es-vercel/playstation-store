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
import Typewriter from 'typewriter-effect'

// const accessDeniedSound = new Howl({
//   src: ['/nakamoto/accessDenied.m4a'],
//   html5: true,
// })

// const accessGrantedSound = new Howl({
//   src: ['/nakamoto/success.mp3'],
//   html5: true,
// })

// const universeSound = new Howl({
//   src: ['/nakamoto/universe.mp3'],
//   html5: true,
// })

async function getStorageImages() {
  const res = await axios({
    method: 'get',
    url: '/api/storage',
  })

  return res.data
}

async function getEvents() {
  const res = await axios({
    method: 'get',
    url: '/api/events',
  })

  return res.data
}

export default function Nft() {
  const router = useRouter()

  const {
    alexa,
    speak,
    play,
    missions,
    nakaTitleVisible,
    setNakaTitleVisible,
    videoRef,
    audioRef,
    setShowQRCode,
    video3objectURL,
  } = useAlexa()

  const [imageUrl, setImageUrl] = useState<string>('')
  const [eventId, setEventId] = useState<string>('')

  const [startNakamotoFakeProcess, setStartNakamotoFakeProcess] =
    useState<boolean>(false)

  const [startNakamotoRealProcess, setStartNakamotoRealProcess] =
    useState<boolean>(false)

  const { data: nftImages } = useSWR('nftBucketImages', getStorageImages, {
    refreshInterval: 2000,
  })

  const { data: events } = useSWR('nftEvents', getEvents, {
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
    speak('Segnale ricevuto. <break time="2s" />Accesso consentito.')
    audioRef.current.pause()
    // universeSound.play()
    setShowQRCode(false)
    videoRef.current.src = video3objectURL
    videoRef.current.muted = false
    videoRef.current.volume = 1
    videoRef.current.play()
    setTimeout(() => {
      setStartNakamotoRealProcess(true)
    }, 3000)
    // accessGrantedSound.play()
  }, [audioRef, setShowQRCode, speak, video3objectURL, videoRef])

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
            '<break time="1s"/>Obiettivi completati. Processo Nakamoto in esecuzione! ' +
              '<break time="1s"/>In comunicazione con lo Smart Contract H-FARM Enebling Solutions <say-as interpret-as="characters">NFT</say-as>!.' +
              '<break time="1s"/>La tua foto sta per essere salvata irrevocabilmente sulla blockchain di Ethereum.<break time="1s"/> ' +
              'Validazione dati in corso. <break time="3s"/> Necessaria autorizzazione!'
          )
          setTimeout(() => {
            // accessDeniedSound.play()
            setStartNakamotoFakeProcess(true)
            setTimeout(() => {
              speak(
                "Maledizione! Abbiamo bisogno dell'autorizzazione di Fabio. Ti invio il QR code da condividergli. Veloce!",
                'paolo'
              )
              setTimeout(() => {
                setShowQRCode(true)
              }, 5500)
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
    if (events?.length) {
      const eventDataId = events[0].id

      if (!eventDataId) {
        return
      }
      console.log('eventId', eventId)
      if (eventId === '') {
        setEventId(eventDataId)
      } else {
        if (eventId !== eventDataId && missions.mission3.completed) {
          grantAccess()
        }
      }
    }
  }, [eventId, events, grantAccess, missions.mission3.completed])

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
        <div className="px-12 py-10 font-medium text-3xl font-mono border-solid bg-black bg-opacity-60 flex z-50">
          <div className="mr-5">Contract Waiting</div>
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
