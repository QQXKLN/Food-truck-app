const { Location } = require('../models');

const pad = (value) => String(value).padStart(2, '0');

const getTodayDate = (date = new Date()) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getCurrentTime = (date = new Date()) => {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
  const dayOfWeek = date.getDay();
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
