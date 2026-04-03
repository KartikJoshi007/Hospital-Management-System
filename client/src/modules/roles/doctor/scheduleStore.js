// Shared in-memory store for schedule events
// DoctorPatientModal writes here, Schedule reads from here

const STORAGE_KEY = 'doctor_schedule_events'

export function getScheduleEvents() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function addScheduleEvent(event) {
  const events = getScheduleEvents()
  // avoid duplicates by id
  if (events.some(e => e.id === event.id)) return
  events.push(event)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  window.dispatchEvent(new Event('scheduleUpdated'))
}
