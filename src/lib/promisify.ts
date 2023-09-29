import formidable from 'formidable';
import IncomingForm from 'formidable/Formidable';
import { IncomingMessage } from 'http';

const parseForm = async (
  form: IncomingForm,
  req: IncomingMessage
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return await new Promise((resolve, reject) => {
    form.parse(req, function (err, fields, files) {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

export default parseForm;
