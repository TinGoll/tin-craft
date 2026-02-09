import { FC, ReactNode } from 'react'
import styles from './Button.module.css'
import clsx from 'clsx'

type ButtonVariant = 'default' | 'primary'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  icon?: ReactNode
  variant?: ButtonVariant
}

export const Button: FC<Props> = ({ variant = 'default', className, ...props }) => {
  return <button {...props} className={clsx(styles.mcButton, styles[variant], className)} />
}
