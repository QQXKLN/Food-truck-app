const { Location } = require('../models');

const APP_TIMEZONE = process.env.APP_TIMEZONE || 'America/Santiago';

const getDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
};

const getTodayDate = (date = new Date()) => {
  const parts = getDateParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const getCurrentTime = (date = new Date()) => {
  const parts = getDateParts(date);
  return `${parts.hour}:${parts.minute}:${parts.second}`;
};

const getCurrentDayOfWeek = (date = new Date()) => {
  const weekday = getDateParts(date).weekday;
  const values = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6
  };

  return values[weekday];
};

const toSeconds = (timeValue) => {
  if (!timeValue) return null;

  const [hours, minutes, seconds = '0'] = String(timeValue).split(':');
  return (Number(hours) * 3600) + (Number(minutes) * 60) + Number(seconds);
};

const isTimeInRange = (currentTime, startTime, endTime) => {
  if (!startTime || !endTime) return true;

  const current = toSeconds(currentTime);
  const start = toSeconds(startTime);
  const end = toSeconds(endTime);

  if ([current, start, end].some((value) => value === null || Number.isNaN(value))) {
    return false;
  }

  if (start <= end) {
    return current >= start && current <= end;
  }

  return current >= start || current <= end;
};

const findActiveLocation = async (foodTruckId, date = new Date()) => {
  const dayOfWeek = getCurrentDayOfWeek(date);
  const currentTime = getCurrentTime(date);

  const locations = await Location.findAll({
    where: {
      foodTruckId,
      isActive: true,
      dayOfWeek
    },
    order: [['startTime', 'ASC']]
  });

  return locations.find((location) => isTimeInRange(currentTime, location.startTime, location.endTime)) || null;
};

module.exports = {
  getTodayDate,
  findActiveLocation,
  isTimeInRange
};
