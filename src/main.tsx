import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/playful.css';
import './styles/fun-theme.css';
import './styles/phase25.css';
import { initFunFx } from './utils/funFx';

initFunFx();

createRoot(document.getElementById('root')!).render(<App />);
