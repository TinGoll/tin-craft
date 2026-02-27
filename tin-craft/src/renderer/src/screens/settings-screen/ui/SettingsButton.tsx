import { SoundButton } from '@renderer/components/buttons/SoundButton'
import { FC } from 'react'
import styles from './SettingsButton.module.css'
import clsx from 'clsx'

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  toggled?: boolean
}
export const SettingsButton: FC<Props> = ({ className, toggled, ...props }) => {
  console.log(styles)
  return (
    <SoundButton
      className={clsx(styles.settingsButton, toggled && styles.toggled, className)}
      {...props}
    />
  )
}
