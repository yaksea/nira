String.prototype.trim = function()
{
    return this.replace(/(^\s*)|(\s*$)/g, "");
}



Date.prototype.addDays = function(days) {
	return new Date(this.getTime() + days * 24 * 60 * 60 * 1000);
}

Date.prototype.date = function() {
	var date = new Date(this.getFullYear(), this.getMonth(), this.getDate());
	return date;
}
Date.prototype.getWeekNumber = function() {
	var date = this;
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date
					.getDate()));
	var IsoDayOfWeek = date.getDay() == 0 ? 7 : date.getDay(); // Sunday = 7
	date.setDate(date.getDate() + 4 - IsoDayOfWeek); // Change to nearest
	// thursday
	var DayOfYear = (date.getTime() - Date.UTC(date.getFullYear(), 0, 1))
			/ 864e5;
	var week = Math.floor(DayOfYear / 7) + 1;
	return week;
}
Date.prototype.toDateString = function() {
	return (this.getMonth() + 1) + "/" + this.getDate() + "/"
			+ this.getFullYear();
}

Date.prototype.isWeekend = function() {
	return this.getDay() == 0 || this.getDay() == 6;
}

/*
 * Function: daysInMonth Returns: the number of days in the date month Example:
 * alert(new Date(2007, 8, 1).daysInMonth()); // will alert 30 (30 days in
 * Septembar)
 */
Date.prototype.daysInMonth = function() {
	var date = new Date(this.getFullYear(), this.getMonth(), 28);
	var i = 28;
	for (i = 28; i <= 32; i++) {
		date.setDate(i);
		if (date.getMonth() != this.getMonth())
			return (i - 1);
	}
}
/*
 * 
 * Function: getWeekInYear Returns: the number of week in the year Example:
 * alert(new Date(2007,8,12).getWeekInYear()); // will alert 36
 */

Date.prototype.getWeekInYear = function() {
	return Math.floor(this.getDayInYear() / 7);
},
/*
 * Function: getDayInYear Returns: the number of day in the year Example:
 * alert(new Date(2007,8,12).getDayInYear()); // will alert 253
 */
Date.prototype.getDayInYear = function() {
	return Math.floor(this.getHourInYear() / 24);
}

/*
 * Function: getWeekSince Returns: the number of week since a given date
 * Arguments: date: a javascript date object Example: alert(new
 * Date(2007,8,12).getWeekSince(new Date(2006,2,14))); // will alert 78
 */
Date.prototype.getWeeksSince = function(date) {
	return Math.floor(this.getDaysSince(date) / 7);
}
Date.prototype.getDaysSince = function(date) {
	return Math.floor(this.getHoursSince(date) / 24);
}
Date.prototype.getHoursSince = function(date) {
	return Math.floor(this.getMinutesSince(date) / 60);
}
Date.prototype.getMinutesSince = function(date) {
	return Math.floor((this - date) / 1000 / 60);
}

