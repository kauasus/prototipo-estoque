import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';

export default function Agenda() {
  const [medicos, setMedicos] = useState([]);
  const [medico, setMedico] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost/api-login/medicos.php')
      .then(res => res.json())
      .then(setMedicos);
  }, []);

  return (
    <Card title="Agenda Médica">
      <Dropdown
        value={medico}
        options={medicos}
        optionLabel="nome"
        placeholder="Selecione o médico"
        className="w-full mb-3"
        onChange={(e) => setMedico(e.value)}
      />

      <Calendar
        value={data}
        onChange={(e) => setData(e.value)}
        inline
      />

      <Button
        label="Agendar Consulta"
        icon="pi pi-check"
        className="mt-3 w-full"
      />
    </Card>
  );
}
