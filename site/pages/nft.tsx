import { useCallback, useEffect, useMemo, useState } from 'react'
import { Container } from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import { useAlexa } from '@lib/hooks/useAlexa'

async function uploadFileToPinata(fileUri: any) {
  const res = await axios({
    method: 'post',
    url: '/api/pinFile',
    data: {
      fileUri,
    },
  })

  return res.data
}

async function uploadJSONToPinata(name: string, content: any) {
  const res = await axios({
    method: 'post',
    url: '/api/pinJSON',
    data: {
      name,
      content,
    },
  })

  return res.data
}

async function mint(tokenUri: string) {
  const res = await axios({
    method: 'post',
    url: '/api/nfts',
    data: {
      tokenUri,
    },
  })

  return res.data
}

export default function Nft() {
  const router = useRouter()
  const { alexa, speak, play } = useAlexa()
  const [imageUrl, setImageUrl] = useState<string>('')

  async function fetcher() {
    const { data } = await supabase.storage.from('public').list('nft', {
      limit: 5,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    })

    return data
  }

  const { data: nftImages } = useSWR('nftBucketImages', fetcher, {
    refreshInterval: 30000,
  })

  const handleSubmit = useCallback(async () => {
    try {
      const now = new Date()
      const id =
        now.toLocaleDateString('en-GB').split('/').join('') +
        now.getMinutes() +
        now.getSeconds()
      const pinataImage = await uploadFileToPinata(imageUrl)
      const pinataJson = await uploadJSONToPinata(`esn-${id}.json`, {
        name: `Composable Commerce Conference #${id}`,
        description: `Composable Commerce Conference #${id} by H-FARM Enabling Solutions`,
        image: `ipfs://${pinataImage.IpfsHash}`,
      })
      const txn = await mint(`ipfs://${pinataJson.IpfsHash}`)
      console.log(txn)
    } catch (e) {}
  }, [imageUrl])

  const alexaIntent = useMemo(() => {
    if (router.query.intent) {
      // @ts-ignore
      return JSON.parse(router.query.intent)
    } else {
      return null
    }
  }, [router.query.intent])

  useEffect(() => {
    if (nftImages?.length) {
      const { data: imageData } = supabase.storage
        .from('public')
        .getPublicUrl(`nft/${nftImages[0].name}`)

      setImageUrl(imageData.publicUrl)
    }
  }, [nftImages])

  useEffect(() => {
    async function alexaEvents() {
      if (!alexaIntent?.intent || !alexa) {
        return
      }

      switch (alexaIntent.intent) {
        case 'StartNakamotoIntent': {
          play()
          setTimeout(() => {
            speak(
              'Francesco, fai attenzione. Ti ricordo che per completare il programma Nakamoto, avrai bisogno della collaborazione di Fabio. Buona fortuna!',
              'paolo',
              true
            )
          }, 5000)
          break
        }
      }
    }
    alexaEvents()
  }, [alexa, alexaIntent, play, speak])

  return (
    <Container className="max-w-none w-full" clean>
      <div className="relative">
        {imageUrl}
        {imageUrl !== '' && <button onClick={handleSubmit}>test</button>}
      </div>
    </Container>
  )
}
