import dayjs from 'dayjs';
import ko from 'dayjs/locale/ko';
import duration from 'dayjs/plugin/duration';
import isoWeek from 'dayjs/plugin/isoWeek';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';

dayjs.locale(ko);
dayjs.extend(duration);
dayjs.extend(relativeTime);
dayjs.extend(isoWeek);
dayjs.extend(updateLocale);

// antd week picker 패널이 ISO 주(월~일)와 맞도록 주 시작을 월요일로 고정
dayjs.updateLocale('ko', { weekStart: 1 });

export default dayjs;
