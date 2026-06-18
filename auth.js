// auth.js

var SUPABASE_URL = 'https://tqqbsxustgqjngqpupnt.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxcWJzeHVzdGdxam5ncXB1cG50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MzAwNjAsImV4cCI6MjA5NzMwNjA2MH0.pYYU7Dg_cZ5pYOeX8WsNhW2ZCCffcvpm9iYplQSFWgY';

var permissions = {
  'index.html':     ['admin', 'manager', 'operator'],
  'inventory.html': ['admin', 'manager'],
  'receiving.html': ['admin', 'manager', 'operator'],
  'shipping.html':  ['admin', 'manager', 'operator'],
  'tracking.html':  ['admin', 'manager', 'operator', 'driver'],
  'ai.html':        ['admin', 'manager', 'operator', 'driver'],
  'chat.html': ['admin', 'manager', 'operator', 'driver'],
  'gps.html': ['admin', 'manager'],
  'dock.html': ['admin', 'manager', 'operator'],
  'settings.html':  ['admin'],
  'reports.html':   ['admin', 'manager'],
  'users.html':     ['admin'],
};

var viewOnly = {
  'manager': ['inventory.html', 'receiving.html', 'shipping.html', 'tracking.html']
};

function getUser() {
  var raw = localStorage.getItem('ascent_user');
  return raw ? JSON.parse(raw) : null;
}

function getCurrentPage() {
  return window.location.pathname.split('/').pop() || 'index.html';
}

function checkAuth() {
  var user = getUser();
  var page = getCurrentPage();

  if (!user) {
    window.location.href = 'login.html';
    return null;
  }

  var allowed = permissions[page] || [];
  if (!allowed.includes(user.role)) {
    window.location.href = '404.html';
    return null;
  }

  var viewOnlyPages = viewOnly[user.role] || [];
  if (viewOnlyPages.includes(page)) {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('button').forEach(btn => {
        var text = btn.textContent.toLowerCase();
        if (text.includes('add') || text.includes('delete') ||
            text.includes('confirm') || text.includes('dispatch') ||
            text.includes('new') || text.includes('save')) {
          btn.style.display = 'none';
        }
      });
    });
  }

  return user;
}

function logout() {
  localStorage.removeItem('ascent_user');
  window.location.href = 'login.html';
}

function buildSidebar(user) {
  var page = getCurrentPage();
  var allLinks = [
    { href: 'index.html',     icon: 'ti-layout-dashboard', label: 'Dashboard',      roles: ['admin','manager','operator'] },
    { href: 'inventory.html', icon: 'ti-box',              label: 'Inventory',       roles: ['admin','manager'] },
    { href: 'receiving.html', icon: 'ti-truck',            label: 'Receiving',       roles: ['admin','manager','operator'] },
    { href: 'shipping.html',  icon: 'ti-package-export',   label: 'Shipping',        roles: ['admin','manager','operator'] },
    { href: 'tracking.html',  icon: 'ti-map-pin',          label: 'Order Tracking',  roles: ['admin','manager','operator','driver'] },
    { href: 'ai.html',   icon: 'ti-robot',    label: 'AI Assistant', roles: ['admin','manager','operator','driver'] },
{ href: 'chat.html', icon: 'ti-messages',  label: 'Team Chat',    roles: ['admin','manager','operator','driver'] },
{ href: 'gps.html',  icon: 'ti-map-2',          label: 'GPS Tracking', roles: ['admin','manager'] },
{ href: 'dock.html', icon: 'ti-building-factory', label: 'Dock & Yard',  roles: ['admin','manager','operator'] },
    { href: 'reports.html',   icon: 'ti-file-analytics',   label: 'Reports',         roles: ['admin','manager'] },
    { href: 'users.html',     icon: 'ti-users',            label: 'Manage Users',    roles: ['admin'] },
    { href: 'settings.html',  icon: 'ti-settings',         label: 'Settings',        roles: ['admin'] },
  ];

  var sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = allLinks
    .filter(link => link.roles.includes(user.role))
    .map(link => {
      var active = page === link.href;
      return `<a href="${link.href}" class="flex items-center gap-3 px-5 py-2.5 text-sm
        ${active ? 'text-blue-300 bg-slate-700 border-l-2 border-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}">
        <i class="ti ${link.icon}"></i> ${link.label}
      </a>`;
    }).join('');
}

function buildNav(user) {
  var navUser = document.getElementById('navUser');
  if (!navUser) return;
  var initials = user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  navUser.innerHTML = `
    <span class="text-slate-400 text-xs capitalize">${user.role}</span>
    <div class="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-blue-300 text-xs font-medium">${initials}</div>
    <button onclick="logout()" class="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1">
      <i class="ti ti-logout text-sm"></i>
    </button>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  var sidebar = document.querySelector('aside');
  if (!sidebar) return;

  if (window.innerWidth < 768) {
    sidebar.style.display = 'none';
    var nav = document.querySelector('nav');
    var btn = document.createElement('button');
    btn.innerHTML = '<i class="ti ti-menu-2 text-slate-300 text-xl"></i>';
    btn.className = 'mr-3';
    btn.onclick = () => {
      sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
      sidebar.style.position = 'fixed';
      sidebar.style.top = '56px';
      sidebar.style.left = '0';
      sidebar.style.zIndex = '100';
      sidebar.style.height = '100vh';
    };
    nav.querySelector('div').prepend(btn);
  }
});