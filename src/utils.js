
function getHms (seconds = 0) {
  const secsPerHr = 60 * 60
  const secsPerMin = 60
  const hrs = Math.floor(seconds / secsPerHr)
  const mins = Math.floor((seconds - hrs * secsPerHr) / secsPerMin)
  const secs = Math.floor(seconds - hrs * secsPerHr - mins * secsPerMin)
  return [hrs, mins, secs]
}

export default {
  getHms
}
