export function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let hour = 9; hour <= 19; hour++) {
    slots.push(`${String(hour).padStart(2, '0')}:00`)
    if (hour < 19) {
      slots.push(`${String(hour).padStart(2, '0')}:30`)
    }
  }
  return slots
  // Returns 21 slots: ['09:00', '09:30', ..., '18:30', '19:00']
}
