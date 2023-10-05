import Dashboard from './index';

export default function DynamicDashboard(props: any) {
  return <Dashboard val={props.params} />;
}

export async function getServerSideProps(context: any) {
  return {
    props: context.params, // will be passed to the page component as props
  };
}
