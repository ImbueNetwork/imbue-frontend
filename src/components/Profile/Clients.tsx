import React, { useState } from 'react';
import fiverrIcon from "@/assets/images/fiverr.png"
import ImbueIcon from "@/assets/svgs/loader.svg"
import { Freelancer } from '@/model';
import { Badge, Box, Modal, TextField, ToggleButton } from '@mui/material';
import Image from 'next/image';
import { uploadPhoto } from '@/utils/imageUpload';

type ClientsProps = {
    setFreelancer: Function;
    isEditMode: boolean;
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
    flexDirection: "column"
};

const Clients = ({ setFreelancer, isEditMode }: ClientsProps) => {
    const [clients, setClients] = useState([
        { id: 1, name: "Fiverr", icon: fiverrIcon, link: "fiverr.com" },
        { id: 2, name: "Imbue", icon: ImbueIcon, link: "fiverr.com" },
    ])

    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = useState<boolean>(false)
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [openAddClient, setOpenAddClient] = useState<boolean>(false)

    const addAClient = () => {
        const newClients = [...clients, { id: Number(clients.length) + 1, name: "Imbue", icon: ImbueIcon, link: "fiverr.com" }]
        setClients(newClients)
        setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients.map((c) => c.name) }))
    }

    const removeClient = (e: any, id: number) => {
        if ((e.target as HTMLElement).nodeName == "SPAN") {
            const newClients = clients.filter((client) => client.id !== id)
            setClients(newClients)
            setFreelancer((prev: Freelancer) => ({ ...prev, clients: newClients.map((c) => c.name) }))
        }
    }

    const handleLogoUpload = async (files : FileList) => {
        if (files?.length) {
            setLoading(true)
            const data = await uploadPhoto(files[0])
            // if (data.url) {
            //     setImage(data.url)
            //     setFreelancer((prev: any) => {
            //         return { ...prev, profile_image: data.url }
            //     })
            // }
        }
    }

    return (
        <div className="grid grid-cols-2 px-[30px] lg:px-[40px] justify-center md:grid-cols-3 gap-5 w-full">
            {
                clients?.map((client) => (
                    <div key={client.id}
                        className="flex items-center gap-3 w-fit mx-auto">
                        <Badge onClick={(e) => removeClient(e, client.id)} className="client-badge" color="error" overlap="circular" badgeContent="-" invisible={!isEditMode}>
                            <div>
                                <Image className="rounded-lg" height={40} width={40} src={client.icon} alt={client.name} />
                                <p>{client.name}</p>
                            </div>
                        </Badge>
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
                    {/* <ToggleButton
                        className="w-32 h-32 mb-5 rounded-full my-auto border-light-white mx-auto hover:bg-light-grey"
                        value="check"
                        selected={openAddClient}
                        onChange={() => {
                            // setOpen(true)
                            // addAClient()
                        }}
                    >
                        <span className="text-2xl text-white capitalize">Add Logo</span>
                    </ToggleButton> */}
                    <label
                        className="w-32 h-32 mb-5 rounded-full my-auto text-white border border-light-white mx-auto hover:border-primary hover:text-primary flex items-center justify-center cursor-pointer"
                        htmlFor="client-logo"
                    >
                        Add Logo
                    </label>
                    <input className='hidden' id='client-logo' type="file" />
                    <TextField id="outlined-basic" label="Client Name" variant="outlined" />
                    <TextField id="outlined-basic" label="Website Link" variant="outlined" />

                </Box>
            </Modal>
        </div>
    );
};

export default Clients;