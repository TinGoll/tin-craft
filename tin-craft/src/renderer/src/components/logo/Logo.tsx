import { FC } from 'react'
import styles from './Logo.module.css'
import logo from '../../assets/icon.png'

export const Logo: FC = () => {
  return (
    <div className={styles.logo}>
      <img src={logo} alt="TinCraft Logo" className={styles.logoImage} />
    </div>
  )
}
