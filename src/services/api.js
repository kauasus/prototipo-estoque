import { Menu } from 'primereact/menu';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();

  const items = [
    {
      label: 'Agenda',
      icon: 'pi pi-calendar',
      command: () => navigate('/dashboard')
    },
    {
      label: 'Agendamentos',
      icon: 'pi pi-list',
      command: () => navigate('/agendamentos')
    },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => {
        localStorage.removeItem('logged');
        navigate('/');
      }
    }
  ];

  return <Menu model={items} className="sidebar" />;
}
