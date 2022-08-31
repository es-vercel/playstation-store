import cn from 'clsx'
import s from './NakamotoAccess.module.css'

interface Props {
  granted: boolean
}

const NakamotoAccess: React.FC<Props> = ({ granted }) => {
  return (
    <div className={s.root}>
      <div className={cn(s.label, { [s.granted]: granted })}>
        {granted ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
      </div>
    </div>
  )
}

export default NakamotoAccess
