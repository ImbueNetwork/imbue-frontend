import React, { useState } from 'react';
import fiverrIcon from "@/assets/images/fiverr.png"
import ImbueIcon from "@/assets/svgs/loader.svg"
import { Freelancer } from '@/model';
import { Badge, ToggleButton } from '@mui/material';
import Image from 'next/image';

type ClientsProps ={
    setFreelancer : Function; 
    isEditMode: boolean;
}

const Clients = ({ setFreelancer, isEditMode }: ClientsProps) => {
    const [clients, setClients] = useState([
        { id: 1, name: "Fiverr", icon: fiverrIcon },
        { id: 2, name: "Imbue", icon: ImbueIcon },
    ])

    const [openAddClient, setOpenAddClient] = useState<boolean>(false)

    const addAClient = () => {
        const newClients = [...clients, { id: Number(clients.length) + 1, name: "Imbue", icon: ImbueIcon }]
        setClients(newClients)
        setFreelancer((prev: Freelancer) => {
            return { ...prev, clients: newClients.map((c) => c.name) }
        })
        console.log(newClients);
    }

    const removeClient = (id: number) => {
        const newClients = clients.filter((client) => client.id !== id)
        setClients(newClients)
        setFreelancer((prev: Freelancer) => {
            return { ...prev, clients: newClients.map((c) => c.name) }
        })
    }

    return (
        <div className="grid grid-cols-2 px-[30px] lg:px-[40px] justify-center md:grid-cols-3 gap-5 w-full">
            {
                clients?.map((client) => (
                    <div key={client.id}
                        onClick={() => removeClient(client.id)}
                        className="flex items-center gap-3 w-fit mx-auto">
                        <Badge className="client-badge" color="error" overlap="circular" badgeContent="-" invisible={!isEditMode}>
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
                        className="w-11 h-11 my-auto borde border-light-white mx-auto"
                        value="check"
                        selected={openAddClient}
                        onChange={() => {
                            addAClient()
                        }}
                    >
                        <span className="text-2xl text-white">+</span>
                    </ToggleButton>
                )
            }
        </div>
    );
};

export default Clients;