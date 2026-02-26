import { FC } from 'react'
import styles from './MinimizeButton.module.css'
import img from '../../../assets/settings_bt.png'
import { SoundButton } from '@renderer/components/buttons/SoundButton'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const SettingsButton: FC<Props> = (props) => {
  return (
    <SoundButton {...props} className={styles.minimizeButton}>
      <img className={styles.minimizeButtonImg} src={img} alt="Settings" />
    </SoundButton>
  )
}
