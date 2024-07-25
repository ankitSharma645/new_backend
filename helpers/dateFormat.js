
export class FormatDate {
    constructor() { }

    async getDateTime(timestamp) {
        const dateObject = new Date(timestamp);

        const hours = dateObject.getHours();
        const minutes = dateObject.getMinutes();
        const period = hours < 12 ? 'AM' : 'PM';
        const formattedHours = (hours % 12 === 0 ? 12 : hours % 12).toString().padStart(2, '0');
        const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[dateObject.getUTCMonth()];
        const day = dateObject.getDate();
        const year = dateObject.getFullYear();
        const formattedDate = `${month} ${day}, ${year}`;

        return { formattedDate, formattedTime }
    }

    async timestampCount(timestamp) {
        const weekdaysCount = [0, 0, 0, 0, 0, 0, 0];

        timestamp.forEach(timestamp => {
            const date = new Date(timestamp.date);
            const dayOfWeek = date.getDay();
            const newCount = weekdaysCount[dayOfWeek] + 1
            weekdaysCount[dayOfWeek] = newCount

        });
        return weekdaysCount
    }

    async midnightTime(time) {
        const currentDate = new Date(time);
        currentDate.setHours(0, 0, 0, 0);
        const midnightTimestamp = currentDate.getTime();

        return Number(midnightTimestamp)
    }


    async weekStartEnd(time) {
        const currentDate = new Date(time);
        const currentDay = currentDate.getDay();

        const daysUntilNextSunday = 0 - currentDay + 7;

        const nextSundayTimestamp = new Date(currentDate);
        nextSundayTimestamp.setDate(currentDate.getDate() + daysUntilNextSunday);
        nextSundayTimestamp.setHours(0, 0, 0, 0);

        const previousSundayTimestamp = new Date(currentDate);
        if (currentDay === 0) {
            previousSundayTimestamp.setHours(0, 0, 0, 0);
        } else {
            const daysUntilPreviousSunday = 0 - currentDay - 7;
            previousSundayTimestamp.setDate(currentDate.getDate() + daysUntilPreviousSunday);
            previousSundayTimestamp.setHours(0, 0, 0, 0);
        }

        return { nextSunday: nextSundayTimestamp.getTime(), previousSunday: previousSundayTimestamp.getTime() };
    }

    async monthStartEnd(time) {
        const currentDate = new Date(time);

        const startOfMonthTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        startOfMonthTimestamp.setHours(0, 0, 0, 0);

        const endOfMonthTimestamp = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        endOfMonthTimestamp.setHours(23, 59, 59, 999);

        return { startOfMonth: startOfMonthTimestamp.getTime(), endOfMonth: endOfMonthTimestamp.getTime() };

    }

    async getTimestampFromYYYYMMDD(dateString) {
        const dateObject = new Date(dateString + 'T00:00:00+05:30')
        const timestamp = dateObject.getTime()
        return timestamp
    }

    async convertTimeStringToMilliseconds(time) {
        const [hours, minutes] = time.split(":").map(Number);
        const totalMilliseconds = (hours * 60 + minutes) * 60 * 1000;
        return totalMilliseconds;
    }

    async getTimestampFromYYYYMMDD(dateString) {
        const dateObject = new Date(dateString + 'T00:00:00+05:30')
        const timestamp = dateObject.getTime()
        return timestamp
    }

    async prescriptionPdfDate(timestamp) {
        if (!timestamp || isNaN(timestamp)) {
            return "Invalid timestamp";
        }

        const date = new Date(+timestamp);
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }

        const formattedDate = `${("0" + date.getDate()).slice(-2)}/${("0" + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;

        let hours = date.getHours();
        const minutes = ("0" + date.getMinutes()).slice(-2);
        const meridiem = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? hours : 12;
        const formattedTime = `${hours}:${minutes} ${meridiem}`;

        return `${formattedDate}, ${formattedTime}`;
    }
    getUnderscoredDateAndTime() {
        const now = new Date();

        // Pad single digits with leading zero
        const pad = (num) => num.toString().padStart(2, '0');

        const day = pad(now.getDate());
        const month = pad(now.getMonth() + 1); // Months are zero-indexed
        const year = now.getFullYear();
        const hours = pad(now.getHours());
        const minutes = pad(now.getMinutes());

        return `${day}_${month}_${year}_${hours}_${minutes}`;
    }

}