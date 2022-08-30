import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@lib/supabaseClient'

async function storage(req: NextApiRequest, res: NextApiResponse) {
  const { data } = await supabase.storage.from('public').list('nft', {
    limit: 1,
    offset: 0,
    sortBy: { column: 'created_at', order: 'desc' },
  })

  return res.status(200).json(data)
}

export default storage
