/* eslint-disable no-console */
import { StreamChat } from 'stream-chat';

import * as config from '@/config';
import { Project, User } from '@/model';

export type BadRoute =
  | 'not-found'
  | 'not-implemented'
  | 'server-error'
  | 'bad-route';

export function redirect(path: string, returnUrl?: string) {
  if (returnUrl) {
    window.location.href = `${window.location.origin}/${path}?redirect=${returnUrl}`;
  } else {
    window.location.href = `${window.location.origin}/${path}`;
  }
}

export async function redirectBack() {
  const redirect =
    new URLSearchParams(window.location.search).get('redirect') || '/';
  const isRelative =
    new URL(document.baseURI).origin ===
    new URL(redirect, document.baseURI).origin;

  if (isRelative) {
    location.replace(redirect);
  } else {
    location.replace('/');
  }
}

export const validProjectId = (candidate: any) => {
  return !!Number(String(candidate));
};

export const getCurrentUser = async () => {
  try {
    const resp = await fetch(`${config.apiBase}info/user`);
    if (resp.ok) {
      return resp.json();
    }
  } catch (error) {
    console.log(error);
  }
  return null;
};

export const getProjectId = async () => {
  const candidate = window.location.pathname.split('/').pop();

  if (validProjectId(candidate)) {
    return candidate as string;
  }

  return null;
};

export const fetchProjectById = async (projectId: string | number | null) => {
  try {
    const resp = await fetch(`${config.apiBase}project/${projectId}`, {
      headers: config.getAPIHeaders,
      method: 'get',
    });
    if (resp.ok) {
      return (await resp.json()) as Project;
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchProject = async (
  projectId: string | number | null,
  brief_id: string | number | null
) => {
  try {
    const resp = await fetch(
      `${config.apiBase}project/${projectId}/${brief_id}`,
      {
        headers: config.getAPIHeaders,
        method: 'get',
      }
    );
    if (resp.ok) {
      return (await resp.json()) as Project;
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchUser = async (id: number | string) => {
  const resp = await fetch(`${config.apiBase}users/byid/${id}`, {
    headers: config.getAPIHeaders,
  });
  if (resp.ok) {
    const user = await resp.json();
    return user;
  }
};

export const fetchUserByUsernameOrAddress = async (
  usernameOrAddress: string
) => {
  try {
    const resp = await fetch(
      `/api/users/byUsernameOrAddress/${usernameOrAddress}`
    );
    return await resp.json();
  } catch (error) {
    return [];
  }
};

export const searchUserByUsernameOrAddress = async (
  usernameOrAddress: string
) => {
  try {
    const resp = await fetch(`/api/users/search/${usernameOrAddress}`);
    return await resp.json();
  } catch (error) {
    return [];
  }
};

export const matchedByUserName = async (usernameOrAddress: string) => {
  try {
    const resp = await fetch(`/api/users/matchUserName/${usernameOrAddress}`);
    return await resp.json();
  } catch (error) {
    return null;
  }
};

export const matchedByUserNameEmail = async (usernameOrAddress: string) => {
  try {
    const resp = await fetch(
      `/api/users/byusernameoremail/${usernameOrAddress}`
    );
    return await resp.json();
  } catch (error) {
    return null;
  }
};

export const badRouteEvent = (type: BadRoute) =>
  new CustomEvent(config.event.badRoute, {
    bubbles: true,
    composed: true,
    detail: type,
  });

export function validateForm(form: HTMLFormElement): boolean {
  const fields: HTMLInputElement[] = Array.from(
    form.querySelectorAll('.input-field')
  );
  fields.forEach((input) => reportValidity(input, true));

  const valid = fields.every(($input) => $input.checkValidity());
  return valid;
}

export const getStreamChat = async () => {
  const { getstreamApiKey } = await fetch(`${config.apiBase}info`).then(
    (resp) => resp.json()
  );
  return new StreamChat(getstreamApiKey);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reportValidity(input: HTMLInputElement, _submitting = false) {
  if (input.validity.valueMissing) {
    input.setAttribute('validationmessage', 'This field is required.');
  }
  input.reportValidity();
}

export const checkEnvironment = () => {
  const base_url = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
  return base_url;
};

export const updateUser = async (user: User) => {
  const resp = { status: 401, message: 'User is not Authenticated' };
  try {
    const update = await fetch(`${config.apiBase}/info/user/update`, {
      headers: config.postAPIHeaders,
      method: 'put',
      body: JSON.stringify(user),
    });

    if (update.status === 200) {
      return update.json();
    } else {
      return { status: update.status, message: update.statusText };
    }
  } catch (error) {
    return resp;
  }
};

export const sendNotification = async (
  target: string,
  type: string,
  title: string,
  text: string,
  briefId?: number,
  applicationId?: number
) => {
  const resp = { status: 401, message: 'User is not Authenticated' };
  try {
    const update = await fetch(`${config.apiBase}getstream`, {
      headers: config.postAPIHeaders,
      method: 'post',
      body: JSON.stringify({
        target,
        type,
        text,
        title,
        briefId,
        applicationId,
      }),
    });

    if (update.status === 200) {
      return update.json();
    } else {
      return { status: update.status, message: update.statusText };
    }
  } catch (error) {
    return resp;
  }
};

export const getNotification = async () => {
  const resp = {
    status: 401,
    message: 'User is not Authenticated',
    new_notification: [],
  };
  try {
    const update = await fetch(`${config.apiBase}getstream/getnotifications`, {
      method: 'get',
    });
    if (update.status === 200) {
      return update.json();
    } else {
      return {
        status: update.status,
        message: update.statusText,
        new_notification: [],
      };
    }
  } catch (error) {
    return resp;
  }
};

export const updateLastNotification = async (id: string) => {
  try {
    await fetch(`${config.apiBase}getstream/getnotifications`, {
      headers: config.postAPIHeaders,
      method: 'post',
      body: JSON.stringify({ notificationId: id }),
    });
  } catch (error) {
    console.error(error);
  }
};
