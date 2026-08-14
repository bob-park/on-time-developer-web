import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';

timeago.register('ko', ko);

export default function TimeAgoKo({ datetime }: Readonly<{ datetime: Date }>) {
  return <TimeAgo locale="ko" datetime={datetime} />;
}
