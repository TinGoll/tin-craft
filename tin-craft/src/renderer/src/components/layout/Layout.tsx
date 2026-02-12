import { FC, ReactNode } from 'react'
import styles from './Layout.module.css'
import bg from '../../assets/tincraft_bg.png'
import title from '../../assets/tincraft_title.png'
import front from '../../assets/tincraft_front.png'
import { TitleBar } from '../title-bar'

type Props = {
  children: ReactNode
}

export const Layout: FC<Props> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <div className={styles.titleBar}>
        <TitleBar />
      </div>
      <div className={styles.front}>
        <img className={styles.frontImage} src={front} alt="Front" />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>
          <img className={styles.titleImage} src={title} alt="Title" />
        </div>
        {children}
      </div>
      <div className={styles.background}>
        <img className={styles.backgroundImage} src={bg} alt="Background" />
      </div>
    </div>
  )
}
