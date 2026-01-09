import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';

const ImportarXML = ({ onImport }) => {
  const [visible, setVisible] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [selectedProdutos, setSelectedProdutos] = useState([]);
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const categorizarPorNCM = (ncm) => {
    if (!ncm) return 'Outros';
    const codigo = ncm.substring(0, 2);
    
    const categorias = {
      '01-05': 'Alimentos',
      '06-14': 'Alimentos',
      '15-24': 'Alimentos',
      '22': 'Bebidas',
      '28-38': 'Limpeza',
      '33-34': 'Higiene',
      '84-85': 'Eletrônicos',
      '90-92': 'Eletrônicos'
    };

    for (let range in categorias) {
      const [min, max] = range.split('-').map(Number);
      const cod = parseInt(codigo);
      if (cod >= min && cod <= max) return categorias[range];
    }
    
    return 'Outros';
  };
const parseXML = (xmlText) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    const itens = xmlDoc.getElementsByTagName('det');
    const produtosExtraidos = [];

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      
      const prod = item.getElementsByTagName('prod')[0];
      if (!prod) continue;

      const nome = prod.getElementsByTagName('xProd')[0]?.textContent || 'Sem nome';
      const codigo = prod.getElementsByTagName('cEAN')[0]?.textContent || 
                     prod.getElementsByTagName('cProd')[0]?.textContent || '';
      const unidade = prod.getElementsByTagName('uCom')[0]?.textContent || 'UN';
      const quantidadeTexto = prod.getElementsByTagName('qCom')[0]?.textContent || '0';
      const valorTexto = prod.getElementsByTagName('vUnCom')[0]?.textContent || '0';
      const ncm = prod.getElementsByTagName('NCM')[0]?.textContent || '';

      // Converte valores com tratamento de erro
      const quantidade = parseFloat(quantidadeTexto.replace(',', '.')) || 0;
      const valorUnitario = parseFloat(valorTexto.replace(',', '.')) || 0;

      produtosExtraidos.push({
        id: Date.now() + i + Math.random(),
        codigo: codigo,
        nome: nome,
        categoria: categorizarPorNCM(ncm),
        unidadeMedida: unidade.toUpperCase(),
        precoCompra: Number(valorUnitario.toFixed(2)),
        precoVenda: Number((valorUnitario * 1.3).toFixed(2)),
        estoqueMin: 5,
        estoqueMax: 100,
        estoqueAtual: Math.round(quantidade),
        validade: null,
        fornecedor: '',
        fotoUrl: '',
        localizacao: '',
        ncm: ncm
      });
    }

    return produtosExtraidos;
  };

  const onUpload = (event) => {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const produtosExtraidos = parseXML(e.target.result);
        setProdutos(produtosExtraidos);
        setSelectedProdutos(produtosExtraidos);
        toast.current.show({ 
          severity: 'success', 
          summary: 'Sucesso', 
          detail: `${produtosExtraidos.length} produtos encontrados no XML` 
        });
      } catch (error) {
        toast.current.show({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Erro ao processar XML: ' + error.message 
        });
      }
    };

    reader.readAsText(file);
  };

  const importarSelecionados = () => {
    if (selectedProdutos.length === 0) {
      toast.current.show({ 
        severity: 'warn', 
        summary: 'Atenção', 
        detail: 'Selecione ao menos um produto' 
      });
      return;
    }

    console.log('Importando produtos:', selectedProdutos);
    
    if (onImport && typeof onImport === 'function') {
      onImport(selectedProdutos);
      
      toast.current.show({ 
        severity: 'success', 
        summary: 'Importado!', 
        detail: `${selectedProdutos.length} produto(s) importado(s) com sucesso` 
      });
      
      setTimeout(() => {
        setVisible(false);
        setProdutos([]);
        setSelectedProdutos([]);
        if (fileUploadRef.current) {
          fileUploadRef.current.clear();
        }
      }, 1000);
    } else {
      console.error('Função onImport não foi passada corretamente');
      toast.current.show({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: 'Erro ao importar produtos' 
      });
    }
  };

  const priceBodyTemplate = (rowData) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(rowData.precoCompra);
  };

  return (
    <>
      <Toast ref={toast} />
      <Button 
        label="Importar XML" 
        icon="pi pi-upload" 
        className="p-button-info" 
        onClick={() => setVisible(true)} 
      />

      <Dialog 
        visible={visible} 
        style={{ width: '90vw' }} 
        header="📄 Importar Produtos de Nota Fiscal (XML)" 
        modal 
        onHide={() => {
          setVisible(false);
          setProdutos([]);
          setSelectedProdutos([]);
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <FileUpload 
            ref={fileUploadRef}
            mode="basic" 
            name="xmlFile" 
            accept=".xml" 
            maxFileSize={5000000}
            customUpload
            uploadHandler={onUpload}
            auto
            chooseLabel="Selecionar XML da Nota Fiscal"
          />
        </div>

        {produtos.length > 0 && (
          <>
            <p style={{ marginBottom: '1rem', color: '#666', fontWeight: 'bold' }}>
              ✅ Produtos encontrados: {produtos.length}
            </p>
            
            <DataTable 
              value={produtos} 
              selection={selectedProdutos} 
              onSelectionChange={(e) => setSelectedProdutos(e.value)}
              dataKey="id" 
              paginator 
              rows={10}
              responsiveLayout="scroll"
            >
              <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
              <Column field="codigo" header="Código" sortable style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} />
              <Column field="nome" header="Produto" sortable />
              <Column field="unidadeMedida" header="UN" />
              <Column field="categoria" header="Categoria" sortable />
              <Column field="precoCompra" header="Preço" body={priceBodyTemplate} sortable />
              <Column field="estoqueAtual" header="Qtde" sortable />
            </DataTable>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button 
                label="Cancelar" 
                icon="pi pi-times" 
                className="p-button-text p-button-secondary" 
                onClick={() => {
                  setVisible(false);
                  setProdutos([]);
                  setSelectedProdutos([]);
                }} 
              />
              <Button 
                label={`Importar (${selectedProdutos.length})`}
                icon="pi pi-check" 
                className="p-button-success" 
                onClick={importarSelecionados}
                disabled={selectedProdutos.length === 0}
              />
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ImportarXML;