import { duration } from '@/utils/moment'
import moment from '@/utils/moment'

export const runTimeToEnglish = (startDate, endDate) => {
  if (
    !startDate ||
    !endDate ||
    !(startDate instanceof Date) ||
    !(endDate instanceof Date)
  ) {
    return ''
  }

  const runTimeInMilliseconds = endDate - startDate
  const runTime = duration(runTimeInMilliseconds)

  if (runTimeInMilliseconds === 0) {
    return '0 seconds'
  } else if (runTime >= duration(1, 'week')) {
    return runTime.format('w [weeks], d [days], h [hours]')
  } else if (runTime >= duration(1, 'day')) {
    return runTime.format('d [days], h [hours], m [minutes]')
  } else if (runTime >= duration(1, 'hour')) {
    return runTime.format('h [hours], m [minutes], s [seconds]')
  } else if (runTime >= duration(1, 'minute')) {
    return runTime.format('m [minutes], s [seconds]')
  } else if (runTime >= duration(1, 'second')) {
    return runTime.format('s [seconds]')
  } else if (runTime < duration(1, 'second')) {
    return '~1 second'
  }
  return runTime.humanize()
}

export const durationToEnglish = durationString => {
  if (!durationString) return ''

  const runTime = duration(durationString)

  if (runTime >= duration(1, 'week')) {
    return runTime.format('w [weeks], d [days], h [hours]')
  } else if (runTime >= duration(1, 'day')) {
    return runTime.format('d [days], h [hours], m [minutes]')
  } else if (runTime >= duration(1, 'hour')) {
    return runTime.format('h [hours], m [minutes], s [seconds]')
  } else if (runTime >= duration(1, 'minute')) {
    return runTime.format('m [minutes], s [seconds]')
  } else if (runTime >= duration(1, 'second')) {
    return runTime.format('s [seconds]')
  } else if (runTime < duration(1, 'second')) {
    return '< 1 second'
  }
  return runTime.humanize()
}

export const intervalToEnglish = numberOfMilliseconds => {
  if (numberOfMilliseconds === 604800000) {
    return 'Weekly'
  } else if (numberOfMilliseconds === 86400000) {
    return 'Daily'
  } else if (numberOfMilliseconds === 3600000) {
    return 'Hourly'
  } else if (numberOfMilliseconds === 60000) {
    return 'Every minute'
  } else if (numberOfMilliseconds === 1000) {
    return 'Every second'
  }

  const interval = duration(numberOfMilliseconds)

  if (interval > duration(1, 'week')) {
    return interval.format('[Every] w [weeks], d [days], h [hours]', {
      trim: 'both'
    })
  } else if (interval > duration(1, 'day')) {
    return interval.format('[Every] d [days], h [hours], m [minutes]', {
      trim: 'both'
    })
  } else if (interval > duration(1, 'hour')) {
    return interval.format('[Every] h [hours], m [minutes], s [seconds]', {
      trim: 'both'
    })
  } else if (interval > duration(1, 'minute')) {
    return interval.format('[Every] m [minutes], s [seconds]', { trim: 'both' })
  } else if (interval < duration(1, 'minute')) {
    return interval.format('[Every] s [seconds]', { trim: 'both' })
  }
  return ''
}

export const oneAgo = unitOftime => {
  return moment
    .utc()
    .subtract(1, unitOftime)
    .format()
}

export const roundedOneAgo = unitOftime => {
  let roundedTo

  switch (unitOftime) {
    case 'year':
      roundedTo = 'month'
      break
    case 'month':
      roundedTo = 'day'
      break
    case 'day':
      roundedTo = 'hour'
      break
    case 'hour':
      roundedTo = 'minute'
      break
    case 'minute':
      roundedTo = 'second'
      break
  }

  return moment
    .utc()
    .subtract(1, unitOftime)
    .startOf(roundedTo)
    .format()
}
