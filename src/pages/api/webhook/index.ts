import sgMail from '@sendgrid/mail';

import * as models from '@/lib/models';

import db from '@/db';
import { User } from '@/model';

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendMail = sgMail;

export default async function handler(req: any, res: any) {
  try {
    if (req.body.type === 'message.new') {
      let targetUser = '';
      let sender: any;

      if (!req.body.members[0].user.online) {
        targetUser = req.body.members[0].user.id;
        sender = req.body.members[1].user;
      } else if (!req.body.members[1].user.online) {
        targetUser = req.body.members[1].user.id;
        sender = req.body.members[0].user;
      }

      if (targetUser !== '') {
        db.transaction(async (tx) => {
          try {
            const user = (await models.fetchUser(Number(targetUser))(
              tx
            )) as User;
            const msg = {
              to: user.email,
              from: 'info@imbue.network', // Use the email address or domain you verified above
              subject: 'You have an unread message',
              text: 'imbue@Network.com',
              html: `<h2> Dear, ${user.display_name} </h2 <br/> <br/> 
            ${
              sender?.name || 'someone'
            } has sent you a message and waiting for your reply </strong>`,
            };
            await sgMail.send(msg);
          } catch (error: any) {
            console.log(error);
            if (error.response) {
              console.error(error.response.body);
            }
          }
        });
      }
    }

    res.status(200).json({ text: 'ok' });
  } catch (error: any) {
    res.status(501).send('error sending message: ');
  }
}
