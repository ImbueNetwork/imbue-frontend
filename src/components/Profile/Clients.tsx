/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import {
  Badge,
  Box,
  CircularProgress,
  Modal,
  TextField,
  Tooltip,
} from '@mui/material';
import Image from 'next/image';
import React, { ChangeEvent, useState } from 'react';

import { uploadPhoto } from '@/utils/imageUpload';

import { Freelancer } from '@/model';

type ClientsProps = {
  setFreelancer: (_freelancer: any) => void; // FIXME:
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;
  clients: any;
  setClients: (clinet: any) => void;
};

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '50%',
  bgcolor: 'var(--theme-background)',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  outline: 'none',
  padding: '50px',
  borderRadius: '10px',
};

const Clients = ({
  setFreelancer,
  isEditMode,
  clients,
  setClients,
}: ClientsProps) => {
  const [newClient, setNewClient] = useState<any>({});

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const handleClose = () => setOpen(false);
  const [error, setError] = useState<any>({});
  const [inputFile, setInputFile] = useState<any>([]);
  // const [openAddClient] = useState<boolean>(false)

  const removeClient = (e: any, logo: string) => {
    if ((e.target as HTMLElement).nodeName == 'SPAN') {
      const newClients = clients.filter((client: any) => client.logo !== logo);
      setClients(newClients);
      setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients }));
    }
  };

  const handleLogoUpload = async (files: FileList | null) => {
    // setInputFile(files)
    if (files?.length && files[0]?.type?.includes('image')) {
      setLoading(true);
      removeImgError();
      try {
        const data = await uploadPhoto(files[0]);
        if (data.url) {
          setNewClient((prev: any) => {
            return { ...prev, logo: data.url };
          });
        } else {
          setErrorMessage('imgUp');
        }
      } catch (error) {
        setErrorMessage('imgUp');
      } finally {
        setLoading(false);
        setInputFile([]);
      }
    } else {
      setErrorMessage('imgType');
      setInputFile([]);
    }
  };

  const allClientsDataIsFilled = (): boolean => {
    setError({});
    const urlRegex =
      /[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi;
    const regex = new RegExp(urlRegex);

    const usersClients = [newClient];
    const isFilled = usersClients.every((client) => {
      if (!client.name) setErrorMessage('name');
      if (!client.logo) setErrorMessage('img');
      if (!client.website || !client.website.match(regex))
        setErrorMessage('website');

      return (
        client.name &&
        client.logo &&
        client.website &&
        client.website.match(regex)
      );
    });
    return isFilled;
  };

  const handleNewClientData = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const clientData = { ...newClient, [e.target.name]: e.target.value };
    setNewClient(clientData);
  };

  const handleSubmit = () => {
    if (!allClientsDataIsFilled()) return;
    const newClients = [...clients, newClient];
    setClients(newClients);
    setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients }));
    setOpen(false);
    setNewClient({});
    setError({});
  };

  const setErrorMessage = (field: string) => {
    setError((prev: any) => ({ ...prev, [field]: true }));
  };

  const removeImgError = () => {
    setError((prev: any) => ({ ...prev, imgUp: false, imgType: false }));
  };

  const navigateToLink = (link: string) => {
    if (!link) return;

    const regEx = /^http/;
    if (!regEx.test(link)) link = `https://${link}`;
    window.open(link, '_blank');
  };

  return (
    <>
      <div className='grid grid-cols-2 justify-center md:grid-cols-3 w-full mt-2'>
        {clients?.map((client: any, index: string) => (
          <div
            key={index}
            onClick={() => !isEditMode && navigateToLink(client?.website)}
          >
            <Tooltip title={client?.website} placement='top' arrow>
              <div className='flex items-center gap-3 w-fit cursor-pointer'>
                <Badge
                  onClick={(e) => removeClient(e, client?.logo)}
                  className='client-badge'
                  color='error'
                  overlap='circular'
                  badgeContent='-'
                  invisible={!isEditMode}
                >
                  <div>
                    <Image
                      className='rounded-lg h-12 w-12 object-cover'
                      height={100}
                      width={100}
                      src={client?.logo}
                      alt={client?.name}
                    />
                  </div>
                </Badge>
                <p className='text-center text-content'>{client?.name}</p>
              </div>
            </Tooltip>
          </div>
        ))}

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <Box sx={style}>
            {newClient?.logo && !loading ? (
              <label
                htmlFor='client-logo'
                className='w-32 h-32 mx-auto overflow-hidden rounded-xl cursor-pointer relative group'
              >
                <div className='bg-black absolute left-0 right-0 top-0 bottom-0 bg-opacity-50 hidden group-hover:flex justify-center items-center '>
                  <span className='text-white font-bold'>Change Photo</span>
                </div>

                <Image
                  className='w-full h-full object-cover'
                  src={newClient.logo}
                  width={180}
                  height={180}
                  alt=''
                />
              </label>
            ) : (
              <label
                className='w-32 h-32 rounded-xl my-auto text-content border border-content-primary mx-auto hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer'
                htmlFor='client-logo'
              >
                {loading ? (
                  <CircularProgress color='secondary' />
                ) : (
                  <span>Add Logo</span>
                )}
              </label>
            )}
            <p
              className={`text-center mt-2 mb-3 text-sm text-red-500 ${
                error.img || error.imgType || 'invisible'
              }`}
            >
              {error.imgType
                ? 'A valid logo is required. Please try with a PNG/JPG file'
                : 'Image failed to upload.'}
            </p>

            <input
              onChange={(e) => handleLogoUpload(e.target.files)}
              value={inputFile}
              className='hidden'
              id='client-logo'
              type='file'
            />
            <TextField
              onChange={(e) => handleNewClientData(e)}
              id='outlined-basic'
              label='Client Name'
              variant='outlined'
              color='secondary'
              name='name'
              className='!mb-0'
              autoComplete='off'
            />
            <p
              className={`text-center mt-2 mb-3 text-sm text-red-500 ${
                !error.name && 'invisible'
              }`}
            >
              Please fill the Client Name field
            </p>

            <TextField
              onChange={(e) => handleNewClientData(e)}
              id='outlined-basic'
              label='Website Link'
              variant='outlined'
              color='secondary'
              name='website'
              className='!mb-0'
              autoComplete='off'
            />
            <p
              className={`text-center mt-2 mb-3 text-sm text-red-500 ${
                !error.website && 'invisible'
              }`}
            >
              A valid client website link is required
            </p>

            <button
              // disabled={!allClientsDataIsFilled()}
              onClick={handleSubmit}
              className='primary-btn in-dark w-button'
            >
              Submit
            </button>
          </Box>
        </Modal>
      </div>
      {isEditMode && (
        <button
          onClick={() => {
            setOpen(true);
            // addAClient()
          }}
          className='primary-btn in-dark w-button w-3/4 mt-3'
        >
          Add Client
        </button>
      )}
    </>
  );
};

export default Clients;
