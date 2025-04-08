import { PACKAGES } from '../../blizzard/constants';
import { log, suiClient } from '../utils.script';

const EVENT = `${PACKAGES.BLIZZARD.original}::blizzard_event_wrapper::BlizzardEvent<${PACKAGES.BLIZZARD.original}::blizzard_events::SyncExchangeRate>`;

(async () => {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: EVENT,
    },
  });

  log(
    events.data.filter((event) =>
      (event.parsedJson as any).pos0.lst.name.includes('MWAL')
    )
  );
})();
