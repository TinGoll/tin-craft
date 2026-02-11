import { FC, ReactNode } from 'react'
import styles from './Button.module.css'
import clsx from 'clsx'

type ButtonVariant = 'default' | 'primary' | 'secondary' | 'danger'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  icon?: ReactNode
  variant?: ButtonVariant
  loading?: boolean
}

export const Button: FC<Props> = ({
  variant = 'default',
  className,
  loading,
  disabled,
  children,
  icon,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={clsx(styles.mcButton, styles[variant], className)}
    >
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        icon && <span className={styles.icon}>{icon}</span>
      )}
      {children}
    </button>
  )
}
