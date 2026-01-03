import { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';

export default function Dashboard() {
  const [medicos, setMedicos] = useState([]);
  const [medico, setMedico] = useState(null);
  const [data, setData] = useState(null);
  const [hora, setHora] = useState(null);

  const horarios = [
    '08:00', '09:00', '10:00',
    '14:00', '15:00', '16:00'
  ];

  useEffect(() => {
    fetch('http://localhost/api-login/medicos.php')
      .then(res => res.json())
      .then(setMedicos);
  }, []);

  return (
    <Card title="Agenda Médica" className="dashboard-card">

      <Dropdown
        value={medico}
        options={medicos}
        optionLabel="nome"
        placeholder="Selecione o médico"
        className="w-full mb-3"
        onChange={(e) => setMedico(e.value)}
      />

      {medico && (
        <small className="p-text-secondary">
          Especialidade: {medico.especialidade}
        </small>
      )}

      <Calendar
        value={data}
        onChange={(e) => setData(e.value)}
        inline
        className="mt-3"
        disabledDays={[0]} // domingo bloqueado
      />

      <Dropdown
        value={hora}
        options={horarios}
        placeholder="Horário"
        className="w-full mt-3"
        onChange={(e) => setHora(e.value)}
      />

      <Button
        label="Confirmar Agendamento"
        icon="pi pi-check"
        className="w-full mt-3"
      />
    </Card>
  );
}
