import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TabView, TabPanel } from 'primereact/tabview';
import { Button } from 'primereact/button';
import DashboardKPI from '../components/DashboardKPI';
import ProdutosCRUD from '../components/ProdutosCRUD';
import MovimentacaoEstoque from '../components/MovimentacaoEstoque';
import Relatorios from '../components/Relatorios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const themeLink = document.getElementById('theme-link');
    if (themeLink) {
      if (isDark) {
        themeLink.href = 'https://unpkg.com/primereact/resources/themes/lara-dark-cyan/theme.css';
        document.body.style.backgroundColor = '#111827';
        localStorage.setItem('theme', 'dark');
      } else {
        themeLink.href = 'https://unpkg.com/primereact/resources/themes/lara-light-cyan/theme.css';
        document.body.style.backgroundColor = '#f8fafc';
        localStorage.setItem('theme', 'light');
      }
    }
  }, [isDark]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  return (
    <div style={{ padding: '1rem 2rem', minHeight: '100vh', transition: 'all 0.3s' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        padding: '1rem',
        background: isDark ? '#1f2937' : '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <h1 style={{ margin: 0, color: isDark ? '#f3f4f6' : '#334155', fontSize: '1.5rem' }}>
          🚀 Gestão Pro Estoque
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            icon={isDark ? "pi pi-sun" : "pi pi-moon"} 
            onClick={() => setIsDark(!isDark)} 
            className="p-button-rounded p-button-text"
            tooltip="Alternar Tema"
          />
          <Button 
            label="Sair" 
            icon="pi pi-sign-out" 
            onClick={handleLogout} 
            className="p-button-danger p-button-outlined" 
          />
        </div>
      </div>
      
      <TabView>
        <TabPanel header="Dashboard" leftIcon="pi pi-chart-bar mr-2">
          <DashboardKPI />
        </TabPanel>
        <TabPanel header="Produtos" leftIcon="pi pi-box mr-2">
          <ProdutosCRUD />
        </TabPanel>
        <TabPanel header="Movimentação" leftIcon="pi pi-arrows-h mr-2">
          <MovimentacaoEstoque />
        </TabPanel>
        <TabPanel header="Relatórios" leftIcon="pi pi-file mr-2">
          <Relatorios />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Dashboard;