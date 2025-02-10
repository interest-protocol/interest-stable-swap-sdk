import { TYPES } from '../../tuskr';
import { aclTestnet } from '../utils.script';

const ADMIN_CAP =
  '0x1b3aa6e42903519309271e439ff31b74f1482c25e3bcb1bd86cc8145801ce2fe';

(async () => {
  const isAdmin = await aclTestnet.isAdmin({
    admin: ADMIN_CAP,
    lstType: TYPES.testnet.TUSKR,
  });

  console.log(isAdmin);
})();
