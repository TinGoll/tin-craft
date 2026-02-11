export const LOGIN_REGEX = /^[a-zA-Z][a-zA-Z0-9]*$/
const MIN_LOGIN_LENGTH = 3

export const validateLogin = (value: string): string | null => {
  if (!value) return 'Логин обязателен'

  // 1️⃣ кириллица / не латиница в начале
  if (!/^[a-zA-Z]/.test(value)) {
    return 'Используй латинские буквы (a–z)'
  }

  // 2️⃣ длина
  if (value.length < MIN_LOGIN_LENGTH) {
    return `Логин должен быть не короче ${MIN_LOGIN_LENGTH} символов`
  }

  // 3️⃣ допустимые символы
  if (!LOGIN_REGEX.test(value)) {
    return 'Только латинские буквы и цифры, без пробелов и символов'
  }

  return null
}
