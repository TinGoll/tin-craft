import { FC } from 'react'
import styles from './CloseButton.module.css'
import img from '../../../assets/close_bt.png'
import { SoundButton } from '@renderer/components/buttons/SoundButton'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const CloseButton: FC<Props> = (props) => {
  return (
    <SoundButton {...props} className={styles.closeButton}>
      <img className={styles.closeButtonImg} src={img} alt="Close" />
    </SoundButton>
  )
}
