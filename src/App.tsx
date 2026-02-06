import WellsChaosCalendar from './components/WellsChaosCalendar';
import { AuthProvider } from './providers/AuthProvider';

const App = () => (
  <AuthProvider>
    <WellsChaosCalendar />
  </AuthProvider>
);

export default App;
