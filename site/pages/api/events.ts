import { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@lib/supabaseClient'

async function events(req: NextApiRequest, res: NextApiResponse) {
  const { data, error } = await supabase
    .from('events')
    .select()
    .order('created_at', { ascending: false })
    .limit(1)
  console.log(data)
  return res.status(200).json(data)
}

export default events
