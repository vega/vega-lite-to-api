// import {timeUnitOps} from 'vega-lite-api/api/ops';
import {
  isLocalSingleTimeUnit,
  isUtcSingleTimeUnit,
  isUTCTimeUnit,
  LocalMultiTimeUnit,
  TimeUnit
} from 'vega-lite/build/src/timeunit';

export const MULTI_TIMEUNIT_SHORTHAND: {[t in LocalMultiTimeUnit]: string} = {
  yearquarter: 'YQ',
  yearquartermonth: 'YQM',
  yearmonth: 'YM',
  yearmonthdate: 'YMD',
  yearmonthdatehours: 'YMDH',
  yearmonthdatehoursminutes: 'YMDHM',
  yearmonthdatehoursminutesseconds: 'YMDHMS',
  quartermonth: 'QM',
  monthdate: 'MD',
  monthdatehours: 'MDH',
  hoursminutes: 'HM',
  hoursminutesseconds: 'HMS',
  minutesseconds: 'MS',
  secondsmilliseconds: 'SMS'
};

export function timeUnitMethod(timeUnit: TimeUnit) {
  if (isLocalSingleTimeUnit(timeUnit) || isUtcSingleTimeUnit(timeUnit)) {
    return timeUnit;
  } else {
    // Multi
    const prefix = isUTCTimeUnit(timeUnit) ? 'utc' : 'time';
    const localTimeUnit: LocalMultiTimeUnit = isUTCTimeUnit(timeUnit)
      ? (timeUnit.substr(3) as LocalMultiTimeUnit)
      : timeUnit;
    return prefix + MULTI_TIMEUNIT_SHORTHAND[localTimeUnit];
  }
}
