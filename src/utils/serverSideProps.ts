import { authenticate } from '@/pages/api/info/user';

export const getServerSideProps = async (context: any) => {
  const { req, res } = context;
  try {
    const user = await authenticate('jwt', req, res);
    if (user) {
      return { props: { isAuthenticated: true, user } };
    }
  } catch (error: any) {
    console.error(error);
  }
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
};
