import * as config from '@/config';

export const createProject = async (
  application_id: number,
  project: any
) => {
  try {
    const resp = await fetch(`${config.apiBase}/project/${application_id}`, {
      headers: config.postAPIHeaders,
      method: 'put',
      body: JSON.stringify(project),
    });

    if (resp.status === 201 || resp.status === 200) {
      return resp as any;
    } else {
      return { message: `${resp.status} ${resp.statusText}` };
    }
  } catch (error: any) {
    return { message: `${error?.message}` };
  }
};
