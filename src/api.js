import { supabase } from './supabase'

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
  const key = text.toLowerCase().trim()

  // Check shared cache first
  const { data: cached } = await supabase
    .from('translations')
    .select('*')
    .eq('original', key)
    .eq('from_lang', fromLang)
    .eq('to_lang', toLang)
    .maybeSingle()

  if (cached) {
    return {
      correctedInput: cached.corrected_input || cached.original,
      translation: cached.translation,
      category: cached.category,
      example: cached.example,
      exampleTranslation: cached.example_translation,
      type: cached.type,
      fromCache: true,
    }
  }

  // Call AI
  const fromName = LANG_NAMES[fromLang] || fromLang
  const toName = LANG_NAMES[toLang] || toLang
  const cats = CATEGORIES.join(', ')

  const prompt = `Traduce la siguiente palabra/frase del ${fromName} al ${toName} y analízala.
Si la palabra tiene errores ortográficos, corrígela silenciosamente y usa la forma correcta.
Responde SOLO con JSON válido en este formato exacto:
{
  "correctedInput": "la palabra corregida (igual al input si no hay errores)",
  "translation": "traducción aquí",
  "category": "una categoría de esta lista: ${cats}",
  "example": "una oración de ejemplo en ${fromName} usando la palabra correcta",
  "exampleTranslation": "traducción del ejemplo al ${toName}",
  "type": "sustantivo/verbo/adjetivo/adverbio/frase/otro"
}

Palabra/frase: "${text}"`

  const raw = await callDeepSeek(prompt)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Respuesta inválida de IA')
  const result = JSON.parse(jsonMatch[0])

  // Save to shared cache
  await supabase.from('translations').upsert({
    original: key,
    from_lang: fromLang,
    to_lang: toLang,
    translation: result.translation,
    corrected_input: result.correctedInput !== key ? result.correctedInput : null,
    category: result.category,
    example: result.example,
    example_translation: result.exampleTranslation,
    type: result.type,
  }, { onConflict: 'original,from_lang,to_lang', ignoreDuplicates: true })

  return result
}
