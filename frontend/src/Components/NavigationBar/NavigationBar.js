import { NavLink } from 'react-router-dom';
import { HOME, PROFILE, USERPAGE, PLAYLISTS, ABOUT } from '../../Constants/routes';
import './NavigationBar.css';

const NAV_LINKS = [
  { to: HOME,      label: 'Home'      },
  { to: PROFILE,   label: 'Profile'   },
  { to: USERPAGE,  label: 'Data'      },
  { to: PLAYLISTS, label: 'Playlists' },
  { to: ABOUT,     label: 'About'  },
];

function NavigationBar() {
  return (
    <header className="NavigationBar">
      <nav aria-label="Main navigation">
        <ul className="nav-list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to} className="nav-item">
              <NavLink
                to={to}
                className={({ isActive }) => isActive ? 'active' : undefined}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default NavigationBar;