import { useCallback, useEffect, useState } from 'react'
import { Container } from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'

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
  const [imageUrl, setImageUrl] = useState<string>('')

  useEffect(() => {
    async function asyncFn() {
      const { data } = await supabase.storage.from('public').list('nft', {
        limit: 5,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

      if (data?.length) {
        const { data: imageData } = supabase.storage
          .from('public')
          .getPublicUrl(`nft/${data[0].name}`)

        setImageUrl(imageData.publicUrl)
      }
    }
    asyncFn()
  }, [])

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

  return (
    <Container className="max-w-none w-full" clean>
      {imageUrl}
      {imageUrl !== '' && <button onClick={handleSubmit}>test</button>}
    </Container>
  )
}
