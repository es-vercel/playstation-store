import { useAlexa } from '@lib/hooks/useAlexa'
import cn from 'clsx'
import s from './NakamotoAccess.module.css'

interface Props {
  granted: boolean
}

const NakamotoAccess: React.FC<Props> = ({ granted }) => {
  const { missions } = useAlexa()

  return (
    <div className={cn(s.root, { [s.granted]: granted })}>
      {granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
    </div>
  )
}

export default NakamotoAccess
