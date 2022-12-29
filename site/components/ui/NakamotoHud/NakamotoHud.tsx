import { useAlexa } from '@lib/hooks/useAlexa'
import cn from 'clsx'
import s from './NakamotoHud.module.css'

const NakamotoHud: React.FC = () => {
  const { missions } = useAlexa()

  return (
    <div className={cn(s.root, { nakaHud: true })}>
      <NakamotoMission
        id="1"
        title="COMBINAZIONE PRODOTTI"
        completed={missions.mission1.completed}
      />
      <NakamotoMission
        id="2"
        title="DATA KICK OFF JAKALA"
        completed={missions.mission2.completed}
      />
      <NakamotoMission
        id="3"
        title="RENDILO MEMORABILE"
        completed={missions.mission3.completed}
      />
    </div>
  )
}

interface NakamotoMissionProps {
  id: string
  title: string
  completed: boolean
}

const NakamotoMission: React.FC<NakamotoMissionProps> = ({
  id,
  title,
  completed,
}) => {
  return (
    <div className="flex flex-row items-center font-mono my-2 ">
      <div
        className="px-3 py-1  flex items-center justify-cente "
        style={{
          backgroundColor: completed ? 'lime' : 'white',
        }}
      >
        <span className="font-bold text-black">
          {completed ? 'COMPLETED' : '*'}
        </span>
      </div>
      <div
        className="ml-4 text-lg font-bold"
        style={{ color: completed ? 'lime' : 'white' }}
      >
        {/* {completed ? title : `UNKNOWN MISSION #${id}`} */}
        {title}
      </div>
    </div>
  )
}

export default NakamotoHud
