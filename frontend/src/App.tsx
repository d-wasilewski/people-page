import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PeoplePage from './pages/PeoplePage';
import { Sheet } from '@mui/joy';

function App() {
  return (
    <Sheet sx={{ minHeight: '100vh', padding: 2 }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PeoplePage />} />
        </Routes>
      </BrowserRouter>
    </Sheet>
  );
}

export default App;
