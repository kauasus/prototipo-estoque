import { Menubar } from 'primereact/menubar';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { Button } from 'primereact/button';


export default function TopBar() {
  const navigate = useNavigate();

  const items = [
    {
      label: 'Agenda',
      icon: 'pi pi-calendar',
      command: () => navigate('/agenda')
    },
    {
      label: 'Pacientes',
      icon: 'pi pi-users',
      command: () => navigate('/pacientes')
    },
    {
      label: 'Clínico',
      icon: 'pi pi-file',
      items: [
        {
          label: 'Prontuário',
          icon: 'pi pi-book',
          command: () => navigate('/prontuario')
        },
        {
          label: 'Anamnese',
          icon: 'pi pi-clipboard',
          command: () => navigate('/anamnese')
        }
      ]
    },
    {
      label: 'Financeiro',
      icon: 'pi pi-wallet',
      command: () => navigate('/financeiro')
    },
    {
      label: 'Administração',
      icon: 'pi pi-cog',
      items: [
        {
          label: 'Convênios',
          icon: 'pi pi-briefcase',
          command: () => navigate('/convenios')
        },
        {
          label: 'Funcionários',
          icon: 'pi pi-id-card',
          command: () => navigate('/funcionarios')
        }
      ]
    }
  ];

  const end = (
    <Button
      icon="pi pi-sign-out"
      text
      severity="danger"
      onClick={() => {
        logout();
        navigate('/');
      }}
    />
  );

  return <Menubar model={items} end={end} />;
}
