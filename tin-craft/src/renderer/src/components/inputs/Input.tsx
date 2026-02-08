import { FC, ReactNode } from 'react'
import styles from './Input.module.css'

type InputProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  icon?: ReactNode
}

export const Input: FC<InputProps> = ({ icon, ...props }) => {
  return (
    <div className={`${styles.inputWrapper} input-wrapper`}>
      {icon ? <span className={`${styles.icon} input-icon`}>{icon}</span> : null}
      <input
        type="text"
        className={`${styles.input} input`}
        placeholder="Введите текст..."
        {...props}
      />
    </div>
  )
}
