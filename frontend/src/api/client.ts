const API_BASE = import.meta.env.VITE_API_URL ?? ''

export type Mood = 'happy' | 'neutral' | 'sad'

export type HistoryItem = {
  date: string
  mood: Mood
  response: string
  text?: string | null
}

export type TodayCheckin = {
  has_checkin: boolean
  checkin_id?: string | null
  mood?: Mood | null
  ai_response?: string | null
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })

  if (!response.ok) {
    let detail = 'Something went wrong. Please try again.'
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      // keep default message
    }
    throw new Error(detail)
  }

  return response.json() as Promise<T>
}

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` }
}

export function register(pin: string) {
  return request<{ user_id: string; message: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}

export function login(pin: string) {
  return request<{ user_id: string; session_token: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}

export function createCheckin(token: string, mood: Mood, text?: string) {
  return request<{ checkin_id: string; ai_response: string }>('/checkin', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ mood, text: text || null }),
  })
}

export function getTodayCheckin(token: string) {
  return request<TodayCheckin>('/checkin/today', {
    headers: authHeaders(token),
  })
}

export function getHistory(token: string) {
  return request<HistoryItem[]>('/history', {
    headers: authHeaders(token),
  })
}

export type VoiceMode = 'proactive' | 'open' | 'comfort'

export type VoiceStatus = {
  configured: boolean
  tts_configured: boolean
  agent_id_set: boolean
}

export type VoiceSession = {
  conversation_token: string
  signed_url: string
  first_message: string
  system_prompt: string
  mode: VoiceMode
  agent_id: string
  prefer_webrtc?: boolean
  use_overrides?: boolean
}

export function getVoiceStatus(token: string) {
  return request<VoiceStatus>('/voice/status', {
    headers: authHeaders(token),
  })
}

export function createVoiceSession(
  token: string,
  body: { mode: VoiceMode; mood?: Mood; comfort_text?: string },
) {
  return request<VoiceSession>('/voice/session', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
}

export async function speakText(token: string, text: string): Promise<Blob> {
  const response = await fetch(`${API_BASE}/voice/speak`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(token),
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    let detail = 'Could not speak that message.'
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      // keep default
    }
    throw new Error(detail)
  }

  return response.blob()
}
