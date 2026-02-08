import { FC } from 'react'
import styles from './Form.module.css'
import { Input } from '../inputs'
import { AiFillSkin } from 'react-icons/ai'
import { FaLock } from 'react-icons/fa6'

export const LoginForm: FC = () => {
  return (
    <div className={styles.form}>
      <div>
        <h2>Вход в аккаунт</h2>
      </div>
      <div className={styles.inputs}>
        <Input placeholder="Никнейм" tabIndex={0} icon={<AiFillSkin />} />
        <Input placeholder="Пароль" type="password" tabIndex={1} icon={<FaLock />} />
      </div>
    </div>
  )
}
