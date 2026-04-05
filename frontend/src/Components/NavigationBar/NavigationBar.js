import { Link } from 'react-router-dom';
import './NavigationBar.css'; 
import { HOME, INSIGHTS, PROFILE, USERPAGE, PLAYLISTS } from "../../Constants/routes";


function NavigationBar() {
  return (
    <header className='NavigationBar'>
      <nav>
        <ul className='nav-list'>
          <li className='nav-item'>
            <Link to={HOME}>Home</Link>
          </li>
          <li className='nav-item'>
            <Link to={PROFILE }>Profile</Link>
          </li>
          <li className='nav-item'>
            <Link to={USERPAGE}>Data</Link>
          </li>
          <li className='nav-item'>
            <Link to={PLAYLISTS}>Playlists</Link>
          </li>
          <li className='nav-item'>
            <Link to={INSIGHTS}>Insights</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default NavigationBar;
