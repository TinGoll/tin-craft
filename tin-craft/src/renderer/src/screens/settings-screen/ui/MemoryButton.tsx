import { SoundButton } from '@renderer/components/buttons/SoundButton'
import { FC } from 'react'
import styles from './MemoryButton.module.css'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>
export const MemoryButton: FC<Props> = (props) => {
  return <SoundButton className={styles.memoryButton} {...props} />
}
