import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FiGrid, FiFileText, FiImage, FiUsers, FiShoppingBag, FiBriefcase, FiSettings, FiLogOut, FiChevronLeft, FiLayers, FiChevronDown, FiChevronUp, FiGlobe, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import './AdminSidebar.css';

const AdminSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/admin/settings'));
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    if (location.pathname.startsWith('/admin/settings')) {
      setSettingsOpen(true);
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
    { path: '/admin/orders', icon: <FiShoppingBag />, label: 'Pesanan' },
    { path: '/admin/blog', icon: <FiFileText />, label: 'Blog' },
    { path: '/admin/portfolio', icon: <FiImage />, label: 'Portfolio' },
    { path: '/admin/team', icon: <FiUsers />, label: 'Tim' },
    { path: '/admin/services', icon: <FiLayers />, label: 'Layanan' },
    { path: '/admin/hr', icon: <FiBriefcase />, label: 'HR' },
    { 
      path: '/admin/settings', 
      icon: <FiSettings />, 
      label: 'Pengaturan',
      isDropdown: true,
      subItems: [
        { path: '/admin/settings?tab=site', icon: <FiGlobe />, label: 'Situs', activeCheck: (loc) => loc.pathname === '/admin/settings' && (new URLSearchParams(loc.search).get('tab') === 'site' || !new URLSearchParams(loc.search).get('tab')) },
        { path: '/admin/settings?tab=account', icon: <FiUser />, label: 'Akun', activeCheck: (loc) => loc.pathname === '/admin/settings' && new URLSearchParams(loc.search).get('tab') === 'account' }
      ]
    }
  ];

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <img src={logoImg} alt="Propscode Logo" style={{ height: '32px', width: 'auto', display: collapsed ? 'none' : 'block' }} />
          {collapsed && <span className="brand-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '32px', width: '32px' }}>P</span>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          <FiChevronLeft className={collapsed ? 'rotated' : ''} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          if (item.isDropdown) {
            const isParentActive = location.pathname.startsWith(item.path);
            return (
              <div key={item.path} className={`sidebar-dropdown-group ${isParentActive ? 'active-group' : ''}`}>
                <button
                  type="button"
                  className={`sidebar-link ${isParentActive ? 'active' : ''}`}
                  onClick={() => {
                    if (collapsed) {
                      navigate('/admin/settings?tab=site');
                    } else {
                      setSettingsOpen(!settingsOpen);
                    }
                  }}
                  title={collapsed ? item.label : ''}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  {!collapsed && <span className="sidebar-label">{item.label}</span>}
                  {!collapsed && (
                    <span className="dropdown-arrow" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                      {settingsOpen ? <FiChevronUp /> : <FiChevronDown />}
                    </span>
                  )}
                </button>
                {settingsOpen && !collapsed && (
                  <div className="sidebar-submenu">
                    {item.subItems.map((sub) => {
                      const isActive = sub.activeCheck(location);
                      return (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={`sidebar-sublink ${isActive ? 'active' : ''}`}
                        >
                          <span className="sidebar-subicon">{sub.icon}</span>
                          <span className="sidebar-sublabel">{sub.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span className="sidebar-label">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="sidebar-avatar"><FiUsers /></div>
            <div>
              <p className="sidebar-username">{user.name}</p>
              <p className="sidebar-role">{user.role}</p>
            </div>
          </div>
        )}
        <button className="sidebar-link logout-btn" onClick={handleLogout} title="Keluar">
          <span className="sidebar-icon"><FiLogOut /></span>
          {!collapsed && <span className="sidebar-label">Keluar</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

