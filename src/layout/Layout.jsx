import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import './layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <TopBar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
