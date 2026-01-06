import { useEffect, useState, useRef } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';

export default function Funcionarios() {
  const toast = useRef(null);

  const [lista, setLista] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    data: null,
    telefone: '',
    cpf: '',
    cargo: null,
    senha: '',
    trocarSenha: true
  });

  const cargos = [
    { label: 'Admin', value: 1 },
    { label: 'Médico', value: 2 },
    { label: 'Call Center', value: 3 },
    { label: 'Financeiro', value: 4 }
  ];

  useEffect(() => {
    fetch('http://localhost/api-login/funcionarios.php')
      .then(r => r.json())
      .then(setLista);
  }, []);

  const salvar = async () => {
    if (!form.nome || !form.data || !form.cpf || !form.cargo || !form.senha) {
      toast.current.show({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos obrigatórios',
        life: 3000
      });
      return;
    }

    const res = await fetch('http://localhost/api-login/funcionarios.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.success) {
      toast.current.show({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Funcionário cadastrado com sucesso',
        life: 3000
      });

      setOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <>
      <Toast ref={toast} />

      <Card title="Funcionários">
        <Button
          label="Novo Funcionário"
          icon="pi pi-plus"
          onClick={() => setOpen(true)}
        />

        <DataTable value={lista} className="mt-4" paginator rows={5}>
          <Column field="nome_completo" header="Nome" />
          <Column field="cpf" header="CPF" />
          <Column field="cargo" header="Cargo" />
          <Column field="telefone" header="Telefone" />
        </DataTable>
      </Card>

      <Dialog
        header="Cadastro de Funcionário"
        visible={open}
        style={{ width: '400px' }}
        onHide={() => setOpen(false)}
      >
        <div className="p-fluid">

          <div className="p-field mb-3">
            <InputText
              placeholder="Nome completo"
              value={form.nome}
              required
              onChange={e => setForm({ ...form, nome: e.target.value })}
            />
          </div>

          <div className="p-field mb-3">
            <Calendar
              placeholder="Nascimento"
              value={form.data}
              showIcon
              required
              onChange={e => setForm({ ...form, data: e.value })}
            />
          </div>

          <div className="p-field mb-3">
            <InputText
              placeholder="Telefone"
              value={form.telefone}
              onChange={e => setForm({ ...form, telefone: e.target.value })}
            />
          </div>

          <div className="p-field mb-3">
            <InputText
              placeholder="CPF"
              value={form.cpf}
              required
              onChange={e => setForm({ ...form, cpf: e.target.value })}
            />
          </div>

          <div className="p-field mb-3">
            <Dropdown
              placeholder="Cargo"
              value={form.cargo}
              options={cargos}
              required
              onChange={e => setForm({ ...form, cargo: e.value })}
            />
          </div>

          <div className="p-field mb-4">
            <Password
              placeholder="Senha inicial"
              value={form.senha}
              toggleMask
              required
              onChange={e => setForm({ ...form, senha: e.target.value })}
            />
          </div>

          <Button
            label="Salvar"
            icon="pi pi-check"
            className="w-full"
            onClick={salvar}
          />

        </div>
      </Dialog>
    </>
  );
}
