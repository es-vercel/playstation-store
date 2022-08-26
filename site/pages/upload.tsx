import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Container } from '@components/ui'
import { supabase } from '@lib/supabaseClient'
import axios from 'axios'

export default function Nft() {
  const handleUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    let file

    if (e.target.files) {
      file = e.target.files[0]
    }

    const now = new Date()
    const dateStr =
      now.toLocaleDateString('en-GB').split('/').join('') +
      now.getMinutes() +
      now.getSeconds()

    const { data, error } = await supabase.storage
      .from('public')
      .upload(`nft/${dateStr}-${file?.name}`, file as File)

    if (data) {
      alert('Saved!')
    } else if (error) {
      alert('Error')
    }
  }, [])

  return (
    <Container className="max-w-none w-full" clean>
      <div className="flex min-h-screen flex-col items-center justify-center py-2">
        <input
          type="file"
          accept="image/*"
          className="block w-auto text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          onChange={handleUpload}
        />
      </div>
    </Container>
  )
}