/*
 * 
 * Function:
 * 
 * fromString
 * 
 * 
 * 
 * Returns:
 * 
 * a date object from the string provided
 * 
 * 
 * 
 * Arguments:
 * 
 * str: the string variable for the date. If the date can't be parsed using
 * Date.parse() a list of custom values are provided below.
 * 
 * All custom values are relative to the date object
 * 
 * Possible values: - Any string that can be parsed by Date.parse()
 * 
 * Short dates can use either a "/", "\" or "-" date separator, but must follow
 * the month/day/year format, for example "7/20/96".
 * 
 * month are 1 for January 12 for December
 * 
 * Long dates of the form "July 10 1995" can be given with the year, month, and
 * day in any order, and the year in 2-digit or 4-digit form. If you use the
 * 2-digit form, the year must be greater than or equal to 70.
 * 
 * Month and day names must have two or more characters. Two character names
 * that are not unique are resolved as the last match. For example, "Ju" is
 * resolved as July, not June.
 * 
 * Handles all standard time zones, as well as Universal Coordinated Time (UTC)
 * and Greenwich Mean Time (GMT).
 * 
 * Colons separate hours, minutes, and seconds, although all need not be
 * specified. "10:", "10:11", and "10:11:12" are all valid.
 * 
 * If the 24-hour clock is used, it is an error to specify "PM" for times later
 * than 12 noon. For example, "23:15 PM" is an error.
 * 
 * A string containing an invalid date is an error. For example, a string
 * containing two years or two months is an error. - "yesterday" a day before
 * relative to the date object - "tomorrow" a day after relative to the date
 * object - "today+[n]" [n] is any number
 * 
 * add the [n] number of days to the date - "today-[n]" [n] is any number
 * 
 * subtract the [n] number of days from the date - "last month" a month before
 * relative to the date object - "next month" a month after relative to the date
 * object - "month+[n]" [n] is any number
 * 
 * add the [n] number of months to the date - "month-[n]" [n] is any number
 * 
 * subtract the [n] number of days from the date - "last year" - "next year" -
 * "year+[n]" - "year-[n]"
 * 
 * 
 * 
 * Example:
 * 
 * alert(new Date().fromString("yesterday")); // will alert yesterday's day
 * 
 * 
 * 
 */

Date.fromString = function(str) {

	var prs_dt = Date.parse(str.replace(/[-|\\]/g, "/"));

	if (isNaN(prs_dt)) {

		str = str.toLowerCase();

		str = str.replace(/(\s)*([\+|-])(\s)*/g, "$2");

		var y = this.getFullYear();

		var m = this.getMonth();

		var d = this.getDate();

		str = str.replace("yesterday", "today-1")

		.replace("tomorrow", "today+1")

		.replace("last month", "month-1")

		.replace("next month", "month+1")

		.replace("last year", "year-1")

		.replace("next year", "year+1");

		if (str.indexOf("today+") >= 0)

			d = d + str.replace("today+", "").toInt();

		else if (str.indexOf("today-") >= 0)

			d = d - str.replace("today-", "").toInt();

		else if (str.indexOf("month+") >= 0) {

			m = m + str.replace("month+", "").toInt();

			var mx_dys = new Date(y, m, 1).daysInMonth();

			if (d > mx_dys)
				d = mx_dys;

		}

		else if (str.indexOf("month-") >= 0) {

			m = this.getMonth() - str.replace("month-", "").toInt();

			var mx_dys = new Date(y, m, 1).daysInMonth();

			if (d > mx_dys)
				d = mx_dys;

		}

		else if (str.indexOf("year+") >= 0) {

			y = y + str.replace("year+", "").toInt();

			var mx_dys = new Date(y, m, 1).daysInMonth();

			if (d > mx_dys)
				d = mx_dys;

		}

		else if (str.indexOf("year-") >= 0) {

			y = this.getFullYear() - str.replace("year-", "").toInt();

			var mx_dys = new Date(y, m, 1).daysInMonth();

			if (d > mx_dys)
				d = mx_dys;

		}

		var dt = new Date(y, m, d, this.getHours(), this.getMinutes(), this
						.getSeconds(), this.getMilliseconds());

	}

	else {

		var dt = new Date(prs_dt);

	}

	return dt;

}
Array.prototype.indexOf = function(elem) {
	for (var i = 0, length = this.length; i < length; i++) {
		if (this[i] === elem) {
			return i;
		}
	}

	return -1;
}
Array.prototype.remove = function(b) {
	var a = this.indexOf(b);
	if (a >= 0) {
		this.splice(a, 1);
		return true;
	}
	return false;
};

/*
 * ["xxx", "yyy", 123].eachDataItem(function(i,d){})
 */
Array.prototype.eachDataItem = function(func){
	for (var i in this) {
		if (isNaN(parseInt(i))) {
			continue;
		}
		func(parseInt(i), this[i]);
	}
}





