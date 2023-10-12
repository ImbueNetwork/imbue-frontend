import { useEffect } from 'react';
import { useFeedContext } from 'react-activity-feed';

export default function Notifier(val: any) {
  const Feed = useFeedContext();
  useEffect(() => {
    Feed.refreshUnreadUnseen();
    console.log(Feed.unread, Feed.unseen);
  }, []);
  return <div>hello</div>;
}
