import React, { ChangeEvent, useState } from 'react';
import { Freelancer } from '@/model';
import { Badge, Box, CircularProgress, Modal, TextField, ToggleButton, Tooltip } from '@mui/material';
import Image from 'next/image';
import { uploadPhoto } from '@/utils/imageUpload';
import SuccessScreen from '../SuccessScreen';
import ErrorScreen from '../ErrorScreen';
import { useRouter } from 'next/router';

type ClientsProps = {
    setFreelancer: Function;
    isEditMode: boolean;
    setIsEditMode: Function;
    clients: any;
    setClients: Function
}

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "50%",
    bgcolor: '#1a1a19',
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    outline: 'none'
};

const Clients = ({ setFreelancer, isEditMode, setIsEditMode, clients, setClients }: ClientsProps) => {


    const [newClient, setNewClient] = useState<any>({})

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState<boolean>(false)
    const handleClose = () => setOpen(false);

    const [openAddClient, setOpenAddClient] = useState<boolean>(false)

    const removeClient = (e: any, id: number) => {
        if ((e.target as HTMLElement).nodeName == "SPAN") {
            const newClients = clients.filter((client: any) => client.id !== id)
            setClients(newClients)
            setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients.map((c: any) => c.name) }))
        }
    }

    const handleLogoUpload = async (files: FileList | null) => {
        if (files?.length) {
            setLoading(true)
            try {
                const data = await uploadPhoto(files[0])
                if (data.url) {
                    setNewClient((prev: any) => {
                        return { ...prev, logo: data.url }
                    })
                }
            } catch (error) {
                console.log(error);
            }
            finally {
                setLoading(false)
            }
        }
    }

    const handleNewClientData = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const clientData = { ...newClient, [e.target.name]: e.target.value }
        setNewClient(clientData)
    }

    const handleSubmit = () => {
        const newClients = [...clients, newClient]
        setClients(newClients)
        setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients.map((c) => c.name) }))
        setOpen(false)
    }


    return (
        <div className="grid grid-cols-2 px-[30px] lg:px-[40px] justify-center md:grid-cols-3 gap-5 w-full">
            {
                clients?.map((client: any) => (
                    <div key={client.id}>
                        <Tooltip title={client.website} placement="top" arrow>
                            <div className="flex flex-col items-center gap-3 w-fit mx-auto">
                                <Badge onClick={(e) => removeClient(e, client.id)} className="client-badge" color="error" overlap="circular" badgeContent="-" invisible={!isEditMode}>
                                    <div>
                                        <Image className="rounded-lg" height={40} width={40} src={client.logo} alt={client.name} />
                                    </div>
                                </Badge>
                                <p>{client.name}</p>
                            </div>
                        </Tooltip>

                    </div>
                ))
            }
            {
                isEditMode && (
                    <ToggleButton
                        className="w-11 h-11 my-auto border-light-white mx-auto"
                        value="check"
                        selected={openAddClient}
                        onChange={() => {
                            setOpen(true)
                            // addAClient()
                        }}
                    >
                        <span className="text-2xl text-white">+</span>
                    </ToggleButton>
                )
            }

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    {
                        newClient?.logo
                            ? (
                                <label
                                    htmlFor="client-logo"
                                    className='w-32 h-32 mx-auto overflow-hidden rounded-xl mb-5 cursor-pointer relative group'
                                >
                                    <div className='bg-black absolute left-0 right-0 top-0 bottom-0 bg-opacity-50 hidden group-hover:flex justify-center items-center '>
                                        <span className='text-white font-bold'>Change Photo</span>
                                    </div>

                                    <Image className='w-full object-cover' src={newClient.logo} width={180} height={180} alt='' />
                                </label>
                            )
                            : (
                                <label
                                    className="w-32 h-32 mb-5 rounded-xl my-auto text-white border border-light-white mx-auto hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer"
                                    htmlFor="client-logo"
                                >
                                    {
                                        loading
                                            ? <CircularProgress color="primary" />
                                            : <span>Add Logo</span>
                                    }
                                </label>
                            )
                    }


                    <input onChange={(e) => handleLogoUpload(e.target.files)} className='hidden' id='client-logo' type="file" />
                    <TextField onChange={(e) => handleNewClientData(e)} id="outlined-basic" label="Client Name" variant="outlined" name='name' />
                    <TextField onChange={(e) => handleNewClientData(e)} id="outlined-basic" label="Website Link" variant="outlined" name='website' />
                    <button onClick={handleSubmit} className='primary-btn in-dark w-button'>Submit</button>

                </Box>
            </Modal>
        </div>
    );
};

export default Clients;