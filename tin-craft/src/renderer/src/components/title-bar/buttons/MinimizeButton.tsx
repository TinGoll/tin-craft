import { FC } from 'react'
import styles from './MinimizeButton.module.css'
import img from '../../../assets/minimize_bt.png'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const MinimizeButton: FC<Props> = (props) => {
  return (
    <button {...props} className={styles.minimizeButton}>
      <img className={styles.minimizeButtonImg} src={img} alt="Minimize" />
    </button>
  )
}
