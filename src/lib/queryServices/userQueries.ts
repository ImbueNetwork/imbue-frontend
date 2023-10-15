import { Knex } from 'knex';

import { User } from '@/model';

export const fetchUserByList =
  (walletList: string[]) => (tx: Knex.Transaction) => {
    return tx<User>('users').whereIn('web3_address', walletList);
  };

export const fetchUserByIdList =
  (IdList: string[]) => (tx: Knex.Transaction) => {
    return tx<User>('users').whereIn('id', IdList);
  };
