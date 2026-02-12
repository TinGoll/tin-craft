import { FC } from 'react'
import styles from './MaximizeButton.module.css'
import img from '../../../assets//maximize_bt.png'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>

export const MaximizeButton: FC<Props> = (props) => {
  return (
    <button {...props} className={styles.maximizeButton}>
      <img className={styles.maximizeButtonImg} src={img} alt="Maximize" />
    </button>
  )
}
