const DEEPSEEK_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions'

const LANG_NAMES = {
  de: 'alemán', es: 'español', en: 'inglés', fr: 'francés',
  it: 'italiano', pt: 'portugués', ja: 'japonés', zh: 'chino',
  ru: 'ruso', ko: 'coreano', ar: 'árabe',
}

export const LANGUAGES = [
  { code: 'de', label: 'Alemán 🇩🇪' },
  { code: 'es', label: 'Español 🇪🇸' },
  { code: 'en', label: 'Inglés 🇺🇸' },
  { code: 'fr', label: 'Francés 🇫🇷' },
  { code: 'it', label: 'Italiano 🇮🇹' },
  { code: 'pt', label: 'Portugués 🇧🇷' },
  { code: 'ja', label: 'Japonés 🇯🇵' },
  { code: 'zh', label: 'Chino 🇨🇳' },
  { code: 'ru', label: 'Ruso 🇷🇺' },
]

export const CATEGORIES = [
  'General', 'Comida', 'Viajes', 'Trabajo', 'Familia', 'Naturaleza',
  'Tecnología', 'Salud', 'Ropa', 'Casa', 'Tiempo', 'Emociones',
  'Animales', 'Deportes', 'Arte', 'Educación', 'Negocios',
]

async function callDeepSeek(prompt) {
  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
    }),
  })
  if (!res.ok) throw new Error(`DeepSeek error: ${res.status}`)
  const data = await res.json()
  return data.choices[0].message.content.trim()
}

export async function translateAndAnalyze(text, fromLang, toLang) {
  const fromName = LANG_NAMES[fromLang] || fromLang
  const toName = LANG_NAMES[toLang] || toLang
  const cats = CATEGORIES.join(', ')

  const prompt = `Traduce la siguiente palabra/frase del ${fromName} al ${toName} y analízala.
Responde SOLO con JSON válido en este formato exacto:
{
  "translation": "traducción aquí",
  "category": "una categoría de esta lista: ${cats}",
  "example": "una oración de ejemplo en ${fromName} usando la palabra",
  "exampleTranslation": "traducción del ejemplo al ${toName}",
  "type": "sustantivo/verbo/adjetivo/adverbio/frase/otro"
}

Palabra/frase: "${text}"`

  const raw = await callDeepSeek(prompt)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Respuesta inválida de IA')
  return JSON.parse(jsonMatch[0])
}
