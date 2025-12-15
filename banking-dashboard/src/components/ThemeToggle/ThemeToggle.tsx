import { useTheme } from '../../context/ThemeContext';
import { ReactComponent as SunIcon } from './sun.svg';
import { ReactComponent as MoonIcon } from './moon.svg';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="theme-toggle-track">
        <span className="theme-toggle-icon sun">
          <SunIcon />
        </span>
        <span className="theme-toggle-icon moon">
          <MoonIcon />
        </span>
        <span className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`} />
      </span>
    </button>
  );
}
