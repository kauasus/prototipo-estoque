import React from 'react';
import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

const Topbar = () => {
    const navigate = useNavigate();

    const items = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => navigate('/')
        },
        {
            label: 'Agendar Consulta',
            icon: 'pi pi-calendar-plus',
            command: () => navigate('/agendamentos')
        },
        {
            label: 'Financeiro',
            icon: 'pi pi-dollar',
            command: () => navigate('/financeiro')
        },
        {
            label: 'Cadastros',
            icon: 'pi pi-user-edit',
            items: [
                { 
                    label: 'Médicos', 
                    icon: 'pi pi-user-plus',
                    command: () => navigate('/funcionarios/medicos') 
                },
                { 
                    label: 'Call Center', 
                    icon: 'pi pi-phone',
                    command: () => navigate('/funcionarios/call-center') 
                },
                { 
                    label: 'Financeiro (Staff)', 
                    icon: 'pi pi-wallet',
                    command: () => navigate('/funcionarios/financeiro') 
                }
            ]
        }
    ];

    const start = <h3 style={{ margin: '0 1rem 0 0', color: '#333' }}>ClínicaSys</h3>;
    
    // Botão de sair apenas visual por enquanto
    const end = <Button icon="pi pi-power-off" rounded text severity="danger" aria-label="Sair" />;

    return (
        <div className="layout-topbar">
            <Menubar model={items} start={start} end={end} style={{ border: 'none', borderRadius: 0 }} />
        </div>
    );
};

export default Topbar;