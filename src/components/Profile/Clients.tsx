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

  // const [openAddClient] = useState<boolean>(false)

  const removeClient = (e: any, logo: string) => {
    if ((e.target as HTMLElement).nodeName == 'SPAN') {
      const newClients = clients.filter((client: any) => client.logo !== logo);
      setClients(newClients);
      setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients }));
    }
  };

  const handleLogoUpload = async (files: FileList | null) => {
    if (files?.length) {
      setLoading(true);
      try {
        const data = await uploadPhoto(files[0]);
        if (data.url) {
          setNewClient((prev: any) => {
            return { ...prev, logo: data.url };
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const allClientsDataIsFilled = (): boolean => {
    const usersClients = [newClient];
    const isFilled = usersClients.every((client) => {
      return client.name && client.logo && client.website;
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
    const newClients = [...clients, newClient];
    setClients(newClients);
    setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients }));
    setOpen(false);
    setNewClient({});
  };

  return (
    <>
      <div className='grid grid-cols-2 justify-center md:grid-cols-3 w-full mt-2'>
        {clients?.map((client: any, index: string) => (
          <div key={index}>
            <Tooltip title={client?.website} placement='top' arrow>
              <div className='flex items-center gap-3 w-fit'>
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
            {newClient?.logo ? (
              <label
                htmlFor='client-logo'
                className='w-32 h-32 mx-auto overflow-hidden rounded-xl mb-5 cursor-pointer relative group'
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
                className='w-32 h-32 mb-5 rounded-xl my-auto text-content border border-content-primary mx-auto hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer'
                htmlFor='client-logo'
              >
                {loading ? (
                  <CircularProgress color='secondary' />
                ) : (
                  <span>Add Logo</span>
                )}
              </label>
            )}

            <input
              onChange={(e) => handleLogoUpload(e.target.files)}
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
            />
            <TextField
              onChange={(e) => handleNewClientData(e)}
              id='outlined-basic'
              label='Website Link'
              variant='outlined'
              color='secondary'
              name='website'
            />
            <button
              disabled={!allClientsDataIsFilled()}
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
