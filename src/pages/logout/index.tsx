import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { logout } from '@/redux/reducers/userReducers';
import { AppDispatch } from '@/redux/store/store';

const Logout = () => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(logout());
  }, [dispatch]);
};

export default Logout;
