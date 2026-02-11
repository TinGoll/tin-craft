import { FC, ReactNode, useState } from 'react'
import styles from './PlayScreen.module.css'
import { useAuthActions, useAuthUser } from '@renderer/features/auth'
import { Button } from '@renderer/components/buttons/Button'

const Info: FC = () => {
  const user = useAuthUser()
  return (
    <div className={styles.greeting}>
      <h3>
        Привет <span className={styles.user}>{user}!</span>
      </h3>
      <p className={styles.text}>Жми &ldquo;Играть&quot; - и в бой!</p>
      <p className={styles.text}>Хочешь сменить пользователя? Жми &ldquo;Выход&quot;.</p>
    </div>
  )
}

export const PlayScreen: FC = () => {
  const { logout } = useAuthActions()
  const [mode, setMode] = useState<'info' | 'play'>('info')

  const registry: Record<'info' | 'play', () => ReactNode> = {
    info: () => <Info />,
    play: () => <div>Игровой экран</div>
  }

  const isPlaying = mode === 'play'

  return (
    <div className={styles.screen}>
      <div className={styles.inventory}>
        {registry[mode]()}
        <div className={styles.buttons}>
          <Button
            style={{flex: 1}}
            loading={isPlaying}
            variant="primary"
            onClick={() => setMode('play')}
          >
            {isPlaying ? 'Загрузка...' : 'Играть'}
          </Button>
          <Button disabled={isPlaying} variant="danger" onClick={logout}>
            Выход
          </Button>
        </div>
      </div>
    </div>
  )
}
